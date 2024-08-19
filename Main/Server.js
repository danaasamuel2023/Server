const http = require('http');
const app = require('./app'); // Express app
const setupSocketIo = require('./Socket');

const server = http.createServer(app);
setupSocketIo(server);

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
