var queries = require('../modules/mysqli_crud');

module.exports = function(app, con) {
	app.post("/usuarios/historial", function(req, res) {
		var tipo = req.body.tipo;
		var id = req.body.id;
		var campo = 'id_pasajeros'; 
		if (tipo == 1) {
			campo = 'id_transportistas';
		}
		queries.selectWRes(res, con, 'historial', campo, id);
	});
}