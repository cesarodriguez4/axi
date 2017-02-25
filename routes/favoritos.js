var queries = require("../modules/mysqli_crud");
var jwt = require("jsonwebtoken");

module.exports = function(app, con) {
	app.get('/favoritos/:token', function(req, res) {
		var token = req.params.token || req.body.token;

		jwt.verify(token, 'clavearrecha', function(error, decoded) {
			if (error) {
				res.json({success: false, message: "Auth failed"});
			} else {
				queries.allWRes(con, res, 'pago_cliente');
			}
		});
	});

	app.post('/favoritos/set', function(req, res) {
		var token = req.body.token;
		var id_tipo_pago = req.body.id_tipo_pago;
		var comprobante_pago = req.body.comprobante_pago;
		var id_status_cliente = req.body.id_status_cliente;

		var yeison = {
			id_tipo_pago, 
			comprobante_pago, 
			id_status_cliente
		} 

		jwt.verify(token, 'clavearrecha', function(error, decoded) {
			if (error) {
				res.json({success: false, message: "Auth failed"});
			} else {
				queries.insert(con, yeison, 'pago_cliente');
				res.json({success: true, message: "Pago procesado correctamente"});
			}
		});

	});
}