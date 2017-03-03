var queries = require('../modules/mysqli_crud');
var jwt = require("jsonwebtoken");
var fs = require("fs");
var cloudinary = require('cloudinary');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function iUser(con, object, tipo) {
		var table;
	if (tipo == 1) {
		table = 'transportistas'
	} else {
		table = 'persona'
	}
	queries.insert(con, object, table);
}

	module.exports = function(app, con) {
		
		app.post('/usuarios/nuevo', function(req, res) {

		var dni, estado, ciudad, year_vehiculo, marca_vehiculo;
		var modelo_vehiculo, placa_vehiculo;

		var id = Math.floor(Math.random() * 1e6) + 1;	
		var nombre = req.body.nombre;
		var apellido = req.body.apellido;
		var email = req.body.email;
		var password = req.body.password;
		var telefono = req.body.telefono;
		var id_tipo = req.body.id_tipo;

		if(req.body.foto) {
			var foto = req.body.foto;
			var bitmap = new Buffer(foto, 'base64');
			var fileName = Date.now();
	   		var foto_perfil = fileName + ".jpg";

			fs.writeFile("public/images/"+fileName+".jpg", bitmap, function(error, success) {
				if (error) {
					var object = {
						id,
						nombre, 
						apellido,
						email,
						password, 
						telefono, 
						foto_perfil: error, 
						id_tipo
					};
					queries.insertWRes(res, con , object,'usuarios');
				} else {
			        cloudinary.uploader.upload("public/images/"+foto_perfil, function(result) {
			           var foto_perfil = result.url;
				            var object = {
				            id,
							nombre, 
							apellido,
							email,
							password, 
							telefono, 
							foto_perfil, 
							id_tipo
						}
						
						//Informacion del transportista
						dni = req.body.dni;
			   			estado = req.body.estado;
			   			ciudad = req.body.ciudad;
			   			year_vehiculo = req.body.year_vehiculo;
			   			marca_vehiculo = req.body.marca_vehiculo;
			   			modelo_vehiculo = req.body.modelo_vehiculo;
			   			placa_vehiculo = req.body.placa_vehiculo;
		
			   			var objTrans = {
			   				id,
							nombre, 
							apellido,
							email,
							password, 
							telefono, 
							foto_perfil,
							dni, 
							estado, 
							ciudad, 
							year_vehiculo, 
							marca_vehiculo, 
							modelo_vehiculo, 
							placa_vehiculo
						}

						if (id_tipo == 1) {
							iUser(con, objTrans, 1)
						}
						queries.insertWRes(res, con , object,'usuarios');
 					});
				}
			});
		} else {
			var object = {
							id,
							nombre, 
							apellido,
							email,
							password, 
							telefono, 
							id_tipo
						}
			
			queries.insertWRes(res, con , object,'usuarios');
			if (id_tipo == 1) {
				//Informacion del transportista
						dni = req.body.dni;
			   			estado = req.body.estado;
			   			ciudad = req.body.ciudad;
			   			year_vehiculo = req.body.year_vehiculo;
			   			marca_vehiculo = req.body.marca_vehiculo;
			   			modelo_vehiculo = req.body.modelo_vehiculo;
			   			placa_vehiculo = req.body.placa_vehiculo;
		
			   			var objTrans = {
			   				id,
							nombre, 
							apellido,
							email,
							password, 
							telefono, 
							foto_perfil,
							dni, 
							estado, 
							ciudad, 
							year_vehiculo, 
							marca_vehiculo, 
							modelo_vehiculo, 
							placa_vehiculo
						}
				iUser(con, objTrans, 1);
			}
		}
	}); 

	app.get('/usuarios/login/:username/:password', function(req, res) {
	console.log('Entro')
		var username = req.params.username;
		var password = req.params.password;	
		var query = "SELECT * FROM `usuario` WHERE `usuario` = '"+ username + "' AND `password` = '"+ password + "'";
		console.log(query);
		con.query(query, function(error, rows) {
			if(error) {
				res.send(error);
			} else {
				var id = rows[0];
				console.log('id');
				console.log(id);
				if (id !== undefined) {
					console.log('entro a la zona');
					if (id.id_tipo === 1) {
					//Es transportista
					console.log("Para no tomar");
					let query = "SELECT * FROM `transportista` WHERE `id_transportista` = '"+ id.id_tr + "';"
					console.log(query);
					con.query(query, function(error, rows) {
						if (error) {
							res.send(error);
						} else {
							res.send(rows);
						}

					});
				} else {
					// No es transportista
					//Es transportista
					let query = "SELECT FROM * `usuario` WHERE id_persona = '"+ id.id_persona + "';"
					console.log(query);
					con.query(query, function(error, rows) {
						if (error) {
							res.send(error);
						} else {
							res.send(rows);
						}

					});
				}
				} else {
					res.json({success: false, message: "Auth wrong"});
				}

			}
		});
	});
	
	app.post('/usuarios/login', function(req, res) {
		var email = req.body.email;
		var password = req.body.password;	
		var query = "SELECT * FROM `usuarios` WHERE `email` = "+ con.escape(email) + " AND `password` = "+ con.escape(password);
		con.query(query, function(error, rows) {
			if(error) {
				res.send(error);
			} else {
				if (rows.length == 0) {
					res.send(false);
				} else {
					res.send(rows);
				}
				}
			});
		});


	app.get('/api_test/:token', function(req, res) {
		var token = req.params.token || req.body.token;
		jwt.verify(token, 'clavearrecha', function(err, decoded){
			if (err) {
				return res.json({success:false, message:'Failed to auth token'});
			} else {
				req.decoded = decoded;
				res.send("token auth successful");
			}
		});

	});


	app.post('/transportistas/documentos/base64', function(req, res) {
		var img = req.body.img;
		var bitmap = new Buffer(img, 'base64');
		var fileName = Date.now();

		var id = req.body.id;
       	var placa = req.body.placa;
   		var auto = req.body.auto;
   		var color_auto = req.body.color_auto;
   		var tipo_unidad = req.body.tipo_unidad;
   		var estado = req.body.estado;
   		var fecha_nacimiento = req.body.fecha_nacimiento;
   		var ciudad = req.body.ciudad;
   		var aplicacion_usada = req.body.aplicacion_usada;
   		var foto_perfil = fileName + ".jpg";
			
			fs.writeFile("public/images/"+fileName+".jpg", bitmap, function(error, success) {
				if (error) {
					console.log(error);
				} else {
			        cloudinary.uploader.upload("public/images/"+foto_perfil, function(result) {
			           var foto_perfil = result.url;
			            var obj = {
				        	placa, 
				        	auto, 
				        	color_auto, 
				        	tipo_unidad, 
				        	estado, 
				        	fecha_nacimiento, 
				        	ciudad, 
				        	foto_perfil, 
				        	aplicacion_usada, 
				        	foto_perfil
			        	}
			            console.log(result);
 						queries.updateValuesWhere(con, 'transportistas', obj, 'id', id);			          
 					});

			       
				}
			});
			res.json("ok");
	});	

		app.post('/update', function(req, res) {
			var tabla = req.body.tabla;
			var campo = req.body.campo;
			var valor = req.body.valor;
			var token = req.body.token;

			console.log(req.body);
			var donde = req.body.donde;
			var dondeValor = req.body.dondeValor;
			jwt.verify(token, 'clavearrecha', function(error, decoded) {
				if (error) {
					res.json({status: 'Auth failed'});
				} else {
					queries.updateWhere(con, tabla, campo, valor, donde, dondeValor);
					req.decoded = decoded;
					res.json({status: ' Update listo.'});
				}
			});

			
		});

		app.get('/usuario/exist/:id', function(req, res) {
			var id= req.params.id;
			queries.exist(res, con, 'usuario', 'usuario', id);
		});

		app.get('/usuario/existEmail/:id', function(req, res) {
			var id= req.params.id;
			queries.exist(res, con, 'usuario', 'email', id);
		});

		app.post("/validacion/documentos", function(req, res) {
		var id = req.body.id;
		queries.updateWhere(con, 'transportistas' , 'subio_documentos', 1, 'id', id);
		queries.updateWhere(con, 'usuarios' , 'subio_documentos', 1, 'id', id);
		res.send("ok");
	});



}
