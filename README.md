# APPXI API
Guia detallada sobre uso del API    
## Solicitud de token de acceso
`` post: /api/auth ``
Envia los siguientes datos:    
- usuario.
- password.

En caso de que el usuario y password coincidan en la tabla ``usuario`` se te devolvera un json como el siguiente:    
`` {success:true, message: 'API_KEY', token: tutokenasignado } ``

La duracion del token es de **24 horas**.

## Registro de usuario:
`` post: /usuarios/nuevo ``
Datos:    
- usuario.
- password
- id_tipo: 1 para transportista, 0 para persona.
- email.

Dependiendo del tipo de usuario (Transportista o  persona), usted debera tambien enviar los siguientes datos:    
- Para transportista:
  - usuario
  - password
  - id_tipo
  - email
  - nombre
  - apellido
  - dni
  - estado
  - ciudad
  - year_vehiculo
  - marcha_vehiculo
  - modelo_vehiculo
  - placa_vehiculo

- Para persona:
  - usuario
  - password
  - id_tipo
  - email
  - nombre
  - apellido
  - dni

## login de usuario
`` get: /usuarios/login/$username/$password ``
Con:    
- $username: Nombre de usuario.
- $password: Password del usuario.

Devuelve los datos del usuario ya sea transportista o persona.

## Actualizar Campo.
`` post: /update``
La siguiente ruta puede ser usada por usted para modificar cualquier dato de una tabla en la base de datos, usa los siguientes parametros:
- tabla: Nombre de la tabla en la base de datos.
- campo: Campo en la tabla que quiere modificar.
- valor: Valor que quiere insertar en el campo.
- donde: Es el campo que usara para filtrar el dato que quiere insertar.
- dondeValor: Es el valor del campo que quiere filtrar.

Ejemplo:    
Si usted quiere modificar el campo 'nombre' en la tabla `usuarios` del usuario con id = 100, debera mandar lo siguiente:
 `` post: /update``
 Valores:
 tabla: `usuarios`,    
 campo: `nombre`,    
 valor: `Pedro`,    
 donde: `id`,    
 dondeValor: `100`.    
 
 
## Historial de pagos
`` get: /pagos/$token ``
Devuelve el historial completo de pagos.

## Insertar un pago
`` post: /pagos/set ``
Valores:
- token.
- id_tipo_pago
- comprobante_pago
- id_status_cliente

## Insertar Posiciones / Ubicaciones
`` post: /ubicaciones/nueva ``
Valores:
- id_posicion
- id_usuario
- latitud
- longitud
- tipo
- token

## Obtener ubicaciones
`` get: /ubicaciones/get/$id/$token ``
Donde:
- id: Id del usuario
- token: token generado.

## Solicitud de un taxista
`` post: /solicitudes/taxista ``
Valores:
- token
- tipo_solicitud: (1: normal, 2: VIP)
- direccion_destino
- tiempo
- kilometros
- monto

## SOS 
`` post: /SOS ``
Valores:
- token
- id_transportista

## tarifas
`` get: /tarifas/:token ``
Donde:
- token: token se seguridad generado.

## Lista de transportistas mas cercanos    
Devuelve un array con la lista de los 10 taxistas mas cercanos al pasajero ordenados segun proximidad al usuario en un radio de 30km a la redonda.
`` post: /solicitud/cercanos ``
Debes enviar:    
- id: Id del pasajero.
- lon: Longitud de la ubicacion del pasajero.
- lat: Latitud de la ubicacion del pasajero.

Nota: Si no se encuentra ningun transportista cerca dentro de 30km el array estara vacio.

## Funcionalidad de chat    

### Enviar mensaje
``socket: emit('nuevo_mensaje')``
Enviar un JSON con las siguientes propiedades: 
```javascript
 {
  id_transportista, 
  id_usuario, 
  mensaje
 } 
 ```
### Escuchar mensaje
 Para escuchar un mensaje:
 ``socket: on('entrega_mensaje')``
 Recibiras un JSON con las siguientes propiedades:
 ```javascript
 {
  id_transportista, 
  id_usuario, 
  mensaje
 } 
 ```


## Solicitar lista de tarifas
`` post: /tarifas ``

## Obtener historial del chat para una conversacion
`` post: /chat ``
Debes enviar lo siguiente:
- id_transportista
- id_pasajero
 