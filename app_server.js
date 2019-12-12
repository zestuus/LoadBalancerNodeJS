const check = port => {
	port = Number(port);
	if (!Number.isInteger(port)) {
		console.log("Error: port number must be integer!");
		process.exit(1);
	}
	if (65535 < port || port < 1024) {
		console.log("Error: port (" + port + ") is not available!");
		process.exit(1);
	}
};

if (process.argv.length < 3) {
	console.log("Error: You don`t pass any port");
	process.exit(1);
} else if (process.argv.length > 3) {
	console.log("Error: Too much parameters");
	process.exit(1);
}
var port = process.argv[2];
check(port);

const io = require("socket.io").listen(port);
io.on("connection", socket => {
	socket.on("work", task => {
		var i = 0;
		task.server = port;
		let worker = setInterval(
			() => {
				socket.emit("progress", {
					task: task,
					progress: i,
					server: port
				});
				i++;
				if (i > 100) {
					clearInterval(worker);
					socket.emit("done", {
						task: task,
						result: task.data.toUpperCase(),
						server: port
					});
				}
			},
			port == 3001 ? 160 : 150
		);
	});
});

console.log("Connected to port", port);
