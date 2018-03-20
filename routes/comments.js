var express = require("express");
var router = express.Router({mergeParams: true}); //with this option we can use :id from app.js
var Training = require("../models/training");
var Comment = require("../models/comment");
var middleware = require("../middleware"); // if file name is index.js the folder name is enough


//========================
// **RESTful NESTED ROUTES - routes to objects connected with main object (like comments, tags)
//========================
// Main SHOW Route:		trainings/:id GET (one item)
// Nested NEW Route:	trainings/:id/comments/new GET (form to add new comment)
// Nested CREATE Route:	trainings/:id/comments POST


// **RESTful NEW route - form to add a new object:
// REST convention: we add data (form) by the same url which shows data, but with "/new" on the end
router.get("/new", middleware.isLoggedIn, function(req, res){ //it was .get("/trainings/:id/comments/new", callback) but we use default URL in app.use("/trainings/:id/comments", cammentsRoutes) in app.js
	// isLoggedIn - middleware checking if user is logged in before continue
	//find Training by id
	Training.findById(req.params.id, function(err, foundTraining){
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {training: foundTraining});	
		}
	});
});

// **RESTful CREATE route - add a new object to DB:
router.post("/", middleware.isLoggedIn, function(req, res){
	//lookup training using ID
	Training.findById(req.params.id, function(err, foundTraining){
		if(err){
			console.log(err);
			// FLASH MESSAGE:
			req.flash("error", "Oops! Training not found... Try again :)");
			res.redirect("/trainings");
		} else {
			//create a new comment
			//var newComment = { text: req.body.comment.text, author: req.body.comment.author};
			//we don't need newComment becouse Grouped HTML name="comment[xxx]" is an object ready to use
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					// FLASH MESSAGE:
					req.flash("error", "Oops! Something went wrong... Try again :)");
					console.log(err);
				} else {
					//Add username and user id to a comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//Save a comment
					comment.save();
					//connect new comment to training
					foundTraining.comments.push(comment._id); //push becouse comments are in array
					foundTraining.save();
					console.log("New Comment Added: " + comment);
					//FLASH MESSAGE:
					req.flash("success", "Successfully added a new comment :)");
					//redirect to a show page of training with new comment
					res.redirect("/trainings/" + foundTraining._id);
				}
			});
		}
	});
});

//
// I DID EDIT / DELETE / Authorization for comments by myself without help :D
//

// **RESTful EDIT Route - form to edit a comment
// e.g. URL: http://localhost:3000/trainings/5a9c706b076ed633f4df4e3b/comments/5a9c70c4076ed633f4df4e3f/edit
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			// FLASH MESSAGE:
			req.flash("error", "Oops! Comment not found... Try again :)");
			console.log(err);
		} else {
			console.log("Comment to edit:" + foundComment.text);
			// If we would like to use only ID of training, we don't need findById, becouse we have it in URL
			// But if we want to use also name of Training, we have to use findById like this:
			Training.findById(req.params.id, function(err, foundTraining){
				if(err){
					// FLASH MESSAGE:
					req.flash("error", "Oops! Training not found... Try again :)");
					console.log(err);
				} else {
					res.render("comments/edit", {comment: foundComment, training: foundTraining});
				}
			});
		}
	});
});

// **RESTful UPDATE Route - change an object id DB
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			// FLASH MESSAGE:
			req.flash("error", "Oops! Something went wrong... Ty again :)");
			console.log(err);
			res.redirect("back");
		} else {
			//FLASH MESSAGE:
			req.flash("success", "Successfully edited a Comment :)");
			res.redirect("/trainings/" + req.params.id);
		}
	});
});

// **RESTful DISTROY Route - deleta an object in DB
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			// FLASH MESSAGE:
			req.flash("error", "Oops! Something went wrong... Ty again :)");
			console.log(err);
			res.redirect("back");
		} else {
			//FLASH MESSAGE:
			req.flash("success", "Comment is deleted :)");
			res.redirect("/trainings/" + req.params.id);
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