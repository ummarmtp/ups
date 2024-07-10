const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const { time } = require('console');
process.env.TZ = 'Asia/Dubai'
'Asia/Dubai'

var lastseen=new Date();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
let sensorData = {
  battery:"0",
  load: "OFF",
  status:"OFFLINE",
  lastonline:""
};

var m=true;

app.post('/data', (req, res) => {
  console.log(req.body);
  if (req.body.battery !== undefined && req.body.load !== undefined) {
    sensorData.battery = req.body.battery;
    sensorData.load = req.body.load;
    m=false;
    lastseen=new Date();
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

setInterval(updateLastseen, 1000);
function updateLastseen()
{
  var time = new Date();
  var mins = parseInt(time.getMinutes()) - parseInt(lastseen.getMinutes());
  if (Math.abs(mins) < 1 && m == false) {
    sensorData.status = "Online";
    sensorData.lastonline=dateAndtimeString();
    
  }
  else {
    //   var day = lastseen.getDate();
    //   var month = lastseen.getMonth();
    //   var year = lastseen.getFullYear();
    //   var hour = lastseen.getHours();
    //   var min = lastseen.getMinutes();
    //   day=strLen(day);
    //   month=month+1;
    //  month= strLen(month);
    //   min=strLen(min);
    //   min=strLen(hour);
      //sensorData.status = hour + ":" + min + "  " + day + "/" +month  + "/" + year;
      //sensorData.lastonline = hour + ":" + min + "  " + day + "/" +month  + "/" + year;
      sensorData.status=dateAndtimeString();
      sensorData.lastonline=dateAndtimeString();
      m = true;
  }
  socket.emit('updateData', sensorData);

}

function strLen(data) {
  var value=data.toString().length;
  if(value==1)
  {
      return "0"+data
  }
  else{
      return data
  }
}

function dateAndtimeString()
{
  var day1 = lastseen.getDate();
      var month1 = lastseen.getMonth();
      var year1 = lastseen.getFullYear();
       var hour1 = lastseen.getHours();
       var min1 = lastseen.getMinutes();
      day1=strLen(day1);
      month1=month1+1;
     month1= strLen(month1);
     min1=strLen(min1);
      hour1=strLen(hour1);
      var output=hour1 + ":" + min1 + "  " + day1 + "/" +month1  + "/" + year1;
      return output;
}


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
