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
		const myquery = "SELECT *, trans.nombre transportista, usuarios.nombre pasajero FROM historial INNER JOIN usuarios ON usuarios.id = historial.id_pasajero INNER JOIN usuarios trans ON trans.id = historial.id_transportista;";
		con.query(myquery, (err, resu) => {
			if (err) {
				res.send(err);
			}
			console.log(myquery);
			res.send(resu);
		});
	});
}