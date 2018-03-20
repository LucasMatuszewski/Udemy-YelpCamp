var express = require("express");
var router = express.Router();
var Training = require("../models/training");
var middleware = require("../middleware"); // if file name is index.js the folder name is enough
// to use methods required from other file, we have to use object name, like: middleware.isLoggedIn

// ROUTER:
// Without Router it was: app.get("/trainings", callback)

// **RESTful INDEX route - shows a list of objects:
router.get("/", function(req, res){ //it was .get("/trainings", callback) but we use default URL in app.use("/trainings", trainingsRoutes) in app.js
	// Check if user is logedin and give its ID and username
	console.log(req.user);
	// 1) Get all trainings form DB:
	Training.find({}, function(err, allTrainings){
		if(err){
			console.log(err);
		} else {
			// 2) Render new EJS template and pass data from Mongo DB to this template:
			res.render("trainings/index", {trainings: allTrainings});
		}
	});
});


// IMPORTANT:
// This is a REST convention. We use the same URL route to send data by POST, and to GET data of the same type.

// **RESTful CREATE route - add a new object to DB:
router.post("/", middleware.isLoggedIn, function(req, res){
	// Get data from form and add to training array
	// (to read data sended by form we use body-parser to make body object)
	// MongoDB: Create a new object in Trainings Collection:
	Training.create(req.body.training, function(err, training){
		if(err){
			console.log('ERROR:');
			console.log(err);
			// FLASH MESSAGE:
			req.flash("error", "Oops! Something went wrong... Try again :)");
		} else {
			// 2nd WAY TO ADD AUTHOR (like in comments):
			//Add username and user id to a comment
			training.author.id = req.user._id;
			training.author.username = req.user.username;
			// save new training with username
			training.save();
			
			console.log("NEWLY CREATED Training: ");
			console.log(training);
			//FLASH MESSAGE:
			req.flash("success", "Successfully added a new Training :)");
			// Redirect back to trainings page:
			res.redirect("/trainings"); //We have two "/trainings" URL routes, but by defoult it redirects to GET (not to POST)
		}
	});
});


// **RESTful NEW route - form to add a new object:
// REST convention: we add data (form) by the same url which shows data, but with "/new" on the end
router.get("/new", middleware.isLoggedIn, function(req, res) {
	res.render("trainings/new");
});


// **RESTful SHOW route - shows info about one object
// IMPORTANT: ":id" could be any word/number ==> we have to declare "/trainings/new" route before ":id" - otherwise app.js will use "new" as ":id" and use this route:
router.get("/:id", function (req, res) {
	//find the training with provided ID (ID's are unique in whole DB, so it shows only one object)
	// populate (like JOIN in SQL) = aggregate a data from other collections (SQL JOIN make it with tables)
	Training.findById(req.params.id).populate("comments").exec(function(err, foundTraining){
		if(err){
			console.log(err);
		} else {
			// console.log(foundTraining);
			// Render training EJS template and pass data from Mongo DB to this template:
			res.render("trainings/show", {training: foundTraining});
			
			// We don't need "req: req" becouse in template we use currentUser form app.js
			// res.render("trainings/show", {training: foundTraining, req: req});
		}
	});
});


// **RESTful EDIT Route - form to edit one object
router.get("/:id/edit", middleware.checkTrainingOwnership, function(req, res){
	/* //REFACTORIZATION - we use checkTrainingOwnership middleware function instead of this:
	// is user logged in?
	if(req.isAuthenticated()){
	*/
		Training.findById(req.params.id, function(err, foundTraining){
			/* //REFACTORIZATION C.D.
			if(err){ // we already chacked if there was an error in midleware function
				res.redirect("/trainings");
			} else {
				// does logged in user own this training?
				if(foundTraining.author.id.equals(req.user._id)){ // to compare we have to use node method .equals
				// we can't compare them with == or ===, becouse they are Mongoos objects, not a strings or numbers (we can't compare objects)
				// if(foundTraining.author.id === req.user._id){ // so it won't work
					console.log(foundTraining.author.id + " " + typeof foundTraining.author.id); // Mongoos object
					console.log(req.user._id + " " + typeof req.user._id); // String? (so first is not identical "===" with second)
			*/
					res.render("trainings/edit", {training: foundTraining}); //send "training:" to ejs template
				
			/* REFACTORIZATION C.D.
				} else {
					console.log(foundTraining.author.id + " " + typeof foundTraining.author.id); // Mongoos object
					console.log(req.user._id + " " + typeof req.user._id); // on Udemy course it was a string, but it is an object too
					res.send("It's not Your Training, You dont have permission to edit it");
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
router.put("/:id", middleware.checkTrainingOwnership, function(req, res){
	// find and update the corect training
	Training.findByIdAndUpdate(req.params.id, req.body.training, function(err, updatedTraining){
		if(err){
			// FLASH MESSAGE:
			req.flash("error", "Oops! Something went wrong... Ty again :)");
			res.redirect("/trainings");
		} else {
			//FLASH MESSAGE:
			req.flash("success", "Successfully edited a Training :)");
			// redirect to show page with edited training
			res.redirect("/trainings/" + req.params.id);
		}
	});
});

// **RESTful DISTROY Route - delete an object in DB
router.delete("/:id", middleware.checkTrainingOwnership, function(req, res){
	// res.send("delete");
	Training.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			// FLASH MESSAGE:
			req.flash("error", "Oops! Something went wrong... Ty again :)");
			res.redirect("/trainings/" + req.params.id);
		} else {
			//FLASH MESSAGE:
			req.flash("success", "Training is deleted :)");
			res.redirect("/trainings");
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