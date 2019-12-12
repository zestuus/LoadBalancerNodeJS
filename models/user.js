const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

var userSchema = new Schema({
	email: { type: String, required: true },
	password: { type: String, required: true },
	name: { type: String, required: false },
	address: { type: String, required: false },
	birth_date: { type: Date, required: false },
	bio: { type: String, required: false }
});

userSchema.methods.encryptPassword = password => {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = (password, user) => {
	return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model("User", userSchema);
