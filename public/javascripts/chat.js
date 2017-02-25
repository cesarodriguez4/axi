var socket = io.connect('/');

function sendMessage() {
	var id_usuario = Math.floor(1e6* Math.random());
	var id_transportista = Math.floor(1e6 * Math.random());
	var mensaje = document.getElementById("mensaje").value;

	var obj = {id_transportista, id_usuario, mensaje};
	obj = JSON.stringify(obj)
	console.log(obj)
	socket.emit('nuevo_mensaje', obj );
} 

socket.on("entrega_mensaje", function(data) {
	data = JSON.parse(data);
	var id_transportista = data.id_transportista;
	var id_usuario = data.id_usuario;
	var mensaje = data.mensaje;
});