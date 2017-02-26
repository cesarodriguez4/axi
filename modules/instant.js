var queries = require("./mysqli_crud");

	function toRad(n) {
		return n * Math.PI / 180;
	}

//funcion para calcular la distancia entre dos puntos geograficos
	function minorD(lat1, lat2, lon1, lon2) {

		lat1 = toRad(lat1);
		lat2 = toRad(lat2);

		var R = 6371e3;
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
	console.log('instantaneo adentro');
	console.log('id', id);
	console.log('long', lon);
	console.log('lat', lat);
	console.log('lonFinal', lonFinal);
	console.log('latFinal', latFinal);
	//Devuelve todas las ubicaciones
	var query = "SELECT * FROM " + table;
	con.query(query, function(error, rows) {
		if (error) {
			console.log(error);
		} else {
			console.log('vamos con el debug');
			if (rows[0] !== undefined) {
				console.log('Aqui el cuerpo del rows');
				console.log(rows[0]);
				console.log('entra en el loop');
				//Seleccionamos la primera ubicacion de referencia
				console.log('latitud1', lat);
				console.log('longitud1', lon);
				console.log('latitud2', rows[0].lat);
				console.log('longitud2', rows[0].lon)
				var menor = minorD(lat, rows[0].lat, lon, rows[0].lon);
				console.log('primer menor', menor);
				// ... y el primer Id tambien 
				var menorId = rows[0].id;

				if (isNaN(menor)) {
					console.log('matraqueando')
					menor = 1e10
				}
				//Para todo el resto de las ubicaciones ...
				for (i=1; i<rows.length; i++) {
					item = minorD(lat, rows[i].lat, lon, rows[i].lon);
					console.log('itero con el item', item);
					if (item < menor) {
						console.log('en loop, item', item);
						console.log('en loop, menor', menor);
						//Si existe una distancia menor
						menor = item;
						// Y tambien agarramos su id
						menorId = rows[i].id;
						console.log('ahora menor es ', menor);
						console.log('ahora menorId es ', menorId);
					}
				}

				var consulta ="SELECT * FROM `usuarios` WHERE `id` = " + con.escape(id); 
				con.query( consulta, function(error, rows) {
					if(error) {
						return console.log(error);
					}
					if(rows.length > 0 ) {
						console.log('dentro del query para encontrar el telefono');
						console.log(rows);
						// al final mandamos el resultado a traves
						// de un hermoso array
						var res_transportista = {
							id_pasajero: id,
							id_transportista: menorId, 
							origen, 
							destino, 
							telefono: rows[0].telefono, 
							nombre: rows[0].nombre + ' ' + rows[0].apellido, 
							socket: 'nueva-ondemand', 
							lonInicial:lon, 
							latInicial:lat, 
							lonFinal:lonFinal, 
							latFinal:latFinal, 
							foto_perfil: rows[0].foto_perfil
						}
						console.log(res_transportista);
						socket.broadcast.emit("nueva-ondemand", res_transportista);

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
						socket.broadcast.emit("nueva-ondemand", {socket:'nueva-ondemand',status:'Ese usuario no existe', id_pasajero: id, id_transportista: menorId});
					}
				});
				//res_transportista = JSON.stringify(res_transportista);
				
				

				//Se cambia el status al transportista
				queries.updateWhere(con, 'transportistas', 'status', '0', 'id', menorId );
				var queryTrans = "SELECT *  FROM `transportistas` WHERE `id` = "+menorId;
				console.log(queryTrans);
				con.query(queryTrans, function(error, rows) {
					if (error) {
						console.log(error);
					} else {
						var res_pasajero = {
							id_transportista: menorId,
							id_pasajero: id, 
							fullname: rows[0].nombre + ' ' + rows[0].apellido, 
							reputacion: rows[0].reputacion, 
							placa: rows[0].placa_vehiculo ,
							color:  rows[0].color_auto ,
							modelo: rows[0].modelo_vehiculo , 
							tiempo: 100, 
							foto_conductor: rows[0].foto_vehiculo, 
							telefono: rows[0].telefono,
							socket: 'info-ondemand'
						}
						console.log('remedio');
						console.log(res_pasajero);
						//res_pasajero = JSON.stringify(res_pasajero);
						socket.broadcast.emit("info-ondemand", res_pasajero);
					}
				});
				

			} else {
				console.log("Vacia la vergacion");
				socket.emit("info-ondemand", "El id no existe");
			}	
		}
	});
}



function sort(array) {
	var i;
	var key;
	for (j=1; j<array.length; j++) {
		i=j-1;
		key = array[j];
		while (i>=0 && array[i] > key) {
			array[i+1] = array[i];
			i-=1;
		}
		array[i+1] = key
	}
	return array;
	//Ordena un array de menor a mayor;
}

 function sortObj(array) {
	var i;
	var key;
	for (j=1; j<array.length; j++) {
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



function lista(res,con, table, id, lon, lat) {
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
			if(!isNaN(minDistance) && minDistance < 30000) {
				posiciones.push({
					id: result[i].id, 
					distancia: minorD(lat, result[i].lat , lon, result[i].lon),
					nombre: result[i].nombre + ' ' + result[i].apellido, 
					foto_perfil: result[i].foto_perfil, 
					foto_vehiculo: result[i].foto_vehiculo, 
					modelo_vehiculo: result[i].modelo_vehiculo, 
					placa_vehiculo: result[i].placa_vehiculo
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