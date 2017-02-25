var cron = require('node-cron');
var queries = require("./mysqli_crud");
module.exports = function(connection) {


/* Funciones de soporte */

	function formatoFecha(input) {
	  function pad(s) { return (s < 10) ? '0' + s : s; }
	  var d = new Date(input);
	  return [pad(d.getFullYear()), pad(d.getMonth()+1), d.getDate()].join('-');
	}

	function actualizaDeuda(usuario, fecha) {
		//Calcular el monto de la comision que el usuario tiene que pagar
		// consultar entre fechas cuantas cuentas tiene
		var fecha_actual = new Date();
		fecha_actual = formatoFecha(fecha_actual);
		fecha = formatoFecha(fecha);

		var query = "SELECT id_viaje, monto FROM `historial` WHERE fecha_solicitud BETWEEN '"+fecha_actual+"' AND "+" '"+fecha+"' AND id_transportista = " + connection.escape(usuario);
		connection.query(query, function(error, deudas) {
			if (error) {
				return console.log(error);
			}
			var monto_cobro;
			deudas = deudas.length;
			if (deudas > 0) {
				//Formula del cobro
				monto_cobro = deudas * 0.1 * 100 // Deudas * 10% * 100$
				//Actualizamos el monto que debe cobrarse al usuario en la tabla de transportistas.
				queries.updateWhere(connection, 'transportistas', 'deuda', monto_cobro, 'id', usuario);
			}
		});
	}

	function pagarAntesDe(id,fecha) {
		var query = "SELECT * FROM `transportistas` WHERE id = "+ connection.escape(id);
		connection.query(query, function(error, res) {
			if (error) {
				return console.log(res);
			}
			queries.updateWhere(connection, `transportistas`, `pagar_antes_de`, fecha, `id`, id);
		});
	}


	function agregaDias(n){
	    var t = new Date();
	    t.setDate(t.getDate() + n); 
	    var date = ((t.getDate() < 10) ?  '0'+t.getDate() : t.getDate())+"/"+(((t.getMonth() + 1) < 10 ) ? '0'+(t.getMonth()+1) : (t.getMonth()+1))+"/"+t.getFullYear();
	    return date;
	}

/*Cron Jobs */

//Sistema de cobros
	cron.schedule('0 0 0 * * *', function() {
		var query1 = "SELECT id, fecha_ultimo_pago, solvente, deuda FROM `transportistas`";
		connection.query(query1, function(error, rows) {
			if(error) {
				return console.log(error);
			} 

			for (i=1; i<rows.length; i++) {

			if (rows[i].solvente == 1) {
				var ultimo_pago = new Date(rows[i].fecha_ultimo_pago);
			    var fecha_actual = new Date();

				var diferencia_dias = Math.round(Math.abs((ultimo_pago.getTime() - fecha_actual.getTime())/(24*60*60*1000)));
				if (diferencia_dias > 7) {
					//Inspecciona si el usuario esta solvente
					actualizaDeuda(rows[i].id, new Date());

					//Calcular fecha 2 dias luego para hacer cobro
					var fechaAPagar = agregaDias(2);
					pagarAntesDe(rows[i].id, fechaAPagar);
				}	
			}
		}

			
	    });
	});

//Sistema para dar de baja clientes que no paguen
cron.schedule('0 0 12 * * *', function() {
	var query = "SELECT id, pagar_antes_de FROM `transportistas`";
	connection.query(query, function(error, res) {
		if (error) {
			return console.log(error);
		}
		var hoy = new Date();
		hoy = hoy.getTime();
		for (i=1; i<res.length; i++) {
			var fecha = new Date(res[i].pagar_antes_de);
			fecha = fecha.getTime();
			if (hoy > fecha) {
				//Entonces el usuario esta excedido en fecha de pago
				//Damos de baja
				queries.updateWhere(connection, `transportistas`, `solvente`, 0, `id`, res[i].id);
			}
		}

	});
});

	
}