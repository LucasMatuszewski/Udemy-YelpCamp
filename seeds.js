// SEEDING DataBase - make initial data in database (e.g. initial setup of an application, administrator account etc.)

// Error driven development:
// First we write a code wich will give us an error, then we write a code to make this error go away.

var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

// Dummy data with Campgrounds:
var data = [
	{
		name: "Salmon Creek",
		image: "http://haulihuvila.com/wp-content/uploads/2012/09/hauli-huvila-campgrounds-lg.jpg",
		description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed, temporibus, fugit. Odit labore maxime magni vero ut, perspiciatis non repudiandae magnam? Temporibus adipisci consequatur, asperiores assumenda aperiam! Nam, eum, rerum?"
	},
	{
		name: "Cloud's Rest",
		image: "https://media.gettyimages.com/photos/tent-on-clouds-rest-yosemite-picture-id149424870",
		description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed, temporibus, fugit. Odit labore maxime magni vero ut, perspiciatis non repudiandae magnam? Temporibus adipisci consequatur, asperiores assumenda aperiam! Nam, eum, rerum?"
	},
	{
		name: "Borki Camp",
		image: "http://img1.garnek.pl/a.garnek.pl/001/432/1432681_800.0.jpg/zalew-sulejowski.jpg",
		description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed, temporibus, fugit. Odit labore maxime magni vero ut, perspiciatis non repudiandae magnam? Temporibus adipisci consequatur, asperiores assumenda aperiam! Nam, eum, rerum?"
	}
];

function seedDB(){
	// Remove all campgrounds
	Campground.remove({}, function(err){
		if(err){
			console.log(err);
		}
		console.log("removed campgrounds!");
		// Remove all comments
		Comment.remove({}, function(err){
			if(err){
				console.log(err);
			}
			console.log("removed comments");

			// add a few campgrounds (dummy data)
			// we add it inside callback function of remove() becouse JS is asynchronic, and its possible that remove() could be done before create() even if create is before remove
			data.forEach(function(seed){
				Campground.create(seed, function(err, campground){
					if(err){
						console.log(err);
					} else {
						console.log("added a campground");

						// Create a dummy comment
						Comment.create(
							{
								text: "This place is great, but I wish there was internet",
								author: "Homer"
							}, function(err, comment){
								if(err){
									console.log(err);
								} else{
									// Associations - reference to comment ID in Campground
									campground.comments.push(comment._id); //Add ID of new Comment to array
									campground.save();
									console.log("Created new comment");
								}
							}
						);
					}
				});
			});
		});
	});
}

module.exports = seedDB; //we export seedDB function