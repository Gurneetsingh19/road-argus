from flask import Flask
from flask_socketio import SocketIO, emit
import base64, cv2, numpy as np
from ultralytics import YOLO
import threading
import time

app = Flask(__name__)
socketio = SocketIO(app, async_mode='threading', cors_allowed_origins="*")

# Load model once
model = YOLO("../model/best_new.pt")

# Shared frame buffer (only latest frame kept)
latest_frame = None
lock = threading.Lock()


# =========================================
# Receive Frames from Frontend
# =========================================
@socketio.on('frame')
def handle_frame(data):
    global latest_frame
    
    try:
        img_data = base64.b64decode(data.split(',')[1])
        np_img = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        # Store only the most recent frame
        with lock:
            latest_frame = frame

    except Exception as e:
        print("Frame decode error:", e)


# =========================================
# Background Loop — Only Runs on NEW frames
# =========================================
def inference_loop():
    global latest_frame

    while True:
        frame = None

        # Only lock for grabbing one frame
        with lock:
            if latest_frame is not None:
                frame = latest_frame
                latest_frame = None  # consume frame

        # No frame available → sleep and continue
        if frame is None:
            time.sleep(0.005)
            continue

        # YOLO Inference
        results = model(frame, verbose=False)
        r = results[0]

        annotated = r.plot()
        _, jpeg = cv2.imencode('.jpg', annotated)

        height, width = annotated.shape[:2]
        mid_x = width // 2
        command = ""

        # No masks → no potholes → no command
        if r.masks is None:
            send_result(jpeg, command)
            continue

        pothole_data = []
        polys = r.masks.xy  # Local reference (faster)

        for poly in polys:
            poly = np.array(poly, dtype=np.int32)

            # Compute area via OpenCV
            area = cv2.contourArea(poly)

            # Centroid
            M = cv2.moments(poly)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
            else:
                cx, cy = poly[0]  # fallback

            pothole_data.append({
                'area': area,
                'centroid': (cx, cy),
                'side': "left" if cx < mid_x else "right"
            })

        # ================================
        # Decision Logic (Optimized)
        # ================================
        vertical_75 = int(height * 0.75)
        potholes_in_75 = sum(1 for p in pothole_data if p['centroid'][1] <= vertical_75)

        # CASE 3 – Too many potholes → slow
        if potholes_in_75 >= 3:
            command = "slow"

        else:
            left_area = sum(p['area'] for p in pothole_data if p['side'] == "left")
            right_area = sum(p['area'] for p in pothole_data if p['side'] == "right")

            if left_area == 0 and right_area > 0:
                command = "left"
            elif right_area == 0 and left_area > 0:
                command = "right"
            else:
                # More danger → go opposite direction
                command = "left" if left_area > right_area else "right"

        send_result(jpeg, command)


# =========================================
# Emit Back to Frontend
# =========================================
def send_result(jpeg_bytes, command):
    encoded = base64.b64encode(jpeg_bytes).decode("utf-8")

    socketio.emit("processed", {
        "frame": f"data:image/jpeg;base64,{encoded}",
        "command": command
    })


# Start thread
socketio.start_background_task(inference_loop)


# =========================================
# Run App
# =========================================
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
