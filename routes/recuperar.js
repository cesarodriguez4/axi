
var queries = require('../modules/mysqli_crud.js');
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
	service: 'Hotmail',
	auth: {
		user: 'cesarodriguez4@hotmail.com',
		pass: 'cesar25063730'
	}
});


transporter.verify(function(error, success) {
   if (error) {
        console.log(error);
   } else {
        console.log('Server is ready to take our messages');
   }
});

const jwt = require("jsonwebtoken");

module.exports = function(app, con) {


	app.get('/restore', function(req, res) {
		var qToken = req.query.token;
		var email = req.query.e;
		var tipo = req.query.t;
		res.render('restaurar', {email, tipo});
	});

	app.post('/setPassword', function(req, res) {
		var email = req.body.email;
		var password = req.body.password;
		var tipo = req.body.tipo;
	
		console.log('email', email);
		console.log('pass', password);

		queries.updateWhere(con, tipo, 'password', password, 'email', email);
		res.render('setPassword');
	});

	app.post('/resetPassword', function(req, res) {
		var email = req.body.email;
		var tipo = req.body.tipo;
		var tabla = 'usuarios';

		if (tipo == 0) {
			tabla = 'usuarios';
		}

		var query = "SELECT * FROM `"+tabla+'` WHERE email = ' + con.escape(email); 
		console.log(query);

		con.query(query, function(error, result){
			if (error) {
				return res.json({status: 'error', message: error});
			}
			//Si existe el correo registrado
			if (result.length > 0) {
				//Creamos un token
				var token = jwt.sign({
						  exp: Math.floor(Date.now() / 1000) + 24 * (60 * 60),
						  data: email
						}, 'clavearrecha');

				var template = '';
				template += '<meta charset="utf-8">';
				template += '<body>';
				template += '<h1>Estás solo a un paso de recuperar tu contraseña</h1>';
				template += '<p>Sigue el siguiente enlace para completar el proceso:</p>';
				template += '<br><a href="appxi.herokuapp.com/restore?token='+token+'&e='+email+'&t='+tabla+'">Haz click en este enlace</a><br>';
				template += '<span>Este link tiene una caducidad de 24 horas</span>';
				//Envio del correo
				let mail = {
					from: "cesarodriguez4@hotmail.com", 
					to: email, 
					subject: "Restaurar tu contraseña", 
					html: template
				}

				transporter.sendMail(mail, function(error, info) {
					if (error) {
						return console.log(error);
					}
					console.log(info);
				});

				res.json({status: 'ok', message:'Se ha enviado un correo de recuperación'});
			} else {
				res.json({status: 'error', message:'Este correo no existe'});
			}
		});

		
	});

	app.get('/wrongPassword', function(req, res) {
		let mail =  {
			from: "cesarodriguez4@hotmail.com", 
			to: 'cesarodriguez4@gmail.com', 
			subject: 'Recuperar password', 
			text: 'Aqui llego por fin'
		}

		transporter.sendMail(mail, function(error, info) {
			if (error) {
				return console.log(error)
				res.send(error)
			}
			console.log(info)
			res.send(info)
		});
		
	});
}
