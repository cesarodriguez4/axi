module.exports = function(socket, connection) {
	socket.on("SOS", function(obj) {
		obj = JSON.parse(obj);
		var id = obj.id_transportista;
		var q = "SELECT * FROM `transportistas` INNER JOIN `ubicaciones_transportistas` ON `transportistas`.id =  `ubicaciones_transportistas`.id WHERE transportistas.id = " + id;
		connection.query(q, function(error, result) {
			var nombre = result[0].nombre;
			var apellido = result[0].apellido;
			var telefono = result[0].telefono;
			var lon = result[0].lon;
			var lat = result[0].lat;
			var sos = {
				nombre, 
				apellido, 
				telefono,
				lon, 
				lat, 
				socket: "nuevo_sos"
			}
			socket.broadcast.emit("nuevo_sos", sos);
		});

		
	});
}