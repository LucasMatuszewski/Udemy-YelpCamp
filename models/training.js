//
// MODELS - folder with js files to manage data structure / logic of aplication (like in MVC)
// View - visualize output data (from model?) - our ejs templates
// Controler - interface, takes input data, process them and sents it to model and view.

// we have to require mongoose in every file we use Mongoose
var mongoose = require("mongoose");

// MongoDB SCHEMA SETUP:
var trainingSchema = new mongoose.Schema({
	name: String,
	urlAddress: String,
	active: Number,
	category: String,
	subcategory: String,
	image: String,
	shortDesc: String,
	description: String,
	price: Number,
	audience: String,
	goals: String,
	benefits: String,
	methodology: String,
	sylabus: String,
	keywords: String,
	promotion: Number,
	comments: [{ //array, becouse there could be many comments to one training
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	}], // array with refference to Schema of Comments. Save Id's of Comments here
	author: {
		id: { // without array, becouse there could be only one author of training
			type: mongoose.Schema.Types.ObjectId,
			ref: "User" // refference to User Schema to add
		},
		username: String
	}
});

// Export new Model named "Training" (it will create new collection named "Trainings"):
module.exports = mongoose.model("Training", trainingSchema);
