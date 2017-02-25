var queries = require("../modules/mysqli_crud");

module.exports = function(app, con) {
	
	app.post('/tarifas', function(req, res) {
		queries.allWRes(con, res, 'costos');
	});

	app.post("/monto", function(req, res) {

		var distancia = req.body.distancia;
		var tiempo = req.body.tiempo;
		var tipoServicio = req.body.tipoServicio;

		var precio_dist, precio_tiempo;

		if (tipoServicio == 'vip') {
			var query = "SELECT `distancia`, `tiempo` FROM `costos` WHERE `tipo` = 'vip' ";
			console.log(query);
			con.query(query, function(error, row) {
				if (error) {
					res.send(error);
				} else {
					if (row) {
						precio_dist = row[0].distancia;
						precio_tiempo = row[0].tiempo;

						var calculo = precio_dist * distancia + precio_tiempo * tiempo;
          				res.json(calculo);
					} else {
						res.send("No prices in database");
					}
					
				}
			});
		} else {
          	var query = "SELECT `distancia`,`tiempo` FROM `costos` WHERE `tipo` = 'tradicional'";	
          	con.query(query, function(error, row) {
          		if (error) {
          			console.log(error);
          		} else {
          			if (row) {
						precio_dist = row[0].distancia;
						precio_tiempo = row[0].tiempo;

						var calculo = precio_dist * distancia + precio_tiempo * tiempo;
          				res.json(calculo);
					} else {
						res.send("No prices in database");
					}
          		}
          	});
		}
	});
}