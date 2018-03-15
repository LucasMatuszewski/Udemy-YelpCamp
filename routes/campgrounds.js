var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware"); // if file name is index.js the folder name is enough
// to use methods required from other file, we have to use object name, like: middleware.isLoggedIn

// ROUTER:
// Without Router it was: app.get("/campgrounds", callback)

// **RESTful INDEX route - shows a list of objects:
router.get("/", function(req, res){ //it was .get("/campgrounds", callback) but we use default URL in app.use("/campgrounds", campgroundsRoutes) in app.js
	// Check if user is logedin and give its ID and username
	console.log(req.user);
	// 1) Get all campgrounds form DB:
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else {
			// 2) Render new EJS template and pass data from Mongo DB to this template:
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
});


// IMPORTANT:
// This is a REST convention. We use the same URL route to send data by POST, and to GET data of the same type.

// **RESTful CREATE route - add a new object to DB:
router.post("/", middleware.isLoggedIn, function(req, res){
	// Get data from form and add to campground array
	// (to read data sended by form we use body-parser to make body object)
	var newCampName = req.body.newCampName; // it could be reffactored with html id="newCamp[name]" and all 'var newCamp' won't be necessary 
	var newCampImage = req.body.newCampImage;
	var newCampDesc = req.body.newCampDesc;
	var newCampPrice = Math.round( req.body.newCampPrice * 1e2 ) / 1e2; //rounding don't work, why???
	// 1st WAY TO ADD AUTHOR:
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCamp = {name: newCampName, image: newCampImage, description: newCampDesc, price: newCampPrice, author: author};
	// MongoDB: Create a new object in Campgrounds Collection:
	Campground.create(newCamp, function(err, campground){
		if(err){
			console.log('ERROR:');
			console.log(err);
			// FLASH MESSAGE:
			req.flash("error", "Oops! Something went wrong... Try again :)");
		} else {
			/* // 2nd WAY TO ADD AUTHOR (like in comments):
			//Add username and user id to a comment
			campground.author.id = req.user._id;
			campground.author.username = req.user.username;
			// save new campground with username
			campground.save();
			*/
			console.log("NEWLY CREATED Campground: ");
			console.log(campground);
			//FLASH MESSAGE:
			req.flash("success", "Successfully added a new Campground :)");
			// Redirect back to campgrounds page:
			res.redirect("/campgrounds"); //We have two "/campgrounds" URL routes, but by defoult it redirects to GET (not to POST)
		}
	});
});


// **RESTful NEW route - form to add a new object:
// REST convention: we add data (form) by the same url which shows data, but with "/new" on the end
router.get("/new", middleware.isLoggedIn, function(req, res) {
	res.render("campgrounds/new");
});


// **RESTful SHOW route - shows info about one object
// IMPORTANT: ":id" could be any word/number ==> we have to declare "/campgrounds/new" route before ":id" - otherwise app.js will use "new" as ":id" and use this route:
router.get("/:id", function (req, res) {
	//find the campground with provided ID (ID's are unique in whole DB, so it shows only one object)
	// populate (like JOIN in SQL) = aggregate a data from other collections (SQL JOIN make it with tables)
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		} else {
			// console.log(foundCampground);
			// Render campground EJS template and pass data from Mongo DB to whis template:
			res.render("campgrounds/show", {campground: foundCampground});
			
			// We don't need "req: req" becouse in template we use currentUser form app.js
			// res.render("campgrounds/show", {campground: foundCampground, req: req});
		}
	});
});


// **RESTful EDIT Route - form to edit one object
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	/* //REFACTORIZATION - we use checkCampgroundOwnership middleware function instead of this:
	// is user logged in?
	if(req.isAuthenticated()){
	*/
		Campground.findById(req.params.id, function(err, foundCampground){
			/* //REFACTORIZATION C.D.
			if(err){ // we already chacked if there was an error in midleware function
				res.redirect("/campgrounds");
			} else {
				// does logged in user own this campground?
				if(foundCampground.author.id.equals(req.user._id)){ // to compare we have to use node method .equals
				// we can't compare them with == or ===, becouse they are Mongoos objects, not a strings or numbers (we can't compare objects)
				// if(foundCampground.author.id === req.user._id){ // so it won't work
					console.log(foundCampground.author.id + " " + typeof foundCampground.author.id); // Mongoos object
					console.log(req.user._id + " " + typeof req.user._id); // String? (so first is not identical "===" with second)
			*/
					res.render("campgrounds/edit", {campground: foundCampground}); //send "campground:" to ejs template
				
			/* REFACTORIZATION C.D.
				} else {
					console.log(foundCampground.author.id + " " + typeof foundCampground.author.id); // Mongoos object
					console.log(req.user._id + " " + typeof req.user._id); // on Udemy course it was a string, but it is an object too
					res.send("It's not Your Campground, You dont have permission to edit it");
				} 
			}
			*/
		});
	/*
	} else { //if user is not logged in:
		res.redirect("/login");
	}*/
});


// **RESTful UPDATE Route - change an object in DB
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	// find and update the corect campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			// FLASH MESSAGE:
			req.flash("error", "Oops! Something went wrong... Ty again :)");
			res.redirect("/campgrounds");
		} else {
			//FLASH MESSAGE:
			req.flash("success", "Successfully edited a Campground :)");
			// redirect to show page with edited campground
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// **RESTful DISTROY Route - delete an object in DB
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	// res.send("delete");
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			// FLASH MESSAGE:
			req.flash("error", "Oops! Something went wrong... Ty again :)");
			res.redirect("/campgrounds/" + req.params.id);
		} else {
			//FLASH MESSAGE:
			req.flash("success", "Campground is deleted :)");
			res.redirect("/campgrounds");
		}
	});
});

/////////////////////////////////////////////////////////////////////////////////////
// MIDDLEWARE FUNCTIONS WARE HERE :)
// 1. REFACTORIZATION was to use 1 more universal function in many routes.
// 2. REFACTORIZATION is to move all middleware functions to /middleware/index.js
/////////////////////////////////////////////////////////////////////////////////////

// When something is in separate file, we have to export it (and then require it in app.js)
module.exports = router;