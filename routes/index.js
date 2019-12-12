const express = require("express");
const router = express.Router();
const io = require("socket.io");
const io_client = require("socket.io-client");

const Work = require("../models/work");
var server = io.listen(2999);
var ports = [3001, 3002];
var sockets = [];
for (var i = 0; i < ports.length; i++) {
	sockets.push(io_client("http://localhost:" + ports[i]));
}
var busy = Array(sockets.length).fill(false);

server.on("connection", client => {
	for (var i = 0; i < sockets.length; i++) {
		var j = i;
		sockets[i].on("progress", data => {
			// console.log(data);
			client.emit("progress", data);
		});
		sockets[i].on("done", data => {
			Work.findOneAndUpdate(
				{
					_id: data.task
				},
				{
					$set: { result: data.result, status: "done", progress: 100 }
				},
				(err, result) => {
					// res.redirect("/");
				}
			);
			client.emit("done", data);
			var port = ports[j];
			Work.findOneAndUpdate(
				{ status: "in queue" },
				{ $set: { status: "in progress", server: port } },
				(err, result) => {
					if (err) {
						console.log(err);
					}
					if (result == null) {
						j = ports.indexOf(data.task.server);
						busy[j] = false;
					} else {
						sockets[j].emit("work", result);
					}
				}
			);
		});
	}
});
router.get("/", (req, res) => {
	console.log(busy);
	if (req.user) {
		Work.find({ user: req.user._id }, (err, results) => {
			res.render("main/index", {
				title: "Balancer",
				isLoggedIn: true,
				history: results.reverse()
			});
		});
	} else {
		res.render("main/index", {
			title: "Balancer",
			isLoggedIn: false,
			history: false
		});
	}
});

router.post("/add-to-queue", (req, res) => {
	let work = new Work({
		user: req.user,
		time: new Date(),
		data: req.body.input,
		status: "in queue",
		progress: 0
	});
	for (var i = 0; i < sockets.length; i++) {
		if (!busy[i]) {
			work.status = "in progress";
			work.server = ports[i];
			sockets[i].emit("work", work);
			busy[i] = true;
			break;
		}
	}
	work.save((err, resut) => {
		res.redirect("/");
	});
});

module.exports = router;
