

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatMessages = document.querySelector('.chat-messages');
   
  
   
    const token = window.chatToken;
    const groupId = window.groupId;
    console.log('Token retrieved from embedded script:', groupId);
      const socket = io({
          auth: {
              token: token,
          }
      });
  
    // Join chatroom
   
    socket.emit('joinGroup', groupId);
  
    // Listen for messages from the server
    socket.on('newMessage', (message) => {
      outputMessage(message);
  
      // Scroll down
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  
    // Message submit
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      // Get message text
      let msg = e.target.elements.msg.value.trim();
  
      if (!msg) {
        return false;
      }
  
      // Emit message to server
      socket.emit('sendMessage', { groupId, content: msg });
  
      // Clear input
      e.target.elements.msg.value = '';
      e.target.elements.msg.focus();
    });
  
    socket.on('groupUser', (group) => {
      outputUsers(group);
    });

    // Output message to DOM
    function outputMessage(message) {
        const div = document.createElement('div');
        div.classList.add('message');
        const formattedTime = new Date(message.createdAt).toLocaleString();
        div.innerHTML = `<p class="meta">${message.sender} <span>${formattedTime}</span></p>
                         <p class="text">${message.content}</p>`;
        chatMessages.appendChild(div);
    }});
  
    function outputUsers(group) {
      console.log(group);
      const userList = document.getElementById('users');
      userList.innerHTML = '';
      group.group.members.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
      });
    }

    document.getElementById('leave-btn').addEventListener('click', () => {
      socket.emit('disconnect',groupId);
      console.log(groupId);
      window.location.href='/';
    });