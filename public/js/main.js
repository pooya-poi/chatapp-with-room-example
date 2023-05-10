const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const indicator = document.getElementById('typing-indicator')
const inputField = document.getElementById('msg');

let typingTimeout;

//Get User from query string
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true
})
console.log(username, room);

const socket = io();

//join room
socket.emit('joinRoom', { username: username, room: room });

// Get room and username
socket.on('roomUsers', ({ room, users }) => {
	outputRoomName(room);
	outputUsers(users);
});


// Message from server
socket.on('message', (message) => {
	console.log(message);
	outputMessage(message);
});


// Message submit
chatForm.addEventListener('submit', (e) => {
	e.preventDefault();

	// Get the message text from input
	const msg = e.target.elements.msg.value;
	// console.log(msg);

	// Emit message to server
	socket.emit('chatMessage', msg)

	// Clear input
	e.target.elements.msg.value = '';
	e.target.elements.msg.focus();
});


// output message to DOM
function outputMessage(message) {
	const div = document.createElement('div');

	// div.classList.add('message');
	div.classList.add('message-box');
	// div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
	// 					<p class="text">	
	// 					${message.text}					
	// 					</p>`;

	if(message.username == 'ChatBot'){

		div.innerHTML = `
				<div class="avatar">
				<img src="./image/chatbot.png" alt="">
				</div>
				<div class="message">
				<p class="meta">${message.username}<span>${message.time}</span></p>
				<p class="text">
				${message.text}	
				</p>
				</div>
			
		`;
	}else{
		div.innerHTML = `
				<div class="avatar" >
			<img style="width:34px !important" src="./image/user.png" alt="">
				</div>
				<div class="message">
				<p class="meta">${message.username}<span>${message.time}</span></p>
				<p class="text">
				${message.text}	
				</p>
				</div>
			
		`;

	}

	document.querySelector('.chat-messages').appendChild(div);
}


// output room name to DOM
function outputRoomName(room) {
	roomName.innerText = room;
}

// output users to DOM
function outputUsers(users) {
	userList.innerHTML = `
	${users.map(user => `<li>${user.username}</li>`).join('')}
`;
}


inputField.addEventListener('keydown', () => {
	socket.emit('typing');
  });
  
  inputField.addEventListener('keyup', () => {
	socket.emit('not typing');
  });

socket.on('istyping', function (user){
	clearTimeout(typingTimeout); // Clear any existing timeout
	showTypingIndicator(user);
});
socket.on('stoppedtyping', function (user){
	clearTimeout(typingTimeout); // Clear any existing timeout
	typingTimeout = setTimeout(hideTypingIndicator, 1000); // Hide indicator after 1 second of inactivity
});

function showTypingIndicator(user) {
	indicator.innerHTML = `${user.username} is typing ...`;
	indicator.style.display = 'block';
	console.log(user.username + ' typing');
}

function hideTypingIndicator() {
	indicator.innerHTML = '';
	indicator.style.display = 'none !important';
  }