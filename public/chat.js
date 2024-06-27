document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const chatMessages = document.querySelector('.chat-messages');
  const userList = document.getElementById('users');
  const token = window.chatToken;
  const groupId = window.groupId;

  const socket = io({
      auth: {
          token: token,
      }
  });

  // Join chatroom
  socket.emit('joinGroup', groupId);
  console.log("Joining group with ID:", groupId);

  // Listen for rejoinGroup event
  socket.on('rejoinGroup', (data) => {
      const { group } = data;
      console.log("Rejoining group:", group);
      outputUsers(group);
  });

  // Listen for groupUser event
  socket.on('groupUser', (data) => {
      const { group } = data;
      console.log("Updating group users:", group);
      outputUsers(group);
  });

  // Listen for newMessage event
  socket.on('newMessage', (message) => {
      outputMessage(message);
      chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // Handle form submission
  chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let msg = e.target.elements.msg.value.trim();
      if (!msg) {
          return false;
      }
      socket.emit('sendMessage', { groupId, content: msg });
      e.target.elements.msg.value = '';
      e.target.elements.msg.focus();
  });

  // Handle leave button click
  document.getElementById('leave-btn').addEventListener('click', () => {
      socket.emit('leaveGroup', groupId);
      localStorage.removeItem('currentGroupId');
      window.location.href = '/';
  });

  // Output message to DOM
  function outputMessage(message) {
      const div = document.createElement('div');
      div.classList.add('message');
      const formattedTime = new Date(message.createdAt).toLocaleString();
      div.innerHTML = `<p class="meta">${message.sender} <span>${formattedTime}</span></p>
                       <p class="text">${message.content}</p>`;
      chatMessages.appendChild(div);
  }

  // Output users to DOM
  function outputUsers(group) {
      userList.innerHTML = '';
      group.members.forEach((user) => {
          const li = document.createElement('li');
          li.innerText = user.username;
          userList.appendChild(li);
      });
  }
});
