var queries = require('../modules/mysqli_crud');
var jwt = require("jsonwebtoken");
var fs = require("fs");
var cloudinary = require('cloudinary');

var sql = require("sql-crud");

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
	
		app.post('/perfil/modificar', function(req, res) {
			var tabla = 'transportistas';
			var campo = req.body.campo;
			var valor = req.body.valor;
			var id = req.body.id;
				queries.updateWhere(con, tabla, campo, valor, 'id', id);
				res.send('ok');
			});

		app.post("/perfil/pasajero/actualiza", function(req, res) {
			var crud = new sql("mysql");
			crud.update(con, {table: 'usuarios', set: req.body, where: {id: req.body.id}} , function(error, results) {
				if (error) {
					return console.log(error);
				}
				return console.log(results);
			});
			crud.update(con, {table: 'transportistas', set: req.body, where: {id: req.body.id}});
		});

		app.post("/validacion/documentos", function(req, res) {
			var id = req.body.id;
			queries.updateWhere(con, 'transportistas' , 'subio_documentos', 1, 'id', id);
			queries.updateWhere(con, 'usuarios' , 'subio_documentos', 1, 'id', id);
			res.send("ok");
	});



}
