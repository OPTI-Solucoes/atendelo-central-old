var mongo = require('mongodb').MongoClient;
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var box = io.of('/box');
var monitor = io.of('/monitor');
var totem = io.of('/totem');

var url_db = "mongodb://localhost:3001/localdb";

var boxes = [];
var monitores = [];
var totens = [];

mongo.connect(url_db, function(err, db){
	if (err) {throw err;}
	console.log("Connected to the Database...");

	db.createCollection("historico", function(err, res){
		if (err) {console.log(err);}
		else {console.log("Table can be writted...");}
	});

	db.createCollection("fila", function(err, res){
		if (err) {console.log(err);}
		else {console.log("Table can be writted...");}
	});

	// db.collection("historico").find({}).toArray(function(err, result) {
	// 	if (err) {throw err;}
	// 	console.log("-------------------------------------------------------");
	// 	console.log(result);
	// });

	// db.collection("fila").find({}).toArray(function(err, result) {
	// 	if (err) {throw err;}
	// 	console.log("-------------------------------------------------------");
	// 	console.log(result);
	// });

	// db.close();
});

app.get('/', function(req, res){
	res.send('server is running');
});

box.on('connection', function(client){
	console.log('user connected to Box');

	client.on("disconnect", function(){
		console.log("Disconnect from Box");
		// io.emit("update", clients[client.id] + " has left the server.");
		// delete clients[client.id];
	});
});

monitor.on('connection', function(client){
	console.log('user connected to Monitor');

	client.on("disconnect", function(){
		console.log("Disconnect from Monitor");
		// io.emit("update", clients[client.id] + " has left the server.");
		// delete clients[client.id];
	});
});

totem.on('connection', function(client){
	console.log('user connected to Totem');

	client.on("disconnect", function(){
		console.log("Disconnect from Totem");
		// io.emit("update", clients[client.id] + " has left the server.");
		// delete clients[client.id];
	});
});

io.on('connection', function(client){
	console.log('user connected');

	client.on("disconnect", function(){
		console.log("Disconnect");
		// io.emit("update", clients[client.id] + " has left the server.");
		// delete clients[client.id];
	});
});

server.listen(3000, "localhost", function() {
	console.log('listening on port 3000');
});
