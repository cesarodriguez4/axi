var Openpay = require('openpay');
var openpay = new Openpay('mwqho7nhxpuilyciz6ls', 'sk_2e903ef2818b42d084cccf969f76f044', false);
module.exports = function(app, con) {
  app.post('/getPay', (req, res) => {
   var chargeRequest = {
   source_id: req.body.tokenCard,
   method:'card',
   amount: req.body.monto,
   currency : 'MXN',
   description : 'Cargo',
   device_session_id: req.body.sessionId,
   order_id: 'ORDEN-'+req.body.sessionId,
   customer : {
        name: result[0].nombre,
        last_name: result[0].apellidos,
        phone_number: result[0].telefono,
        email: result[0].email 
    }
  };
    openpay.charges.create(chargeRequest, function(error, charge) {
      if (error) {
  	    return res.send(error);
      } 
      return res.send(charge);
    });
  })
};