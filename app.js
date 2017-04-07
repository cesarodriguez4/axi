var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cloudinary = require('cloudinary');

var routes = require('./routes/index');
var users = require('./routes/users');
var mysql = require('mysql');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var queries = require('./modules/mysqli_crud.js');
var viantti = require('./modules/instant');

var port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var connection = mysql.createConnection({
  host     : 'sulnwdk5uwjw1r2k.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user     : 'kkkhei9ryz1aiv0f',
  password : 'admfjegby5p90v7e',
  database : 'u7lrzhpsxoefbtnz'
}); 



/*
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'appxi'
});
*/


cloudinary.config({
  cloud_name: 'hhyprrrtz', 
  api_key: '215368412276664', 
  api_secret: 'ogz-SpYkOWIw3dFAugZ20Ligtvo'
});

connection.connect(function(error) {
  if(error) {
    console.log(error);
  } else {
    console.log('Conectado Exitosamente');
  }
}); 

app.use('/', routes);
app.use('/users', users);
require('./routes/api')(app, connection);
require('./routes/usuarios')(app, connection);
require('./routes/tarifas')(app, connection);
require('./routes/pagos')(app, connection);
require('./routes/sos')(app, connection);
require('./routes/solicitudes')(app, connection);
require('./routes/upload')(app, connection);
require('./routes/sockets')(app, connection);
require('./routes/token')(app, connection);
require('./routes/ubicaciones')(app, connection);
require("./routes/recuperar")(app, connection);
require("./routes/chat")(app, connection);
require("./routes/historial")(app, connection);
require("./routes/favoritos")(app, connection);

//Cron Job
require('./modules/cron')(connection);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


io.on('connection', function(socket) {

  require("./modules/chat")(socket, connection);
  require("./modules/sos")(socket, connection);

  console.log('Socket.io connectado');
  socket.on('solicitud-de-cliente', function(data) {
    //Enviando a tabla solicitudes
    queries.insert(connection, data, 'solicitudes_ondemand');
    socket.emit("solicitudes-a-taxistas", data);
    socket.emit("status-socket", "success");
  });

//Cuando el taxista acepta una solicitud
  socket.on('solicitud-aceptada', function(data) {
      var obj = JSON.parse(data);
      console.log('solicitud-aceptada');
      socket.broadcast.emit('aceptada-cliente', {idSolicitud: obj.id_solicitud, id_pasajero: obj.id_pasajero, socket: 'aceptada-cliente' } );
  });

  socket.on('lista-solicitudes', function() {
    var query = "SELECT * FROM `solicitudes_ondemand` WHERE activa = 1";
    connection.query(query, function(error, rows) {
      if (error) {
        console.log(error);
      } else {
        socket.emit('lsolicitudes', rows);
      }
    });
  });

  socket.on('solicitud-instantanea', function(obj) {
    obj = JSON.parse(obj);
    if (obj) {
      var id = obj.id_usuario;
      var lon = Number(obj.lon);
      var lat = Number(obj.lat);
      var origen = obj.origen;
      var destino = obj.destino;
      var lonFinal = Number(obj.lonFinal);
      var latFinal = Number(obj.latFinal);

      viantti.instantaneo(connection, socket ,'ubicaciones_transportistas', id, lon, lat, origen, destino, lonFinal, latFinal);
    } else {
      console.log('No ha enviado ningun objeto');
    }
  });

 socket.on('solicitud-cancelada', function(obj) {
  console.log('solicitud-cancelada');
  console.log(obj);
    obj = JSON.parse(obj);
    if (obj) {
      var id = obj.id_pasajero;
      var idTipo = obj.idTipo;
      if (idTipo == 1) {
        console.log('Arriba');
        queries.updateWhere(connection, 'solicitudes_ondemand', 'activa', '0', 'id_transportista', id);
        console.log("fue cancelada");
        socket.broadcast.emit("fue-cancelada", {id_pasajero: id, socket:'fue-cancelada'} );
      } else {
        console.log('bajo');
        console.log('fue cancelada');
        queries.updateWhere(connection, 'solicitudes_ondemand', 'activa', '0', 'id_pasajero', id);
        socket.broadcast.emit("fue-cancelada", {id_pasajero: id, socket:'fue-cancelada'} );
      }
    } else {
      console.log('Error: objeto indefinido');
    }
  });

  //Socket emitido por app del transportista cuando llega a un sitio a buscar a un pasajero
  socket.on('estoy-en-sitio', function(mobj) {
    mobj = JSON.parse(mobj);
    var id_transportista = mobj.id_transportista;
    var id_pasajero = mobj.id_pasajero;

    var obj = {
      id_transportista, 
      id_pasajero, 
      socket:'esta-en-sitio'
    };
    socket.broadcast.emit('esta-en-sitio', obj);
  });

 socket.on('iniciar-viaje', function(obj) {
    console.log('Objeto de iniciar-viaje');
    console.log(obj);
    console.log('se ha recibido evento: iniciar-viaje');
    obj = JSON.parse(obj);
      //El transportista empieza el viaje
      var id_viaje = obj.id_viaje;
      var idtransportista = obj.id_transportista;
      var id_pasajero = obj.id_pasajero;
      var origen = obj.origen;
      var destino = obj.destino;
      var monto = obj.monto;
      var fecha_solicitud = new Date();
      fecha_solicitud = fecha_solicitud.toString();
      var status_servicio = 'En curso';

      socket.broadcast.emit("inicio-viaje", {id_pasajero, socket: 'inicio-viaje'});

      var queryObj = {
        id_viaje,
        idtransportista, 
        id_pasajero,
        origen, 
        destino, 
        monto,
        fecha_solicitud, 
        status_servicio
      };
      

      queries.insert(connection, queryObj, 'historial');
      console.log('Se ha enviado `inicio-viaje`');
  
  });

   socket.on('detener-viaje', function(obj) {
    obj = JSON.parse(obj);
    var id_transportista = obj.id_transportista;
    var id_pasajero = obj.id_pasajero; 
    var nObj = {
      id_transportista, 
      id_pasajero, 
      socket: 'viaje-detenido'
    }
    socket.broadcast.emit('viaje-detenido', nObj);
  });



  socket.on('culminar-viaje', function(obj) {
    console.log('culminar-viaje');
    console.log(obj);
    var objeto;
    obj = JSON.parse(obj);
    // El transportista ha culminado un viaje
      var calificacion_pasajero = obj.calificacion_pasajero;
      var comentario_pasajero = obj.comentario_pasajero; 
      var idtransportista = obj.idtransportista;
      var id_pasajero = obj.id_pasajero;
      var id_viaje = obj.id_viaje;
      var origen = obj.origen;
      var destino = obj.destino;
      var status_servicio = 'Finalizado';

       objeto = {
        "ok": "true",
         id_viaje, 
         socket: 'viaje-culminado', 
         id_pasajero, 
         idtransportista
       };
     socket.broadcast.emit('viaje-culminado', objeto );

      var myObj = {
        calificacion_pasajero,
        comentario_pasajero,
        idtransportista,
        id_pasajero,
        id_viaje, 
        status_servicio,
        origen, 
        destino
      };
      console.log('evento: viaje-culminado');
     
    queries.updateValuesWhere(connection, 'historial', myObj, 'id_viaje', id_viaje);     
    
  });

});

module.exports = app;
