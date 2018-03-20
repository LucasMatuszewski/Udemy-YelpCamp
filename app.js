// REFACTORING:
// 1. Reffactoring Middlewar - isLoggedIn and isXxxxOwner in separate file
// 2. Flash Messages, Errors handling with Bootstrap, connect-flash package
// 3. Landingpage

var express = require("express");
var app = express();

////////////////////////////
// Ad.2 - FLASH MESSAGES: // "connect-flash" is one of many packages for it (but most poppular)
//////////////////////////// https://www.npmjs.com/package/connect-flash
// The flash is a special area of the session used for storing messages.
// Messages are written to the flash and cleared after being displayed to the user.
// The flash is typically used in combination with redirects, ensuring that the message
// is available to the next page that is to be rendered.
var flash = require("connect-flash");
// On "connect-flash" GIT documentation they setting up a session here.
// But we already set a session for authentication, ussing "express-session" package.
// So we don't need following code from documentation:
// app.use(express.cookieParser('keyboard cat')); // we don't need cookieParser with express-session package
// app.use(express.session({ cookie: { maxAge: 60000 }}));
app.use(flash());
// messages are send by Routes (text could be defined in middleware/index.js), and showed by Views.
// so we have to: 1) set a message, 2) send a message (route/res.locals), 3) show the message (view)
// IMPORTANT: DRY code = don't send by all routes, its better to use res.locals in app.js

// Body-Parser
// Express don't have a body object by defoult (eg. to read data from form)
// To make Express to hold body object we have to say Express to use BODY-PARSER package.
// (now this package is instaled with express by defoult)
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// EJS Templates
app.set("view engine", "ejs");

//Public directory with static files (like css, jpg)
app.use(express.static("public")); //'(__dirname + "/public")' don't works now (it was on Udemy course)

/*  TIP: many coders use one declaration of variations (but its more about a style):
var express 	= require("express"),
	app 		= express(),
	bodyParser 	= require("body-parser"),
	mongoose 	= require("mongoose");
*/

///////////////
// MONGO DB: /
/////////////

// Add Mongoose to connect with MongoDB:
var mongoose = require("mongoose");

///////////////////////////
// Environment Variables // like: process.env.PORT, prosess.env.IP
///////////////////////////
// We can use it to know if we are on Production (public for users) or Development Environment.
// On production its better to use local database for tests. We can use env variable:
// process.env.DATABASEURL

// To set DATABASEURL variable we have to export/set it on node server, by typing in the local console:
// export DATABASEURL=mongodb://localhost/yelp_camp (it works only on cloud9.com)
// On Heroku.com go to Dashboard > Settings > Config Variables > Reveal Config Vars and set:
// Key = databaseURL, Value = mongodb://lucas.matuszewski:testowe123@ds047484.mlab.com:47484/yelpcamp
// or just type on command line:
// heroku config:set DATABASEURL=mongodb://lucas.matuszewski:testowe123@ds047484.mlab.com:47484/yelpcamp
// or: heroku config:set NPM_CONFIG_PRODUCTION=false (by defoult it's =true)
// so on heroku we can use elso in app.js: if(NPM_CONFIG_PRODUCTION){}

// !!! To set env var localy type in console (works on all OS becouse its in NPM):
// npm run env NODE_ENV=production || npm run env DATABASEURL="mongodb://localhost/yelp_camp"

// In PowerShell type: $env:NODE_ENV="production" or $env:DATABASEURL="mongodb://localhost/yelp_camp"

// IMPORTANT: its good to use env var to hide important data from code, like DB URLs, logins etc.

mongoose.connect(process.env.DATABASEURL || "mongodb://localhost/edukey-1");
// if we didn't set env variable on Node localy or on a server it will use defoult DB on localhost

// Local MongoDB:
// mongoose.connect("mongodb://localhost/yelp_camp");

// Remote MongoDB on mLab.com
// mongoose.connect("mongodb://lucas.matuszewski:testowe123@ds047484.mlab.com:47484/yelpcamp");

// Require Mongoose Schema:
var Comment 	= require("./models/comment");
var Training 	= require("./models/training"); //we don't need to use ".js" (like with ".ejs")

var User 		= require("./models/user");

// SEEDING DataBase - make initial data in database
// (e.g. initial setup of an application, administrator account, dummy data etc.)
/*
var seedDB = require("./seeds");
seedDB(); //invoke a function from seeds.js file
*/

/////////////////////
// AUTHENTICATION: /
///////////////////

// adding packages (installed previously by "NPM install xxx")
var passport				= require("passport"),
	LocalStrategy			= require("passport-local").Strategy,
	passportLocalMongoose	= require("passport-local-mongoose"),
	ExpressSession			= require("express-session");

// Setting data/paramaters in session
// Session data is not saved in the cookie itself, just the session ID.
// Session data is stored server-side.
// https://www.npmjs.com/package/express-session
app.use(ExpressSession({
		secret: "some data/key to hold in session",
		resave: false,
		saveUninitialized: false
	}));
//Initializing Passport Tool and starting a session
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));//Use local strategy (login/password) on User Model. authenticate() method is from "passport-local-mongoose"
passport.serializeUser(User.serializeUser()); //method to encode data and put into a session
passport.deserializeUser(User.deserializeUser()); //method to decode data from a session

// PASSING DATA TO ALL ROUTES/EJS Templates
// Middleware to pass req.user (user data) to ALL ROUTES (we don't have to pass it in every route)
app.use(function(req, res, next){
	res.locals.currentUser = req.user;

	// FLASH MESSAGE:
	// We send "error/success" message to all routes and ejs templates
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");

	// deafault <title>, if there is no title in route
	res.locals.title = "Edukey - find instructor & start Your training";
	// default css file name if there is no css name in route
	res.locals.css = "main";

	next();
});

//////////////////////
// METHOD-OVERRIDE //
////////////////////
// Becouse HTTP don't support PUT request we have to use Method-override package
// IN CONSOLE: npm install method-override
var methodOverride = require("method-override");
app.use(methodOverride("_method")); // "_method" is a parameter used in URL like: ?_method=PUT

//////////////
// ROUTES: //
////////////

// Index and AUTHENTICATION ROUTES - moved to routes/index.js
var indexRoutes			= require("./routes/index"),
// CAMPGROUND ROUTES - moved to routes/trainings.js
	trainingsRoutes 	= require("./routes/trainings"),
// COMMENTS ROUTES - moved to routes/comments.js
	commentsRoutes		= require("./routes/comments");

// Routes could be required elso on the beggining of app.js with other required packages and models
// But it could be also here

// Use routes with beggining defoult URLs:
app.use("/", indexRoutes);
app.use("/trainings", trainingsRoutes);
app.use("/trainings/:id/comments", commentsRoutes);
// We use routes with defoult beggining URLs "/", "/training" and "/trainings/:id/comments"
// and we dont have to use this deoult in files from /routes direcotry


///////////////////////////
// Environment Variables // process.env.PORT, prosess.env.IP
///////////////////////////
// We can use it to know if we are on Production (public for users) or Development Environment.
// On production its better to use local database for tests. We can also use local port like here:

// Listen for Localhost:
// app.listen(3000, function(){
// Listen for Hosting / Heroku (we can't decide wich port it will be)
app.listen(process.env.PORT || 3000, function(){
	console.log('The Edukey app is listening');
});