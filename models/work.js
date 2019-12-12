const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var workSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: "User" },
	time: { type: Date, required: true },
	data: { type: String, required: true },
	status: { type: String, required: true },
	progress: { type: Number, required: true },
	result: { type: String, required: false },
	server: { type: Number, required: false }
});

module.exports = mongoose.model("Work", workSchema);
