import { io } from 'socket.io-client';

const testWebSocketConnection = async () => {
  console.log('🔌 Testing WebSocket Connection...');
  
  const socket = io('http://localhost:5000', {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    timeout: 10000,
    forceNew: true,
    reconnection: false // Disable auto-reconnection for testing
  });

  // Test connection
  socket.on('connect', () => {
    console.log('✅ WebSocket connected successfully!');
    console.log('Socket ID:', socket.id);
    console.log('Transport:', socket.io.engine.transport.name);
    
    // Test joining a room
    socket.emit('join-appointment-room', 'test-appointment-123');
    console.log('📝 Joined appointment room: test-appointment-123');
    
    // Test leaving a room
    setTimeout(() => {
      socket.emit('leave-appointment-room', 'test-appointment-123');
      console.log('📝 Left appointment room: test-appointment-123');
      
      // Disconnect after testing
      setTimeout(() => {
        socket.disconnect();
        console.log('🔌 Disconnected from WebSocket');
        process.exit(0);
      }, 1000);
    }, 2000);
  });

  // Test connection error
  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection failed:', error.message);
    console.error('Error details:', error);
    
    // Check if server is running
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure the server is running on port 5000');
    console.log('2. Check if CORS is properly configured');
    console.log('3. Verify the Socket.IO path is correct');
    console.log('4. Check firewall settings');
    
    process.exit(1);
  });

  // Test disconnection
  socket.on('disconnect', (reason) => {
    console.log('🔌 WebSocket disconnected:', reason);
  });

  // Test timeout
  setTimeout(() => {
    if (!socket.connected) {
      console.error('❌ WebSocket connection timed out');
      console.log('\n🔍 Possible issues:');
      console.log('1. Server not running');
      console.log('2. Port 5000 not accessible');
      console.log('3. Network connectivity issues');
      console.log('4. Firewall blocking connection');
      process.exit(1);
    }
  }, 15000);
};

// Run the test
testWebSocketConnection().catch(console.error); 