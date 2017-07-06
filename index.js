var mongo = require('mongodb').MongoClient;
var app = require('express')();
var server = require('http').createServer(app);
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

var url_db = "mongodb://localhost:3001/localdb";

var boxes = [];
var monitores = [];
var totens = [];

mongo.connect(url_db, function(err, db_){
	if (err) {throw err;}
	console.log("Connected to the Database...");

	db = db_;

	db.createCollection("historico", function(err, res){
		if (err) {console.log(err);}
		else {console.log("Table can be writted...");}
	});

	db.createCollection("fila", function(err, res){
		if (err) {console.log(err);}
		else {console.log("Table can be writted...");}
	});

	db.collection("senha").updateMany({}, {'$set' : {'atendida': false }}, function(err, res) {
		if (err) {throw err};
		console.log(res.matchedCount);
	});

	// db.close();
});

app.get('/', function(req, res){
	res.send('server is running');
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

server.listen(3000, "localhost", function() {
	console.log('listening on port 3000');
});
