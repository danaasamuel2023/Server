const socketIo = require('socket.io');

const setupSocketIo = (server) => {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('sendMessage', (message) => {
      io.emit('message', message); // Broadcast message to all clients
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

module.exports = setupSocketIo;
