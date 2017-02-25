
	function toRad(n) {
		return n * Math.PI / 180;
	}

//function para calcular la distancia entre dos puntos geograficos
// Toda la magia funciona aca...
	function minorD(lat1, lat2, lon1, lon2) {
		lat1 = toRad(lat1);
		lat2 = toRad(lat2);
		//El radio del planeta -> :o
		var R = 6371; // expresado en km
		//Delta latitud
		var dLat = toRad((lat2-lat1));
		//Delta lingutyd
		var dLon = toRad((lon2-lon1));
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		        Math.cos(lat1) * Math.cos(lat2) *
		        Math.sin(dLon/2) * Math.sin(dLon/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		return R * c;
	}

function all(con, db) {
	connection.query("SELECT * from "+db+" WHERE 1", function(error, rows, fields) {
		if (error) {
			return error;
		} else {
			return rows;
		}
	});
}

function allWRes(con, res, table) {
	var query = "SELECT * FROM `"+table+ "` WHERE 1";
	con.query(query, function(err, row) {
		if (err) {
			res.send(err);
		} else {
			res.send(row);
		}
	});
}

function exist(res, con, table, hash, key) {
	var query = "SELECT * FROM "+ table + " WHERE " + hash + " = " + con.escape(key);
	con.query(query, function(error, rows, fields) {
		if (error) {
			res.send(error);
		} else {
			if (rows.length === 0) {
				console.log(rows.length);
				res.send(false);
			}
			else {
				console.log(rows.length);
				res.send(true);
			}	}
	});
}

function selectWRes(res, con, table, hash,key) {
	var query = "SELECT * FROM "+ table + " WHERE `" + hash + "`= " + con.escape(key);
	con.query(query, function(error, rows, fields) {
		if (error) {
			res.send(error);
		} else {
			res.send(rows);		}
	});
}



function login(res,con, table, email, password) {
	var query = "SELECT * FROM "+ table + " WHERE email = " + con.escape(email) + " AND password = " + con.escape(password);
	console.log(query);
	con.query(query, function(error, rows, fields) {
		if (error) {
			res.send(error);
		} else {
			if (rows.length === 0) {
				res.send(false);
			}
			else {
				res.send(rows);
			}
		}
	});
}

//Funcion para detectar la distancia menor entre dos longitudes
function distance(res, con, table, lat, lon) {
	//Devuelve todas las ubicaciones
	var query = "SELECT * FROM " + table;
	con.query(query, function(error, rows) {
		if (error) {
			console.log(error);
		} else {
			//Seleccionamos la primera ubicacion de referencia
			var menor = minorD(lat, lon, rows[0].lon, rows[0].lat);
			// ... y el primer Id tambien 
			var menorId = rows[0].id;
			//Para todo el resto de las ubicaciones ...
			for (i=1; i<rows.length; i++) {
				item = minorD(lat, lon, rows[i].lon, rows[i].lat);
				if (item < menor) {
					//Si existe una distancia menor
					menor = item;
					// Y tambien agarramos su id
					menorId = rows[i].id;
				}
			}
			// al final mandamos el resultado a traves
			// de un hermoso array
			var resultado = [ menorId, menor ];
			// :)
			res.send(resultado);
		}
	});
}


// @array: a collection of properties you want to add in the table
//For example:
//{
//	first_name: 'Cesar',
//  last_name: 'Rodriguez'
//}
//@table: The table in mysql you want to add the data.

function insert(con, array, table) {
	console.log('tipo =>');
	console.log(typeof array);
	if (typeof array == 'string') {
		array = JSON.parse(array);
	}
	console.log('array aqui');
	console.log(array);
	var str = "INSERT INTO `"+ table +"` ( ";	
	var keys = Object.keys(array);

	for ( i = 0; i<keys.length; i++ ) {
		if(i !== keys.length - 1) {
			str+='`';
			str+= keys[i];
			str+='`';
			str+= ',';
		} else {
			str+='`';
			str+= keys[i];
			str+='`';
		}
	}
	str += ')';
	str += ' VALUES (';

	for ( i = 0 ; i < keys.length; i ++ ) {
		if(i !== keys.length - 1) {
			str+="'";
			str+= array[keys[i]];
			str+="'";
			str+= ',';
		} else {
			str+="'";
			str+= array[keys[i]];
			str+="'";
		}
	}

	str+= ' )';
	console.log(str);
	con.query(str, function(error, rows, fields) {
		if (error) {
			console.log(error);
		} else {
			console.log(rows);
		}
	});
}


function insertWRes(res, con, array, table) {

	var str = "INSERT INTO `"+ table +"` ( ";	
	var keys = Object.keys(array);

	for ( i = 0; i<keys.length; i++ ) {
		if(i !== keys.length - 1) {
			str+='`';
			str+= keys[i];
			str+='`';
			str+= ',';
		} else {
			str+='`';
			str+= keys[i];
			str+='`';
		}
	}
	str += ')';
	str += ' VALUES (';

	for ( i = 0 ; i < keys.length; i ++ ) {
		if(i !== keys.length - 1) {
			str+= con.escape(array[keys[i]]);
			str+= ',';
		} else {
			str+= con.escape(array[keys[i]]);
		}
	}

	str+= ' )';

	console.log('Insert With Res');
	console.log(str);

	con.query(str, function(error, rows, fields) {
		if (error) {
			res.send(error);
		} else {
			res.json("ok");
			console.log(rows);
		}
	});
}

function insertWNoExist(con, array, table) {
	var str = "INSERT INTO `"+ table +"` ( ";	
	var keys = Object.keys(array);

	for ( i = 0; i<keys.length; i++ ) {
		if(i !== keys.length - 1) {
			str+='`';
			str+= keys[i];
			str+='`';
			str+= ',';
		} else {
			str+='`';
			str+= keys[i];
			str+='`';
		}
	}
	str += ')';
	str += ' VALUES (';

	for ( i = 0 ; i < keys.length; i ++ ) {
		if(i !== keys.length - 1) {
			str+= con.escape(array[keys[i]]);
			str+= ',';
		} else {
			str+= con.escape(array[keys[i]]);
		}
	}

	str+= ' )';
	console.log(str);
}

function deleteAllWhere(con , table, hash, value) {
	query = "DELETE FROM `"+table+"` WHERE `"+hash+"` = " + con.escape(value);
	console.log(query);
	con.query(query, function(error, rows, field) {
		if (error) {
			console.log(error);
		} else {
			console.log(rows);
		}
	});
}

function updateWhere(con, table, hash, key, whash, wkey) {
	var query = "UPDATE `"+table+"` SET `"+hash+"` = "+con.escape(key)+"  WHERE `"+whash+"` = "+con.escape(wkey)+";";
	console.log(query);
	con.query(query, function(error, rows) {
		if (error) {
			console.log(error);
		} else {
			console.log(rows);
		}
	});
}


function updateValuesWhere(con, table, array, whash, wkey) {
	var str = "UPDATE `"+ table +"` SET ";	
	var keys = Object.keys(array);

	for ( i = 0; i<keys.length; i++ ) {
		if(i !== keys.length - 1) {
			str+='`';
			str+= keys[i];
			str+='`';
			str+= " = ";
			str+= "'";
			str += array[keys[i]];
			str += "'"
			str+= ',';
		} else {
			str+='`';
			str+= keys[i];
			str+='`';
			str+= " = ";
			str+= "'";
			str += array[keys[i]];
			str += "'"
		}
	}

	str += " WHERE ";
	str += "`" + whash + "`";
	str += " = ";
	str +=  wkey ;
	
	console.log(str);

	con.query(str, function(error, row) {
		if (error) {
			console.log(error)
		} else {
			console.log(row);
		}
	})
}

module.exports = {
	all,
	allWRes, 
	selectWRes, 
	login, 
	insertWRes,
	insertWNoExist, 
	exist, 
	distance, 
	deleteAllWhere, 
	insert, 
	updateWhere, 
	updateValuesWhere
};