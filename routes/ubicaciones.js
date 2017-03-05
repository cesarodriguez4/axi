var queries = require('../modules/mysqli_crud.js');

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
		queries.insertWRes(res, connection , object ,'ubicaciones_transportistas');
	});

}