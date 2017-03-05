var queries = require("../modules/mysqli_crud");

module.exports = function(app, con) {
	
	app.post('/tarifas', function(req, res) {
		queries.allWRes(con, res, 'costos');
	});

	app.post("/monto", function(req, res) {
		var tiempo = req.body.tiempo;
		var distancia = req.body.distancia;
		var tipoServicio = req.body.tipoServicio;

		tipoServicio = tipoServicio.toUpperCase();

		con.query("SELECT * FROM `costos`", function(error, result) {
			if (error) {
				return console.log(error);
			}
			console.log(result);
			for (i=0; i<result.length; i++) {
				console.log(i);
				var servicio_tabla = result[i].tipo.toUpperCase();
				console.log(tipoServicio);
				console.log(servicio_tabla);
				if (tipoServicio == servicio_tabla) {
					precio_dist = result[i].distancia;
					precio_tiempo = result[i].tiempo;
					var calculo = precio_dist * distancia + precio_tiempo * tiempo;
          			res.json(calculo);
				}
			}
		});
	});
}