var queries = require('./mysqli_crud');

module.exports = function(socket, connection) {
	socket.on("nuevo_mensaje", function(msg) {
		socket.broadcast.emit("entrega_mensaje", msg);
		var obj = JSON.parse(msg);
		delete obj.sender;
		queries.insert(connection, obj, `chat`);
	})
}