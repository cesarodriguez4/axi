var queries = require("../modules/mysqli_crud");

module.exports = function(app, con) {
	app.post('/favoritos/set', function(req, res) {
		var favorito = req.body.favorito;
		var id_pasajero = req.body.id_pasajero;
		queries.updateWhere(con, 'favoritos', 'transportista_favorito', favorito , 'id_pasajero', id_pasajero);
		res.send("ok");
	});
}