var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// Root route
router.get("/", function(req, res) {
	// We don't need to pass currentUser in all routes. We can use middleware function with res.locals
	// res.render("home", {currentUser: req.user});
	res.render("home", {css: "home", title: "Edukey - best instructors near you!"});
});

router.get("/teach", function(req, res) {
	res.render("instructors-lp", {css: "home", title: "Edukey - for best instructors and experts"});
});

////////////////////////////
// AUTHENTICATION Routes: /
//////////////////////////
// register form
router.get("/register", function(req, res){
	// We don't need to pass currentUser in all routes. We can use middleware function with res.locals
	// res.render("register", {currentUser: req.user});
	res.render("register", {title: "Registration in Edukey!"});
});

// regiser new user:
router.post("/register", function(req, res){
	// We save only username in DB, and send password as a 2nd argument in User.regiser to encode it and save in DB as a hash with salt
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			// passport-local-mongoose won't register 2 users with the same username, and will give an error
			console.log(err);
			// FLASH MESSAGE:
			req.flash("error", "Oops! Something went wrong: "+err.message); //err is an object with "name:" and "message:"
			// FLASH MESSAGE DON'T WORK PROPERLY WITH res.render (old messages)
			// return res.render("register"); //It's better to use "render" for rendering new sites with GET
			// FLASH MESSAGE WORKS FINE WITH res.redirect:
			return res.redirect("/register");

		} // we don't need "else {}" becouse we used "return" which will stop a function
		// after registration log the user in (with "local" passport strategy):
		passport.authenticate("local")(req, res, function(){
			// FLASH MESSAGE:
			req.flash("success", "New account is created. Nice to meet You "+user.username+" :)");
			res.redirect("/trainings");
		});
	});
});

// login form:
router.get("/login", function(req, res){
	// FLASH MESSAGE from middleware could be passed to login.EJS view as data in res.render:
	//res.render("login", {error: req.flash("error")});
	//"error" is our name/type of message (it could be enything) and error: is name of var sended
	
	// We can also set a message here:
	// res.render("login", {error: "ERROR TEXT"});

	//REFACTORISATION:
	// If we send FLASH MESSAGE be /login route it will be accessible only on login.ejs
	// But it's better to send FLASH MESSAGE to partials/header.ejs
	// So we use standard res.render here and sand all messages in app.js by res.locals.error
	res.render("login", {title: "Login to Edukey!"});
});

// login a user:
// app.post("/login", middleware, callback)
// middleware: passport.authenticate("STRATEGY") takes "username" and "password" automaticaly (default var names)
// middleware is called before callback function (in middle)
// if we use "local" strategy we have to tall Express to use it by typing:
// passport.use(new LocalStrategy(User.authenticate())); (We already typed in on a beggining of this file)
router.post("/login", passport.authenticate("local", {

	// ADD Flash Messege if failed to login - HOW??????
		/*if(err){
			// passport-local-mongoose won't register 2 users with the same username, and will give an error
			console.log(err);
			// FLASH MESSAGE:
			req.flash("error", "Oops! Something went wrong: "+err.message); //err is an object with "name:" and "message:"
			// FLASH MESSAGE DON'T WORK PROPERLY WITH res.render (old messages)
			// return res.render("register"); //It's better to use "render" for rendering new sites with GET
			// FLASH MESSAGE WORKS FINE WITH res.redirect:
			return res.redirect("/register");

		} // we don't need "else {}" becouse we used "return" which will stop a function*/

		successRedirect: "/trainings",
		failureRedirect: "/login"
	}),	function(req, res){
	// this callback don't do anythink. Its only to remember:
	// middleware is in the middle: (argument, middleware, callback)
});

//////////////////////////////
// Middleware in Express:
// https://expressjs.com/en/guide/using-middleware.html
//////////////////////////////

//LogOUT URL
router.get("/logout", function(req, res){
	req.logout(); // IT's ALL in passport :)
	//FLASH MESSAGE:
	req.flash("success", "Logged Out. See U soon :)");
	res.redirect("/trainings");
});

//MIDLEWARE FUNCTION TO CHECK if user is LOGGED IN
/* //REFACTORISATION: moved to middleware/index.js
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}*/

// When something is in separate file, we have to export it (and then require it in app.js)
module.exports = router;