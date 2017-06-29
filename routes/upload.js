var queries = require("../modules/mysqli_crud");
var fs = require("fs");
var cloudinary = require('cloudinary');

var multer = require('multer');

 var storageAvatar = multer.diskStorage({ //multers disk storage settings
           destination: function (req, file, cb) {
               cb(null, './public/images/');
           },
           filename: function (req, file, cb) {
               var datetimestamp = Date.now();
               cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
           }
       });

       var upload = multer({ //multer settings
          storage: storageAvatar
        }).single('file');

module.exports = function(app, con) {

    app.post('/usuarios/foto/base64', function(req,res) {
       var img = req.body.img;
       var bitmap = new Buffer(img, 'base64');
       var fileName = Date.now();

       var id = req.body.id;
       var campo = req.body.campo;
       var foto_perfil = fileName + ".jpg";
      
       fs.writeFile("public/images/"+foto_perfil, bitmap, function(error) {
        if (error) {
          console.log(error);
        } else {
          cloudinary.uploader.upload("public/images/"+foto_perfil, function(result) {
            console.log(result);
            queries.updateWhere(con, 'usuarios', campo, result.url, 'id', id);
            res.send({ok: true, url: result.url});
          });
          }
      });
    });

    app.post('/transportistas/foto/base64', function(req, res) {
      var img = req.body.img;
      var bitmap = new Buffer(img, 'base64');
      var fileName = Date.now();

      var id = req.body.id;
      var campo = req.body.campo;
      var foto_perfil = fileName + ".jpg";
      
      fs.writeFile("public/images/"+foto_perfil, bitmap, function(error) {
        if (error) {
          console.log(error);
        } else {
          cloudinary.uploader.upload("public/images/"+foto_perfil, function(result) {
            console.log(result);
            queries.updateWhere(con, 'transportistas', campo, result.url, 'id', id);
            res.send({ok: true, url: result.url});
          });
          }
      });
  }); 

 }