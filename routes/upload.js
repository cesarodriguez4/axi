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
            queries.updateWhere(con, 'transportistas', campo, result.url, 'id', id);
          });
          }
      });
      res.send("ok");
    });

    app.post('/transportistas/foto', function(req, res) {
      upload(req,res,function(err) {
        var id = req.body.id;
        var campo = req.body.campo;
        if(err) {
          res.json({error_code:1,err_desc:err});
          return;
        }
        cloudinary.uploader.upload(req.file.path, function(result) {
          console.log(result);
          queries.updateWhere(con, 'transportistas', campo, result.url, 'id', id);
         });
        res.json("ok");
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
          });
          }
      });
      res.send("ok");
  }); 

   app.post('/prueba', function(req, res, next) {
        upload(req,res,function(err){
            var id = req.body.id;
            var campo = req.body.campo;
            console.log(req.file.path);
               if(err) {
                    res.json({error_code:1,err_desc:err});
                    return;
               }
              res.json("ok");
              cloudinary.uploader.upload(req.file.path, function(result) {
                console.log(result);
              });
           });
    });


   app.post('/prueba/64', function(req, res, next) {
    var id = req.body.id;
    var campo = req.body.campo;
    var file  = req.body.file;
    });

 }