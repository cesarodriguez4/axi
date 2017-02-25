module.exports = function(app, connect) {
	app.get("/sockets", function(req, res) {
		res.render("sockets");
	});
}