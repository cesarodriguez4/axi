module.exports = function(socket, connection) {
	socket.on("SOS", function(data) {
		socket.emit("nuevo_sos", data);
	});
}