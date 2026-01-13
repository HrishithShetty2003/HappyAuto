import asyncio
import websockets
import json

async def test_websocket():
    print("Testing WebSocket connection...")
    
    user_id = "test_user_123"
    uri = f"ws://127.0.0.1:8000/ws/{user_id}"
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"✅ Connected to {uri}")
            
            # Send a test message
            test_message = {"type": "ping", "message": "Hello WebSocket!"}
            await websocket.send(json.dumps(test_message))
            print(f"📤 Sent: {test_message}")
            
            # Receive response
            response = await websocket.recv()
            print(f"📥 Received: {response}")
            
            # Send another message
            await websocket.send(json.dumps({"type": "test", "data": "Some data"}))
            response = await websocket.recv()
            print(f"📥 Received: {response}")
            
    except Exception as e:
        print(f"❌ WebSocket error: {e}")

if __name__ == "__main__":
    # Install websockets first: pip install websockets
    asyncio.run(test_websocket())