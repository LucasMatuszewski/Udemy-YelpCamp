// we have to require mongoose in every file we use Mongoose
var mongoose = require("mongoose");

// MongoDB SCHEMA SETUP:
var commentSchema = new mongoose.Schema({
	text: String,
	author: { // object with refference to User Schema for UserID, and with username saved as a string in DB
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String // String, so if User save a Username it will not change
	}
});

// Export new Model named "Campground" (it will create new collection named "Campgrounds"):
module.exports = mongoose.model("Comment", commentSchema);