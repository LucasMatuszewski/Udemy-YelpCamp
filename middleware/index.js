//all the middleware goes here
// becouse this file name is index.js we could require only a folder name in other files.
// index.js is always defoult file in a folder. It require other files.

// Becouse methods used in this file use models, we have to require them:
var Training = require("../models/training");
var Comment = require("../models/comment");


/////////////////////////////////////////////
// 3 WAYS TO EXPORT OBJECTS WITH METHODS: //
///////////////////////////////////////////

// 1. First way to export object with methods:
var middlewareObj = {};

middlewareObj.checkTrainingOwnership = function(){

};

middlewareObj.checkCommentOwnership = function(){

};

module.exports = middlewareObj;


// 2. Second way to export object with methods:

var middlewareObj = {
	checkTrainingOwnership: function(){

	},
	checkCommentOwnership: function(){

	}
};

module.exports = middlewareObj;

// 3. Anather way to export object with methods:

module.exports = {
	checkTrainingOwnership: function(){

	},
	checkCommentOwnership: function(){

	}
};


/////////////////////////////////////////////////////
// REFACTORIZATION: 

var middlewareObj = {
	//MIDLEWARE FUNCTION TO CHECK if user is LOGGED IN
	isLoggedIn: function(req, res, next){
		if(req.isAuthenticated()){
			return next();
		}
		// FLASH should be before "res." - req.flash("name/type", "message")
		// We SET a message to be send by /login route, but we need a script in route to SEND it and in a view to SHOW it (partials/header).
		req.flash("error", "You need to be logged in to do that! :)");
		res.redirect("/login");
	},
	// Midleware function to check if logged in user is author of an object:
	checkTrainingOwnership: function(req, res, next){
		// is user logged in?
		if(req.isAuthenticated()){
			Training.findById(req.params.id, function(err, foundTraining){
			if(err){
				// FLASH MESSAGE:
				req.flash("error", "Oops, Training not found :/");
				res.redirect("back"); // it will redirect one step back in a browser (its universal)
			} else {

				//with changed ID in URL app.js will crash.
				//So if foundTraining doesn't exist throw error and go back:
				if(!foundTraining){
					req.flash("error", "Oops, Training not found :/");
					return res.redirect("back");
				}

				// does logged in user own this training?
				if(foundTraining.author.id.equals(req.user._id)){ // to compare we have to use node method .equals
				// we can't compare them with == or ===, becouse they are Mongoos objects, not a strings or numbers (we can't compare objects)
				// if(foundTraining.author.id === req.user._id){ // so it won't work
					console.log("Author and logged in User are the same:");
					console.log(foundTraining.author.id + " " + typeof foundTraining.author.id); // Mongoos object
					console.log(req.user._id + " " + typeof req.user._id); // String? (so first is not identical "===" with second)

					next(); // if logged in user is an author, function will do next thing (callback)

					/* //We don't render here, becouse this function have to be universal. So we use next()
					// BEFORE REFACTORISATION:
					res.render("trainings/edit", {training: foundTraining}); //send "training:" to ejs template
					*/
				} else {
					// FLASH MESSAGE:
					req.flash("error", "Oops! You can edit or delete only Your Trainings :)");

					console.log("Author and logged in User are NOT the same:");
					console.log(foundTraining.author.id + " " + typeof foundTraining.author.id); // Mongoos object
					console.log(req.user._id + " " + typeof req.user._id); // on Udemy course it was a string, but it is an object too
					// res.send("It's not Your Training, You dont have permission to edit it");
					res.redirect("back");
				}
			}
		});
		} else { //if user is not logged in:
			console.log("User is not logged in");
			// FLASH MESSAGE:
			req.flash("error", "You need to be logged in to edit a training :)");
			res.redirect("/login");
		}
	},
	// Midleware function to check if logged in user is author of an object:
	checkCommentOwnership: function(req, res, next){
		// is user logged in?
		if(req.isAuthenticated()){
			Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				console.log(err);
				res.redirect("back"); // it will redirect one step back in a browser (its universal)
			} else {
				// does logged in user own this comment?
				if(foundComment.author.id.equals(req.user._id)){ // to compare we have to use node method .equals
				// we can't compare them with == or ===, becouse they are Mongoos objects, not a strings or numbers (we can't compare objects)
				// if(foundTraining.author.id === req.user._id){ // so it won't work
					console.log("Author and logged in User are the same:");
					console.log(foundComment.author.id + " " + typeof foundComment.author.id); // Mongoos object
					console.log(req.user._id + " " + typeof req.user._id); // String? (so first is not identical "===" with second)

					next(); // if logged in user is an author, function will do next thing (callback)

				} else {
					// FLASH MESSAGE:
					req.flash("error", "Oops! You can edit or delete only Your Comments :)");

					console.log("Author and logged in User are NOT the same:");
					console.log(foundComment.author.id + " " + typeof foundComment.author.id); // Mongoos object
					console.log(req.user._id + " " + typeof req.user._id); // on Udemy course it was a string, but it is an object too
					// res.send("It's not Your Training, You dont have permission to edit it");
					res.redirect("back");
				}
			}
		});
		} else { //if user is not logged in:
			// FLASH MESSAGE:
			req.flash("error", "You need to be logged in to edit a comment :)");
			console.log("User is not logged in");
			res.redirect("/login");
		}
	}
};

module.exports = middlewareObj;