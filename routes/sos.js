var queries = require('../modules/mysqli_crud');
var jwt = require("jsonwebtoken");

module.exports = function(app, con) {
	app.post('/SOS', function(req, res) {
		var token = req.body.token;
		var transportista = req.body.id_transportista;

		var yeison = {
			transportista
		}

		jwt.verify(token, 'clavearrecha', function(error) {
			if (error) {
				res.json({success: false, message: "Auth failed"});
			} else {
				queries.insert(con, yeison, 'sos');
				res.json({success: true, message: "Sos procesada correctamente"});
			}
		});
	})
}