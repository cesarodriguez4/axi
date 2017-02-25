var queries = require('../modules/mysqli_crud');
var jwt = require('jsonwebtoken');
module.exports = function(app, con) {
		app.post("/ubicaciones/nueva", function(req, res) {

		var id_posicion = req.body.id_posicion;
		var id_usuario = req.body.id_usuario;
		var latitud = req.body.latitud;
		var longitud = req.body.longitud;
		var tipo = req.body.tipo;
		var token = req.body.token;
		

		var object = {
			id_posicion, 
			id_usuario, 
			latitud,
			longitud,
			tipo 
		}; 

		jwt.verify(token, 'clavearrecha', function(err, decoded) {
			if (err) {
				return res.json({success:false, message:'Failed to auth token'});
			} else {
				req.decoded = decoded;
				run();
			}
		});

		function run() {
			queries.deleteAllWhere( con, 'posiciones', id_usuario );
			queries.insertWRes(res, con , object,'posiciones');
		}
		
	});

		app.get('/ubicaciones/get/:id/:token', function(req, res) {
			var id = req.body.id;
			var token = req.body.token;

			jwt.verify(token, 'clavearrecha', function(err, decoded) {
			if (err) {
				return res.json({success:false, message:'Failed to auth token'});
			} else {
				req.decoded = decoded;
				queries.selectWRes(res, con, 'posiciones', 'id_usuario',id);
			}
		});

		});
}