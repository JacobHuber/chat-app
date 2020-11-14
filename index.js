const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname + "/public"));

let messages = [];

let userNumber = 0;

let users = {};


app.get("/", (req, res) => {
	//res.sendFile(__dirname + '/style.css');
	//res.sendFile(__dirname + '/index.html');

});

function getTimestamp() {
	const date = new Date();
	let hour = date.getHours();
	let minute = date.getMinutes();

	let suffix = "am";
	if (hour > 11) {
		suffix = "pm";
	}

	if (hour > 12) {
		hour -= 12;
	} else if (hour == 0) {
		hour = 12;
	}

	if (minute < 10) {
		minute = "0" + minute.toString();
	}

	const timestamp = hour.toString() + ":" + minute.toString() + suffix;

	return timestamp;
}

function isNameTaken(name) {
	let taken = false;
	for (let id in users) {
		const takenName = users[id]["username"];
		if (takenName == name) {
			taken = true;
			break;
		}
	}

	return taken;
}

function updateList() {
	let names = {};
	for (let id in users) {
		const name = users[id]["username"];
		names[name] = users[id]["color"];
	}

	io.emit("update list", names);
}

function reloadMessages() {
	io.emit("reload messages", {messages});
	//messages.forEach(msg => io.emit("chat message", msg));
}

io.on("connection", (socket) => {
	socket.emit("clear messages");
	const newName = "user" + userNumber.toString();
	users[socket.id] = {
		"username" : newName,
		"color" : "FFFFFF"
	};

	socket.emit("set username", newName);
	userNumber += 1;

	console.log("a user connected as " + newName);
	updateList();

	messages.forEach(msg => socket.emit("chat message", msg));
	
	socket.on("chat message", (msg) => {
		if (msg["content"][0] == "/") {
			let command = msg["content"].slice(1).split(" ");

			const type = command[0];
			if (type == "name") {
				command.shift();
				const newName = command.join(" ");

				if (!isNameTaken(newName)) {
					console.log(users[socket.id]["username"] + " changed their name to " + newName);
					users[socket.id]["username"] = newName;
					socket.emit("username", newName);
					socket.emit("reload messages", {messages});
					updateList();
				}
			} else if (type == "color") {
				const col = command[1];

				users[socket.id]["color"] = col;

				for (let i = 0; i < messages.length; i++) {
					if (messages[i]["sender"] == users[socket.id]["username"]) {
						messages[i]["color"] = col;
					}
				}

				reloadMessages();
				updateList();
			}
		} else {
			msg["sender"] = users[socket.id]["username"];
			msg["timestamp"] = getTimestamp();
			msg["color"] = users[socket.id]["color"];

			messages.push(msg);
			if (messages.length > 200) {
				messages.shift();
			}

			io.emit("chat message", msg);
		}
	});

	socket.on("disconnect", () => {
		console.log(users[socket.id]["username"] + " has disconnected.")
		delete(users[socket.id]);

		updateList();
	});

});


http.listen(parseInt(process.argv[2]), () => {
	console.log("listening on *:" + process.argv[2]);
});