var jwt = require("jsonwebtoken");

module.exports = function(app, connection) {
	app.post("/api/auth", function(req, res) {
		var user = req.body.usuario;
		var pass = req.body.password;
		var query = "SELECT * FROM `usuario` WHERE `usuario`='" + user + "' AND `password` = '" + pass + "'"; 
		console.log(query);
		connection.query(query, function(error, rows) {
			if (error) {
				console.log(error);
			} else {
				if (rows.length > 0) {
					//Existe una clave, asignemos una sesion que dure 24 horas
					 var token = jwt.sign({
						  exp: Math.floor(Date.now() / 1000) + 24 * (60 * 60),
						  data: user
						}, 'clavearrecha');
					        // return the information including token as JSON
			        res.json({
			          success: true,
			          message: 'API_KEY', 
			          token
			        });
				} else {
					//No hay usuario alli
					res.json({ success: false, message: 'Authentication failed. Check your credentials.' });
				}
			}
		});
	});
}