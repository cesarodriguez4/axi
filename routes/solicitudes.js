var queries = require("../modules/mysqli_crud");
var jwt = require("jsonwebtoken");
var instant = require('../modules/instant');

module.exports = function(app, con) {

	app.post('/solicitudes/taxista', function(req, res) {
		var token = req.body.token;
		var tipo_solicitud = req.body.tipo_solicitud;
		var direccion_destino = req.body.direccion_destino;
		var tiempo = req.body.tiempo;
		var kilometros = req.body.kilometros;
		var monto = req.body.monto;

		var array = {
			tipo_solicitud,
			direccion_destino, 
			tiempo, 
			kilometros, 
			monto
		}

		jwt.verify(token, 'clavearrecha', function(error) {
			if (error) {
				res.json({success: false, message: "Auth Failed"});
			} else {
				queries.insert(con, array, 'solicitudes');
				res.json({success: true, message: "Solicitud procesada correctamente"});
			}
		});
	});

	//Get historial de viajes realizados
	app.get('/solicitudes/historial/:token', function(req, res) {
		var token = req.params.token;

		jwt.verify(token, 'clavearrecha', function(error) {
			if (error) {
				res.json({success: true, message: "Auth Failed"});
			} else {
				queries.allWRes(con, res, 'historial_solicitudes');
			}
		});
	});


	app.post('/solicitud/cercanos', function(req, res) {
      var id = req.body.id_usuario;
      var lon = req.body.lon;
      var lat = req.body.lat;
 
      instant.lista(res,con,'ubicaciones_transportistas', id, lon, lat);
  });

	app.post('solicitudes/historial/nuevo', function(req, res) {
		var token = req.body.token;
		var id_usuario = req.body.id_usuario;
		var id_direccion_partida = req.body.id_direccion_partida;
		var id_direccion_destino = req.body.id_direccion_destino;
		var tipo_pago = req.body.tipo_pago;
		var tipo_solicitud = req.body.tipo_solicitud;
		var distancia_tiempo = req.body.distancia_tiempo;
		var costo = req.body.costo;
		var id_status_solicitud = req.body.id_status_solicitud;
		var zona = req.body.zona;

		var object = {
			id_usuario, 
			id_direccion_partida, 
			id_direccion_destino, 
			tipo_pago, 
			tipo_solicitud, 
			distancia_tiempo, 
			costo, 
			id_status_solicitud, 
			zona
		}
		jwt.verify(token, 'clavearrecha', function(error) {
			if (error) {
				res.json({success: false, message: "Auth Failed"});
			} else {
				queries.insert(con, object, 'historial_solicitudes');
				res.json({success: true, message: "Solicitud procesada correctamente"});
			}
		});


	});

}