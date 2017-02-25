var queries = require("../modules/mysqli_crud");

module.exports = function(app, connection) {
	app.get('/chat', function(req, res){
		res.render('chat');
	});
	app.post('/chat', function(req, res) {
		var id_transportista = req.body.id_transportista;
		var id_pasajero = req.body.id_pasajero;

		var query = "SELECT * FROM `chat` WHERE `id_transportista` = "+ connection.escape(id_transportista) + " AND `id_pasajero` = " + connection.escape(id_pasajero);
		connection.query(query, function(errpr, result) {
			if (error) {
				return console.log(error);
			}
			return res.send(result);
		});
	});
}