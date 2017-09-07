var socket = io.connect('/');

function solicitud() {
	var objeto = {
		"id_solicitud":z,
		"id_usuario":"111",
		"lonActual":"11.0399128",
		"lonFinal":"12.0399128",
		"latActual":"-63.8699656,15",
		"latFinal":"-64.8699656,15"
	}
	socket.emit("solicitud-de-cliente",objeto);
}

function aceptar() {
	var objeto = {
		id_solicitud: "658da7c3-9", 
		id_transportista: "111"
	}
	socket.emit("solicitud-aceptada", objeto);
}

socket.on("aceptada-cliente", data => {
  alert('aceptada-cliente');
  console.log(data);
});

socket.on("solicitudes-a-taxistas", function(data){
	console.log(data);
});

socket.on("info-ondemand", function(variable) {
	alert("Abre la consola para ver el JSON Recibido");
	console.log(variable);
});

function instant() {
	console.log('hey');
	var obj = {
		id_usuario: document.getElementById('id_usuario').value,
		lon:document.getElementById('lon').value,
		lat:document.getElementById('lat').value, 
		origen: document.getElementById('origen').value, 
		destino: document.getElementById('destino').value
	}
	console.log(obj);
	obj = JSON.stringify(obj);
	socket.emit("solicitud-instantanea", obj);
}

function cancel() {

	var obj = {
		idTipo: 1, 
		id: 19
	}
	obj = JSON.stringify(obj);
	socket.emit("solicitud-cancelada", obj);
}

function iniciar_viaje() {
	var obj = {
		id_viaje:Math.random(4)*10,
		idtransportista:Math.random(4)*10,
		idpasajero:Math.random(4)*10,
		origen:Math.random(4)*10,
		destino:Math.random(4)*10,
		monto:Math.random(4)*10
	}

	obj = JSON.stringify(obj);
	socket.emit('iniciar-viaje', obj);
}


function culminar_viaje() {

	var obj = {
		id_viaje:Math.random(4)*10,
		idtransportista:Math.random(4)*10,
		idpasajero:Math.random(4)*10,
		origen:Math.random(4)*10,
		destino:Math.random(4)*10,
		monto:Math.random(4)*10, 
		id_pasajero: '22'
	}

	obj = JSON.stringify(obj);
	socket.emit('culminar-viaje', obj);
}

function SOS() {
	var obj = {
		id_transportista: document.getElementById("id_transportista").value, 
		id_pasajero: document.getElementById("id_pasajero").value
	};
	obj = JSON.stringify(obj);
	socket.emit('SOS', obj);
}

socket.on('fue-cancelada', function(data) {
	console.log(data);
});

socket.on('inicio-viaje', function(data) {
	alert('Recibido inicio-viaje');
	console.log(data);
});

socket.on('viaje-culminado', function(data) {
	console.log(data);
});

socket.on('nuevo_sos', function(data) {
	alert(data);
});