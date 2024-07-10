const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

app.use(bodyParser.json());
app.set('view engine', 'ejs');

let sensorData = {
  battery:"0",
  load: "OFF"
};

app.post('/data', (req, res) => {
  console.log(req.body);
  if (req.body.battery !== undefined && req.body.load !== undefined) {
    sensorData.battery = req.body.battery;
    sensorData.load = req.body.load;
  }
  else
  {
    console.log("interrupt");
  }
  io.emit('updateData', sensorData);
  res.send('Data received');
});

app.get('/', (req, res) => {
  res.render('index', { data: sensorData });
});

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.emit('updateData', sensorData); // Send the initial data to the new client
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
