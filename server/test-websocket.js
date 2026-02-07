// Test script to verify WebSocket connection
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

async function testWebSocket() {
  try {
    console.log('Testing WebSocket connection...');
    
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      path: '/socket.io/',
      timeout: 10000,
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully!');
      console.log('Socket ID:', socket.id);
      socket.disconnect();
    });

    socket.on('connect_error', (error) => {
      console.log('❌ WebSocket connection failed:');
      console.log('Error:', error.message);
      socket.disconnect();
    });

    socket.on('error', (error) => {
      console.log('❌ WebSocket error:');
      console.log('Error:', error);
      socket.disconnect();
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (socket.connected) {
        console.log('✅ WebSocket test completed successfully');
      } else {
        console.log('❌ WebSocket test timed out');
      }
      socket.disconnect();
      process.exit(0);
    }, 10000);

  } catch (error) {
    console.error('❌ WebSocket test failed:', error.message);
    process.exit(1);
  }
}

// Test the WebSocket connection
testWebSocket(); 