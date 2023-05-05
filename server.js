const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

// From utillities directory
const formatMessage = require('./utilities/message')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utilities/users')


const botName = 'ChatBot'


const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// run when client connects
io.on('connection', (socket) => {

	socket.on('joinRoom', ({ username, room }) => {
		const user = userJoin(socket.id, username, room);

		socket.join(user.room);


		// this is for the client
		// socket.emit('message', 'welcome to chatroom');
		socket.emit('message', formatMessage(botName, `welcome to ${room} chatroom`));

		// broadcast when a user connects: this will notify every user except the current user that is connected
		socket.broadcast
			.to(user.room)
			.emit('message', formatMessage(botName, `${user.username} has Joined the chat`));

		//send users and room info
		io.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getRoomUsers(user.room)
		});
	});



	// Listen for chat messages
	socket.on('chatMessage', (msg) => {
		// console.log(msg);
		// io.emit('message', msg);
		const user = getCurrentUser(socket.id);
		io
			.to(user.room)
			.emit('message', formatMessage(user.username, msg));
	})


	// Runs when client disconnects
	socket.on('disconnect', () => {
		const user = userLeave(socket.id);
		if (user) {
			io.to(user.room)
				.emit('message', formatMessage(botName, `${user.username} has left the chat`));
		}
	});

});




const PORT = 4000 || process.env.PORT

server.listen(PORT, () => {
	console.log(`server running on port ${PORT}`);
});