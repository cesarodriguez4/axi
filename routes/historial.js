var queries = require('../modules/mysqli_crud');

module.exports = function(app, con) {
	app.post("/usuarios/historial", function(req, res) {
		var tipo = req.body.tipo;
		var id = req.body.id;
		var campo = 'id_pasajero'; 
		if (tipo == 1) {
			campo = 'id_transportista';
		}
		queries.selectWRes(res, con, 'historial', campo, id);
	});
}