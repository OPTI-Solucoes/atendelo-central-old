const {app, BrowserWindow} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

var mongo = require('mongodb').MongoClient;
// var path = require('path');
// var express = require('express');
// var express_app = express();
// var server = require('http').createServer(express_app);
var server = require('http').createServer();
var io = require('socket.io')(server);
var consumers = require("./consumers.js");

var box = io.of('/box');
var monitor = io.of('/monitor');
var totem = io.of('/totem');

var db;

var sockets = {
  box: box,
  monitor: monitor,
  totem: totem
};

var url_db = "mongodb://localhost:27017/localdb";

mongo.connect(url_db, function(err, db_){
  if (err) {throw err;}
  console.log("Connected to the Database...");

  db = db_;

  verificar(db);
  setInterval(function() {
    verificar(db);
  }, 10000);

  db.createCollection("historico", function(err, res){
    if (err) {console.log(err);}
    else {console.log("Table can be writted...");}
  });

  db.createCollection("fila", function(err, res){
    if (err) {console.log(err);}
    else {console.log("Table can be writted...");}
  });

  // db.collection("senha").updateMany({}, {'$set' : {'atendida': false }}, function(err, res) {
  //   if (err) {throw err};
  //   console.log(res.matchedCount);
  // });

  // db.close();
});

io.on('connection', function(client){
  console.log('user connected');

  client.on("disconnect", function(){
    console.log("Disconnect");
    // io.emit("update", clients[client.id] + " has left the server.");
    // delete clients[client.id];
  });
});

box.on('connection', function(client){
  console.log('user connected to Box');

  client.on("disconnect", function(){
    console.log("Disconnect from Box");
    // io.emit("update", clients[client.id] + " has left the server.");
    // delete clients[client.id];
  });

  client.on("proxima_senha", function(incoming_json) {
    console.log("proxima_senha event");
    consumers.get_senha(incoming_json, sockets, db);
  });
});

monitor.on('connection', function(client){
  console.log('user connected to Monitor');

  client.on("disconnect", function(){
    console.log("Disconnect from Monitor");
    // io.emit("update", clients[client.id] + " has left the server.");
    // delete clients[client.id];
  });

  client.on("get_view", function(incoming_json) {
    console.log("get_view event");
    consumers.get_view(incoming_json, sockets, db);
  });
});

totem.on('connection', function(client){
  console.log('user connected to Totem');

  client.on("disconnect", function(){
    console.log("Disconnect from Totem");
    // io.emit("update", clients[client.id] + " has left the server.");
    // delete clients[client.id];
  });

  client.on("socilitar_nova_senha", function(incoming_json) {
    console.log("socilitar_nova_senha event");
    consumers.insert_senha(incoming_json, sockets, db);
  });
});

var porta = 3000;
server.listen(porta, "0.0.0.0", function() {
  console.log('Socket IO listening on port ' + porta);
});

function verificar(db) {
  console.log("Verificando...");
  today_date = new Date(); today_date.setHours(0,0,0,0);
  consumers.verify_today_historico(db, today_date);
}

// express_app.use('/css', express.static(__dirname + '/css'));
// express_app.use('/img', express.static(__dirname + '/img'));
// express_app.use('/js', express.static(__dirname + '/js'));
// express_app.use('/templates', express.static(__dirname + '/templates'));
// express_app.use('/node_modules', express.static(__dirname + '/node_modules'));
// express_app.use('/', express.static(__dirname + '/'));

// express_app.get('/', function(req, res) {
//     res.sendFile(path.join(__dirname + '/index.html'));
// });
// express_app.listen(8081);
// console.log("Express listening on port 8081");
