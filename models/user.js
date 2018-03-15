var mongoose 				= require("mongoose"),
	passportLocalMongoose 	= require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	password: String
});

// Add functionalities/methods from "passport-local-mongoose" tool to our Model UserSchema
UserSchema.plugin(passportLocalMongoose);//eg. serialize/deserialize method to encode/decode data in/from session

// mongoose.model("SINGULAR NAME OF MODEL", SHEMA-NAME)
// Mongoose automatically looks for the plural version of your model name.
// (eg. "User" model automaticaly is for the "Users" collection in DB)
module.exports = mongoose.model("User", UserSchema);