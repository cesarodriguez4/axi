var queries = require("./mysqli_crud");

	function toRad(n) {
		return n * Math.PI / 180;
	}

//function para calcular la distancia entre dos puntos geograficos
// Toda la magia funciona aca...
	function minorD(lat1, lat2, lon1, lon2) {
		lat1 = toRad(lat1);
		lat2 = toRad(lat2);
		//El radio del planeta -> :o
		var R = 6371e3; // expresado en m
		//Delta latitud
		var dLat = toRad((lat2-lat1));
		//Delta lingutyd
		var dLon = toRad((lon2-lon1));
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		        Math.cos(lat1) * Math.cos(lat2) *
		        Math.sin(dLon/2) * Math.sin(dLon/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		return R * c;
		//Se devuelve distancia en metros
	}


function instantaneo(con, socket, table, id, lon, lat, origen, destino, lonFinal, latFinal) {
	//Devuelve todas las ubicaciones
	var query = "SELECT * FROM " + table;
	con.query(query, function(error, rows) {
		if (error) {
			console.log(error);
		} else {
			console.log('vamos con el debug');
			if (rows[0] !== undefined) {
				var menor = minorD(lat, rows[0].lat, lon, rows[0].lon);
				console.log("Menor D")
				// ... y el primer Id tambien 
				var menorId = rows[0].id;

				if (isNaN(menor)) {
					menor = 1e10;
				}
				//Para todo el resto de las ubicaciones ...
				for (i=1; i<rows.length; i++) {
					item = minorD(lat, rows[i].lat, lon, rows[i].lon);
					if (item < menor) {
						//Si existe una distancia menor
						menor = item;
						// Y tambien agarramos su id
						menorId = rows[i].id;
					}
				}
				//Evaluamos si la distancia menor es mayor a 15, 
				//Si es asi arrojamos que no existe usuario Cerca.
				console.log('La distancia menor es', menor);
					if (menor < 15000) {
						var consulta ="SELECT * FROM `pasajeros` WHERE `id` = " + con.escape(id); 
						con.query(consulta, function(error, rows) {
						if(error) {
							return console.log(error);
						}
						if(rows.length > 0 ) {
							var res_transportista = {
								id_pasajero: id,
								id_transportista: menorId, 
								origen, 
								destino, 
								telefono: rows[0].telefono, 
								nombre: rows[0].nombre + ' ' + rows[0].apellidos, 
								socket: 'nueva-ondemand', 
								lonInicial:lon, 
								latInicial:lat, 
								lonFinal:lonFinal, 
								latFinal:latFinal, 
								foto_perfil: rows[0].foto_perfil
							}
							socket.broadcast.emit("nueva-ondemand", res_transportista);
							console.log(res_transportista);

							//Se agrega al historial a la carrera

							var cancelaJson = {
								id_pasajero: id, 
								id_transportista: menorId,
								destinoInicial: origen, 
								destinoFinal: destino 
							}
							queries.insert(con, cancelaJson, 'solicitudes_ondemand');
						} else {
							console.log('Query empty');
							socket.broadcast.emit("nueva-ondemand", {status:'Ese usuario no existe', id_pasajero: id, id_transportista: menorId});
						}
					});
					
					//Se cambia el status al transportista
					queries.updateWhere(con, 'transportistas', 'status', '0', 'id', menorId );
					var queryTrans = "SELECT * FROM `transportistas` INNER JOIN `ubicaciones_transportistas` on transportistas.id = ubicaciones_transportistas.id WHERE transportistas.id =" + menorId;
					console.log(queryTrans);
					con.query(queryTrans, function(error, rows) {
						if (error) {
							console.log(error);
						} else {
							console.log('resultado de inner join');
							console.log()
							var res_pasajero = {
								id_pasajero: id, 
								id_transportista: menorId,
								fullname: rows[0].nombre + ' ' + rows[0].apellidos, 
								reputacion: rows[0].reputacion, 
								placa: rows[0].placa ,
								color:  rows[0].color_auto ,
								modelo: rows[0].auto , 
								foto_conductor: rows[0].foto_vehiculo, 
								telefono: rows[0].telefono,
								socket: 'info-ondemand', 
								mLat:rows[0].lat, 
								mLng:rows[0].lon
							}
							console.log(res_pasajero);
							//res_pasajero = JSON.stringify(res_pasajero);
							socket.emit("info-ondemand", res_pasajero);
						}
					});
					
				} else {
					console.log('no hay');
					//No existe Transportista Cerca
					var res_pasajero = {
								id_pasajero: id, 
								socket: 'no-hay-transportista'
							}
							//res_pasajero = JSON.stringify(res_pasajero);
							socket.broadcast.emit("no-hay-transportista", res_pasajero);
				}	
			} else {
				console.log("Vacio");
				socket.broadcast.emit("info-ondemand", "El id no existe");
			}	
		}
	});
}

 function sortObj(array) {
	var i;
	var key;
	for (var j=1; j<array.length; j++) {
		i=j-1;
		key = array[j];
		while (i>=0 && array[i].distancia > key.distancia) {
			array[i+1] = array[i];
			i-=1;
		}
		array[i+1] = key
	}
	return array;
	//Ordena un array de objetos de menor a mayor segun su distancia;
}


function lista(res,con, id, lon, lat) {
	/* @TODO:
		-Consultar todas las ubicaciones de los transportistas
		- Calcular una a una las distancias entre el pasajero y todos los transportistas.
		-descartar las distancias mayores a 15km y almacenar las menores en un array
		- Ordenar el array de mayor a menor
		- Devolver el array de ids mas cercanos
		- El array debe contener Id del transportista y la distancia.
		(con el id el cliente de Android/iOs puede consultar
		 el resto de datos del transportista como fotos, nombre, etc) 
	*/

	var query = "SELECT * from `ubicaciones_transportistas` inner join `transportistas` on transportistas.id = ubicaciones_transportistas.id";
	con.query(query, function(error, result) {
		if (error) {
			return console.log(error);
		}
		var size = result.length;
		var posiciones = [];
		for (i=0; i<size; i++) {
			var minDistance = minorD(lat, result[i].lat , lon, result[i].lon);
			console.log(minDistance);
			if(!isNaN(minDistance) && minDistance < 30000) {
				posiciones.push({
					id: result[i].id, 
					distancia: minorD(lat, result[i].lat , lon, result[i].lon),
					nombre: result[i].nombre + ' ' + result[i].apellido, 
					foto_perfil: result[i].foto_perfil, 
					foto_vehiculo: result[i].foto_vehiculo, 
					modelo_vehiculo: result[i].modelo_vehiculo, 
					placa_vehiculo: result[i].placa_vehiculo, 
					lon: result[i].lon, 
					lat: result[i].lat
				});
			}
		}
		posiciones = sortObj(posiciones);
			if (posiciones.length > 10) {
				posiciones = posiciones.slice(0, 9);
			}
		res.send(posiciones);
	});
}

module.exports = {
	instantaneo, 
	lista
}