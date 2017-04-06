module.exports = function(socket, connection) {
	socket.on("SOS", function(data) {
		socket.broadcast.emit("nuevo_sos", data);
	});
}