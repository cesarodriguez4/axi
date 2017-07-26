var queries = require('./mysqli_crud');

module.exports = function(socket, connection) {
	socket.on("nuevo_mensaje", function(msg) {
		socket.emit("entrega_mensaje", msg);
		var obj = JSON.parse(msg);
		delete obj.sender;
		delete obj.socket;
		queries.insert(connection, obj, `chat`);
	})
}