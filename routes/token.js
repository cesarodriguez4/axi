var jwt = require("jsonwebtoken");

module.exports = function(app, con) {
	app.post("/api/auth", function(req, res) {
		var id = req.body.id;
		var pass = req.body.password;
		var tipo = req.body.tipo;
		var table = 'pasajeros';

		if (tipo) {
			table = 'transportistas';
		}

		var query = "SELECT * FROM `"+ table + "` WHERE id = '" + id + "' AND password = '" + pass + "';";
		
		con.query(query, function(error, row) {
			if (error) {
				console.log(error);
			} else {
				if (row.length > 0) {
					 var token = jwt.sign({
						  exp: Math.floor(Date.now() / 1000) + 24 * (60 * 60),
						  data: user
						}, 'clavearrecha');
					 res.json({success: true, 
					 	message: 'Auth Ok',
					 	KEY: token 
					 	});

				} else {
					res.json({success: false, message: "Auth failed"});
				}
			}
		});
	});
}