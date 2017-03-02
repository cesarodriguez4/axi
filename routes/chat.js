var queries = require("../modules/mysqli_crud");

module.exports = function(app, connection) {
	app.get('/chat', function(req, res){
		res.render('chat');
	});
	app.post('/chat', function(req, res) {
		var id_transportista = req.body.id_transportista;
		var id_pasajero = req.body.id_pasajero;

		var query = "SELECT * FROM `chat` WHERE `id_transportista` = "+ connection.escape(id_transportista) + " AND `id_pasajero` = " + connection.escape(id_pasajero);
		connection.query(query, function(error, result) {
			if (error) {
				return console.log(error);
			}
			return res.send(result);
		});
	});
	// Servicio para mostrar la lista con los usuarios que estas interactuando 
	//en el chat
	app.post("/chats", function(req, res) {
		var tipo = req.body.tipo;
		var id = req.body.id;
		if (tipo == 1) {
			var q = "SELECT DISTINCT id_pasajero as id, nombre FROM `chat` INNER JOIN `usuarios` ON usuarios.id = chat.id_transportista WHERE id_transportista =" + connection.escape(id);
			console.log(q);
			connection.query(q, function(error, result) {
				if (error) {
					return console.log(error);	
				}
				return res.send(result);
			});
		} else {
			var q = "SELECT DISTINCT id_transportista as id, nombre FROM `chat` INNER JOIN `usuarios` ON usuarios.id = chat.id_pasajero WHERE id_pasajero =" + connection.escape(id);
			console.log(q);
			connection.query(q, function(error, result) {
				if (error) {
					return console.log(error);	
				}
				return res.send(result);
			});
		}
	});
	
	app.post("/conversacion", function(res, req) {
		var id_transportista = req.body.id_transportista;
		var id_pasajero = req.body.id_pasajero;
		var query = "SELECT * FROM `chat` WHERE id_transportista=";
		query+=connection.escape(id_transportista);
		query += "AND id_pasajero =" + connection.escape(id_pasajero);
		
		console.log(query);
		
		connection.query(query, function(error, result) {
			if (error) {
				return console.log(error);
			}
			return res.send(result)
		})
	})
}