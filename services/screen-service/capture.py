import os
import base64
import asyncio
from io import BytesIO
from typing import Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import mss

app = FastAPI(title="RIME Screen Capture Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration from environment
CAPTURE_INTERVAL = int(os.getenv("CAPTURE_INTERVAL", "3000")) / 1000  # Convert to seconds
SCREENSHOT_QUALITY = int(os.getenv("SCREENSHOT_QUALITY", "85"))
MAX_SCREENSHOTS = int(os.getenv("MAX_SCREENSHOTS", "50"))
ENABLE_MOCK = os.getenv("ENABLE_MOCK", "false").lower() == "true"

# In-memory storage
screenshot_buffer = []

class ScreenCaptureService:
    """Handle screen capture operations"""
    
    def __init__(self):
        self.sct = None
        if not ENABLE_MOCK:
            try:
                self.sct = mss.mss()
            except Exception as e:
                print(f"Warning: Could not initialize screen capture: {e}")
                print("Falling back to mock mode")
    
    def capture_screen(self) -> Optional[dict]:
        """Capture current screen"""
        if ENABLE_MOCK or not self.sct:
            return self._create_mock_capture()
        
        try:
            # Capture the primary monitor
            monitor = self.sct.monitors[1]  # Index 0 is all monitors combined
            screenshot = self.sct.grab(monitor)
            
            # Convert to PIL Image
            img = Image.frombytes("RGB", screenshot.size, screenshot.rgb)
            
            # Compress and encode
            buffer = BytesIO()
            img.save(buffer, format="JPEG", quality=SCREENSHOT_QUALITY, optimize=True)
            image_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            capture = {
                "id": f"capture_{int(asyncio.get_event_loop().time() * 1000)}",
                "timestamp": int(asyncio.get_event_loop().time() * 1000),
                "imageData": image_data,
                "width": screenshot.width,
                "height": screenshot.height
            }
            
            # Add to buffer
            screenshot_buffer.append(capture)
            if len(screenshot_buffer) > MAX_SCREENSHOTS:
                screenshot_buffer.pop(0)
            
            return capture
            
        except Exception as e:
            print(f"Error capturing screen: {e}")
            return self._create_mock_capture()
    
    def _create_mock_capture(self) -> dict:
        """Create mock capture for testing"""
        # Create a simple colored image for mock
        img = Image.new('RGB', (1920, 1080), color=(30, 30, 30))
        buffer = BytesIO()
        img.save(buffer, format="JPEG", quality=SCREENSHOT_QUALITY)
        image_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return {
            "id": f"mock_capture_{int(asyncio.get_event_loop().time() * 1000)}",
            "timestamp": int(asyncio.get_event_loop().time() * 1000),
            "imageData": image_data,
            "width": 1920,
            "height": 1080
        }

# Initialize service
capture_service = ScreenCaptureService()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "mock_mode": ENABLE_MOCK,
        "has_display": capture_service.sct is not None,
        "config": {
            "interval": CAPTURE_INTERVAL,
            "quality": SCREENSHOT_QUALITY,
            "max_screenshots": MAX_SCREENSHOTS
        }
    }

@app.post("/capture")
async def capture_now():
    """Manually trigger a screen capture"""
    capture = capture_service.capture_screen()
    if capture:
        return {"success": True, "data": capture}
    return {"success": False, "error": "Failed to capture screen"}

@app.get("/capture/latest")
async def get_latest():
    """Get the most recent screenshot"""
    if screenshot_buffer:
        return {"success": True, "data": screenshot_buffer[-1]}
    
    # If buffer is empty, capture now
    capture = capture_service.capture_screen()
    return {"success": True, "data": capture}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time screen streaming"""
    await websocket.accept()
    
    try:
        while True:
            # Capture screen
            capture = capture_service.capture_screen()
            
            if capture:
                # Send to client
                await websocket.send_json({
                    "event": "screen:capture",
                    "data": capture
                })
            
            # Wait for next interval
            await asyncio.sleep(CAPTURE_INTERVAL)
            
    except WebSocketDisconnect:
        print("Client disconnected from screen stream")
    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
