let myUsername = "";
const socket = io();


// https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
function cookieExists(cookie) {
	return document.cookie.split(';').some((item) => item.trim().startsWith(cookie + '='))
}

// https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
function cookieValue(cookie) {
	return document.cookie.split('; ').find(row => row.startsWith(cookie)).split('=')[1];
}

function sendChatMessage(content) {
	const msg = {
		"content" : content,
		"sender" : "",
		"timestamp" : "",
		"color" : ""
	}

	if (msg["content"].length > 0) {
		socket.emit("chat message", msg);
	}
}

function addMessage(msg) {
	let emojifiedText = msg["content"].replaceAll(":)", "😁").replaceAll(":(", "🙁").replaceAll(":o", "😲");

	const content = msg["timestamp"] + " " + msg["sender"] + ": " + emojifiedText;
	const name = $("<span>").text(msg["sender"]);
	name.css("color", "#" + msg["color"]);
	name.addClass("name");

	const timestamp = $("<span>").text(msg["timestamp"]);
	timestamp.addClass("timestamp");

	const text = $("<p>").text(emojifiedText);
	text.addClass("text");

	const message = $("<div>").append(name, timestamp, text);
	//message.css("color", "#" + msg["color"]);
	if (msg["sender"] == myUsername) {
		message.css("font-weight", "bold");
	}

	$("#messages").append(message);

	const children = $("#messages").children();
	const messageHeight = children[0].offsetHeight * children.length;
	$("#message-container").scrollTop(messageHeight);
}

socket.on("chat message", function(msg) {
	addMessage(msg);
});

socket.on("set username", function(newName) {
	if (cookieExists("username")) {
		const username = cookieValue("username");
		//console.log("cookie=" + username);
		if (newName != username) {
			sendChatMessage("/name " + username);
		}
	} else {
		//console.log("Name updated to " + newName);
		document.cookie = "username=" + newName;
		myUsername = newName;
	}
});

socket.on("username", function(newName) {
	console.log("Name updated to " + newName);
	document.cookie = "username=" + newName;
	myUsername = newName;
});

socket.on("update list", function(users) {
	$("#userlist").empty();

	for (let name in users) {
		let displayName = name;
		if (displayName == myUsername) {
			displayName += " (You)";
		}
		
		const item = $("<p>").text(displayName);
		item.css("color", "#" + users[name]);
		$("#userlist").append(item);
	}
});

socket.on("clear messages", function() {
	$("#messages").empty();
});

socket.on("reload messages", function({messages}) {
	$("#messages").empty();
	messages.forEach(msg => addMessage(msg));
});

$("form").submit(function(e) {
	e.preventDefault();

	sendChatMessage($("#m").val());
	$("#m").val("");

	return false;
});