var queries = require('../modules/mysqli_crud');
var sql = require('sql-crud');
var crud = new sql('mysql');

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

	app.get("/historial", (req, res) => {
		crud.select(con, {select: '*', from: 'historial'}, (err, results) => {
			if (err) {
				return res.send(err);
			}
			return res.send(results);
		});
	});
}