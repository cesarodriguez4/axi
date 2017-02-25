var queries = require('../modules/mysqli_crud.js');
var jwt = require('jsonwebtoken');


module.exports = function (app, connection) {

	app.post("/ubicaciones/nueva", function(req, res) {

		var tipo, id, lon, lat;

		  tipo = req.body.tipo; 
		  id = req.body.id;
		  lon = req.body.lon;
		  lat = req.body.lat;	

		var object = {
			id, 
			lon, 
			lat, 
		}; 

		queries.deleteAllWhere( connection, 'ubicaciones_transportistas', 'id', id );
		queries.insertWRes(res, connection , object,'ubicaciones_transportistas');
		
	});

	//para calcular la minima distancia entre todas las ubicaciones
	app.get("/ubicaciones/menor/:lat/:lon", function(req, res) {
		var lat = req.params.lat;
		var lon = req.params.lon;
		queries.distance(res, connection,'ubicaciones_transportistas' , lat, lon);
	});

}