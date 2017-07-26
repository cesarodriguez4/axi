var queries = require('./mysqli_crud');

module.exports = function(socket, connection) {
	socket.on("nuevo_mensaje", function(msg) {
		console.log('esto es lo que me llega');
		console.log(msg);
		msg.id_pasajero = msg.sender;
		console.log(msg);
		socket.emit("entrega_mensaje", msg);
		var obj = JSON.parse(msg);
		delete obj.sender;
		delete obj.socket;
		queries.insert(connection, obj, `chat`);
	});
}