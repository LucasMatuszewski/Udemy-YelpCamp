//
// MODELS - folder with js files to manage data structure / logic of aplication (like in MVC)
// View - visualize output data (from model?) - our ejs templates
// Controler - interface, takes input data, process them and sents it to model and view.

// we have to require mongoose in every file we use Mongoose
var mongoose = require("mongoose");

// MongoDB SCHEMA SETUP:
var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	price: Number,
	comments: [{ //array, becouse there could be many comments to one campground
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	}], // array with refference to Schema of Comments. Save Id's of Comments here
	author: {
		id: { // without array, becouse there could be only one author of campground
			type: mongoose.Schema.Types.ObjectId,
			ref: "User" // refference to User Schema to add
		},
		username: String
	}
});

// Export new Model named "Campground" (it will create new collection named "Campgrounds"):
module.exports = mongoose.model("Campground", campgroundSchema);
