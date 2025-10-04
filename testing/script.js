// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, get, orderByChild, update, remove } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCDCwNxZto-1OFSkpFOHY_CvXig99TB_po",
  authDomain: "chatlobby-6f969.firebaseapp.com",
  databaseURL: "https://chatlobby-6f969-default-rtdb.firebaseio.com/",
  projectId: "chatlobby-6f969",
  storageBucket: "chatlobby-6f969.firebasestorage.app",
  messagingSenderId: "939856304247",
  appId: "1:939856304247:web:353e71ea8e68d8467e8e72",
  measurementId: "G-J2GYLYM03S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM elements
const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const nameInput = document.getElementById("name-input");
const setNameBtn = document.getElementById("set-name-btn");
const currentUserSpan = document.getElementById("current-user");

// User state
let currentUserName = localStorage.getItem('chatUserName') || '';

// Initialize user interface
function initializeUser() {
  if (currentUserName) {
    currentUserSpan.textContent = `Chatting as: ${currentUserName}`;
    nameInput.style.display = 'none';
    setNameBtn.textContent = 'Change Name';
  } else {
    currentUserSpan.textContent = '';
    nameInput.style.display = 'block';
    setNameBtn.textContent = 'Set Name';
  }
}

// Set name functionality
setNameBtn.addEventListener("click", () => {
  if (currentUserName && nameInput.style.display === 'none') {
    // Show input to change name
    nameInput.style.display = 'block';
    nameInput.value = currentUserName;
    setNameBtn.textContent = 'Save Name';
    nameInput.focus();
  } else {
    // Set or update name
    const newName = nameInput.value.trim();
    if (newName) {
      currentUserName = newName;
      localStorage.setItem('chatUserName', currentUserName);
      initializeUser();
    } else {
      alert('Please enter a valid name');
    }
  }
});

// Allow Enter key to set name
nameInput.addEventListener("keypress", (e) => {
  if (e.key === 'Enter') {
    setNameBtn.click();
  }
});

// Initialize on page load
initializeUser();

// Push new message to database
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  if (!currentUserName) {
    alert("Please set your name before sending a message!");
    nameInput.focus();
    return;
  }
  
  const messageText = messageInput.value.trim();
  if (messageText !== "") {
    push(ref(db, "messages"), {
      text: messageText,
      name: currentUserName,
      timestamp: Date.now()
    });
    messageInput.value = "";
  }
});

// Function to display a message
function displayMessage(message, messageId) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("message");
  messageEl.setAttribute("data-message-id", messageId);
  
  const time = new Date(message.timestamp).toLocaleTimeString();
  const userName = message.name || 'Anonymous';
  const isOwnMessage = userName === currentUserName;
  
  messageEl.innerHTML = `
    <div class="message-content ${isOwnMessage ? 'own-message' : ''}">
      <span class="message-text">
        <strong class="message-name">${userName}</strong> 
        <span class="message-time">[${time}]</span>: 
        ${message.text}
      </span>
      ${isOwnMessage ? `
      <div class="message-actions">
        <button class="edit-btn" onclick="editMessage('${messageId}', '${message.text.replace(/'/g, "\\'")}')">Edit</button>
        <button class="delete-btn" onclick="deleteMessage('${messageId}')">Delete</button>
      </div>
      ` : ''}
    </div>
  `;
  
  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Load existing messages when page loads
async function loadExistingMessages() {
  try {
    const messagesRef = ref(db, "messages");
    const snapshot = await get(messagesRef);
    if (snapshot.exists()) {
      const messages = snapshot.val();
      // Sort messages by timestamp and display them
      const sortedMessages = Object.entries(messages)
        .map(([id, data]) => ({id, ...data}))
        .sort((a, b) => a.timestamp - b.timestamp);
      sortedMessages.forEach(message => displayMessage(message, message.id));
    }
  } catch (error) {
    console.error("Error loading messages:", error);
  }
}

// Load existing messages on page load
loadExistingMessages();

// Listen for new messages (this will only trigger for messages added after the listener is set)
onChildAdded(ref(db, "messages"), (snapshot) => {
  const message = snapshot.val();
  const messageId = snapshot.key;
  
  // Only display if this message wasn't already loaded
  const existingMessage = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!existingMessage) {
    displayMessage(message, messageId);
  }
});

// Global function to edit a message
window.editMessage = function(messageId, currentText) {
  const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
  const messageTextEl = messageEl.querySelector('.message-text');
  const actionsEl = messageEl.querySelector('.message-actions');
  
  // Extract just the text part (remove timestamp)
  const textOnly = currentText;
  
  // Replace message content with edit form
  messageEl.innerHTML = `
    <div class="message-content editing">
      <input type="text" class="edit-input" value="${textOnly}" />
      <div class="edit-actions">
        <button class="save-btn" onclick="saveMessage('${messageId}')">Save</button>
        <button class="cancel-btn" onclick="cancelEdit('${messageId}', '${textOnly.replace(/'/g, "\\'")}')">Cancel</button>
      </div>
    </div>
  `;
  
  // Focus on the input
  messageEl.querySelector('.edit-input').focus();
};

// Global function to save an edited message
window.saveMessage = async function(messageId) {
  const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
  const newText = messageEl.querySelector('.edit-input').value.trim();
  
  if (newText === "") {
    alert("Message cannot be empty!");
    return;
  }
  
  try {
    // Update the message in Firebase
    await update(ref(db, `messages/${messageId}`), {
      text: newText,
      edited: true,
      editedAt: Date.now()
    });
    
    // Reload messages to show the update
    messagesDiv.innerHTML = '';
    loadExistingMessages();
  } catch (error) {
    console.error("Error updating message:", error);
    alert("Failed to update message. Please try again.");
  }
};

// Global function to cancel editing
window.cancelEdit = function(messageId, originalText) {
  // Reload messages to restore original display
  messagesDiv.innerHTML = '';
  loadExistingMessages();
};

// Global function to delete a message
window.deleteMessage = async function(messageId) {
  if (confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
    try {
      await remove(ref(db, `messages/${messageId}`));
      
      // Remove the message element from DOM
      const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
      if (messageEl) {
        messageEl.remove();
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message. Please try again.");
    }
  }
};
