var queries = require('../modules/mysqli_crud');

module.exports = function(app, con) { 

	app.post('/SOS/agregar', function(req, res) {
		var id_pasajero = req.body.id_pasajero;
		var telefono_sos = req.body.telefono_sos;
		var obj = {
			id_pasajero, 
			telefono_sos
		};
		queries.insertWRes(res, con, obj, 'sos');
	});

	app.post('/SOS/contactos', function(req, res) {
		var id_pasajero = req.body.id_pasajero;
		queries.selectWRes(res, con, 'sos', 'id_pasajero',id_pasajero);
	});

}