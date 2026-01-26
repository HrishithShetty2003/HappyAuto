from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.api import admin
from app.core.database import create_tables
from app.models import user, driver, customer, delivery  # ensure models are loaded
import json



# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"✅ User {user_id} connected. Active connections: {len(self.active_connections)}")
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"❌ User {user_id} disconnected. Active connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except Exception as e:
                print(f"Error sending message to {user_id}: {e}")
    
    async def broadcast(self, message: dict):
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to {user_id}: {e}")

# Create manager instance
manager = ConnectionManager()

app = FastAPI(
    title="HappyAuto API",
    description="AI-Powered Auto Delivery Platform",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    create_tables()
    print("✅ Database tables created!")

# CORS setup (keep your existing code)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Include API routes
app.include_router(api_router)
app.include_router(admin.router)


# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type", "unknown")
                
                # Handle different message types
                if message_type == "ping":
                    await manager.send_personal_message({
                        "type": "pong",
                        "message": "WebSocket is working!",
                        "user_id": user_id
                    }, user_id)
                
                elif message_type == "location_update":
                    lat = message_data.get("lat")
                    lng = message_data.get("lng")
                    print(f"📍 User {user_id} location: {lat}, {lng}")
                    
                    # Echo back with acknowledgment
                    await manager.send_personal_message({
                        "type": "location_ack",
                        "lat": lat,
                        "lng": lng,
                        "timestamp": "2024-01-01T12:00:00"  # Use datetime in real app
                    }, user_id)
                
                else:
                    # Echo the message back
                    await manager.send_personal_message({
                        "type": "echo",
                        "original_message": message_data,
                        "user_id": user_id
                    }, user_id)
                    
            except json.JSONDecodeError:
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format"
                }, user_id)
                
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(user_id)

# Your existing routes
@app.get("/")
def read_root():
    return {"message": "🚗 HappyAuto API is running!"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "HappyAuto API"}

@app.get("/api/demo/drivers")
def get_demo_drivers():
    """Return demo drivers for frontend"""
    return [
        {
            "id": 1,
            "name": "Ramesh Kumar",
            "status": "available",
            "location": "MG Road",
            "vehicle": "Auto KA-01-AB-1234",
            "rating": 4.5,
            "earnings": "₹2,500 today"
        },
        {
            "id": 2,
            "name": "Suresh Patel",
            "status": "busy",
            "location": "Koramangala",
            "vehicle": "Auto KA-01-CD-5678",
            "rating": 4.2,
            "earnings": "₹1,800 today"
        },
        {
            "id": 3,
            "name": "Mahesh Reddy",
            "status": "available",
            "location": "Indiranagar",
            "vehicle": "Auto KA-01-EF-9012",
            "rating": 4.8,
            "earnings": "₹3,100 today"
        }
    ]

@app.post("/api/demo/book")
def book_delivery(data: dict):
    """Simulate booking a delivery"""
    driver_name = data.get("driver_name", "Unknown")
    return {
        "success": True,
        "message": f"Delivery booked with {driver_name}!",
        "eta": "15 minutes",
        "booking_id": "BOOK_" + str(hash(driver_name))[:8]
    }


