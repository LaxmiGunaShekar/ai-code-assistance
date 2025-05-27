/**
 * Developers Chat Feature
 * This file handles the chat functionality for developers to communicate with each other.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Connect to Socket.io server
    const socket = io();
    
    // Create overlay element for blur effect
    const overlay = document.createElement('div');
    overlay.className = 'page-overlay';
    document.body.appendChild(overlay);
    
    // DOM elements
    const chatButton = document.getElementById('chat-button');
    const chatContainer = document.getElementById('chat-container');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendButton = document.getElementById('chat-send');
    const chatCodeButton = document.getElementById('chat-code');
    const chatCloseButton = document.getElementById('chat-close');
    const usersButton = document.getElementById('users-button');
    const userList = document.getElementById('user-list');
    const userListItems = document.getElementById('user-list-items');
    
    // Username modal elements
    const usernameModal = document.getElementById('username-modal');
    const usernameForm = document.getElementById('username-form');
    const usernameInput = document.getElementById('username-input');
    
    // User data
    let currentUser = {
        id: null,
        username: null
    };
    
    // Show username modal when chat is first opened
    chatButton.addEventListener('click', function() {
        if (!currentUser.username) {
            usernameModal.style.display = 'flex';
            setTimeout(() => {
                usernameModal.classList.add('active');
                overlay.classList.add('active');
                document.body.classList.add('chat-open');
            }, 10);
        } else {
            toggleChat();
        }
    });
    
    // Handle username submission
    usernameForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            currentUser.username = username;
            socket.emit('join', username);
            usernameModal.classList.remove('active');
            setTimeout(() => {
                usernameModal.style.display = 'none';
                // Don't remove overlay yet as we're opening the chat
                toggleChat();
            }, 300);
        }
    });
    
    // Toggle chat container visibility
    function toggleChat() {
        const isOpening = !chatContainer.classList.contains('active');
        
        if (isOpening) {
            // Opening the chat
            chatContainer.classList.add('active');
            overlay.classList.add('active');
            document.body.classList.add('chat-open');
            scrollToBottom();
        } else {
            // Closing the chat
            chatContainer.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('chat-open');
        }
    }
    
    // Close chat when clicking the close button
    chatCloseButton.addEventListener('click', function() {
        chatContainer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('chat-open');
    });
    
    // Toggle user list visibility
    usersButton.addEventListener('click', function() {
        userList.classList.toggle('active');
    });
    
    // Send message when clicking send button or pressing Enter
    chatSendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Send code from editor when clicking code button
    chatCodeButton.addEventListener('click', sendCode);
    
    // Function to send a regular message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            socket.emit('chat_message', {
                message: message,
                isCode: false
            });
            chatInput.value = '';
        }
    }
    
    // Function to send code from the editor
    function sendCode() {
        try {
            // Get code from CodeMirror editor
            const editor = document.querySelector('.CodeMirror').CodeMirror;
            const code = editor.getValue();
            const language = document.getElementById('language-select').value;
            
            if (code && code.trim() !== '') {
                const codeMessage = `Language: ${language}\n\n${code}`;
                socket.emit('chat_message', {
                    message: codeMessage,
                    isCode: true
                });
            } else {
                addSystemMessage('No code to send. Please write some code in the editor first.');
            }
        } catch (error) {
            addSystemMessage('Error sending code: ' + error.message);
        }
    }
    
    // Add a system message to the chat
    function addSystemMessage(message) {
        const systemMsg = document.createElement('div');
        systemMsg.className = 'chat-message system';
        systemMsg.innerHTML = `<div class="message-content">${message}</div>`;
        chatMessages.appendChild(systemMsg);
        scrollToBottom();
    }
    
    // Format timestamp for display
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Scroll to the bottom of the chat messages
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Update the user list in the UI
    function updateUserList(users) {
        userListItems.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.username;
            userListItems.appendChild(li);
        });
    }
    
    // Socket.io event handlers
    
    // When a user joins
    socket.on('user_joined', function(data) {
        updateUserList(data.users);
        if (data.id !== socket.id) {
            addSystemMessage(`${data.username} joined the chat`);
        }
    });
    
    // When a user leaves
    socket.on('user_left', function(data) {
        updateUserList(data.users);
        addSystemMessage(`${data.username} left the chat`);
    });
    
    // When receiving the current user list
    socket.on('user_list', function(users) {
        updateUserList(users);
    });
    
    // When receiving a chat message
    socket.on('chat_message', function(data) {
        const messageDiv = document.createElement('div');
        const isSelf = data.id === socket.id;
        
        if (data.isCode) {
            // Handle code message differently
            messageDiv.className = 'chat-message code-message';
            messageDiv.innerHTML = `
                <div class="username">${data.username}</div>
                <pre>${data.message}</pre>
                <div class="timestamp">${formatTimestamp(data.timestamp)}</div>
            `;
        } else {
            // Regular message
            messageDiv.className = isSelf ? 'chat-message sent' : 'chat-message received';
            messageDiv.innerHTML = `
                <div class="username">${data.username}</div>
                <div class="message-content">${data.message}</div>
                <div class="timestamp">${formatTimestamp(data.timestamp)}</div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    });
});
