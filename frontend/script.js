// ─── DOM Elements ────────────────────────────────────────────────────────────
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatMessages = document.getElementById("chatMessages");
const typingIndicator = document.getElementById("typingIndicator");
const errorBanner = document.getElementById("errorBanner");
const emptyState = document.getElementById("emptyState");

const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("openSidebarBtn");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
const newChatBtn = document.getElementById("newChatBtn");
const chatHistoryList = document.getElementById("chatHistoryList");

const settingsModal = document.getElementById("settingsModal");
const settingsAutoTrigger = document.getElementById("settingsAutoTrigger");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const themeToggle = document.getElementById("themeToggle");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const exportChatBtn = document.getElementById("exportChatBtn");

// ─── State Management ────────────────────────────────────────────────────────
let chats = JSON.parse(localStorage.getItem("nexus_chats")) || [];
let currentChatId = localStorage.getItem("nexus_current_chat") || null;

// Initialization
function init() {
  loadTheme();
  
  if (chats.length === 0) {
    createNewChat();
  } else {
    // If currentChatId is invalid, fallback to first chat
    if (!chats.find(c => c.id === currentChatId)) {
      currentChatId = chats[0].id;
    }
    loadChat(currentChatId);
    renderHistory();
  }
}

// ─── Theming ─────────────────────────────────────────────────────────────────
function loadTheme() {
  const theme = localStorage.getItem("nexus_theme") || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.checked = (theme === "dark");
}

themeToggle.addEventListener("change", (e) => {
  const theme = e.target.checked ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("nexus_theme", theme);
});


// ─── Sidebar & Modals ────────────────────────────────────────────────────────
openSidebarBtn.addEventListener("click", () => sidebar.classList.add("open"));
closeSidebarBtn.addEventListener("click", () => sidebar.classList.remove("open"));

settingsAutoTrigger.addEventListener("click", () => settingsModal.classList.remove("hidden"));
closeSettingsBtn.addEventListener("click", () => settingsModal.classList.add("hidden"));
settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add("hidden");
  }
});


// ─── Chat Data Logic ─────────────────────────────────────────────────────────
function saveChats() {
  localStorage.setItem("nexus_chats", JSON.stringify(chats));
  localStorage.setItem("nexus_current_chat", currentChatId);
}

function createNewChat() {
  const newChat = {
    id: Date.now().toString(),
    title: "New Conversation",
    messages: []
  };
  chats.unshift(newChat); // Add to beginning
  currentChatId = newChat.id;
  saveChats();
  renderHistory();
  loadChat(currentChatId);
  
  if(window.innerWidth <= 768) {
      sidebar.classList.remove("open");
  }
}

newChatBtn.addEventListener("click", createNewChat);

function loadChat(id) {
  currentChatId = id;
  const chat = chats.find(c => c.id === id);
  if(!chat) return;

  // Render UI
  chatMessages.innerHTML = '';
  if (chat.messages.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    chat.messages.forEach(msg => appendBubbleHTML(msg.role, msg.text, false));
  }
  
  // Highlight history
  document.querySelectorAll(".history-item").forEach(item => {
    item.classList.toggle("active", item.dataset.id === id);
  });
  
  saveChats();
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderHistory() {
  chatHistoryList.innerHTML = '';
  const searchTerm = document.getElementById("searchChats").value.toLowerCase();
  
  chats
    .filter(chat => chat.title.toLowerCase().includes(searchTerm))
    .forEach(chat => {
      const div = document.createElement("div");
      div.classList.add("history-item");
      if(chat.id === currentChatId) div.classList.add("active");
      div.dataset.id = chat.id;
      
      // determine title based on first user message if 'New Conversation'
      let titleToDisplay = chat.title;
      if(titleToDisplay === "New Conversation" && chat.messages.length > 0) {
          const firstUserMsg = chat.messages.find(m => m.role === 'user');
          if(firstUserMsg) {
              titleToDisplay = firstUserMsg.text.substring(0, 25) + (firstUserMsg.text.length > 25 ? "..." : "");
              chat.title = titleToDisplay; // actually save this new title
              saveChats();
          }
      }

      div.textContent = titleToDisplay;
      div.addEventListener("click", () => {
        loadChat(chat.id);
        if(window.innerWidth <= 768) {
          sidebar.classList.remove("open");
        }
      });
      chatHistoryList.appendChild(div);
  });
}

document.getElementById("searchChats").addEventListener("input", renderHistory);

function addMessageToCurrentChat(role, text) {
  const chat = chats.find(c => c.id === currentChatId);
  if(chat) {
    chat.messages.push({ role, text, timestamp: new Date().toISOString() });
    
    if(chat.title === "New Conversation" && role === 'user') {
       chat.title = text.substring(0, 25) + (text.length > 25 ? "..." : "");
       renderHistory();
    }
    saveChats();
  }
}

// ─── Settings Actions ────────────────────────────────────────────────────────
clearHistoryBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all history? This cannot be undone.")) {
    chats = [];
    localStorage.removeItem("nexus_chats");
    createNewChat();
    settingsModal.classList.add("hidden");
  }
});

exportChatBtn.addEventListener("click", () => {
  const chat = chats.find(c => c.id === currentChatId);
  if(!chat || chat.messages.length === 0) return alert("Nothing to export!");
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chat, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `nexus_chat_${chat.id}.json`);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
});

// ─── Input Logic ─────────────────────────────────────────────────────────────
userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 150) + "px";
});

userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    if(window.innerWidth > 768) {
        e.preventDefault();
        sendMessage();
    }
  }
});

sendBtn.addEventListener("click", sendMessage);

function fillInput(text) {
  userInput.value = text;
  userInput.style.height = "auto";
  userInput.style.height = userInput.scrollHeight + "px";
  userInput.focus();
}

// Expose to global so inline onclick in HTML works
window.fillInput = fillInput;

// ─── Chat Networking ─────────────────────────────────────────────────────────

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  hideError();
  emptyState.classList.add("hidden");

  appendBubbleHTML("user", message, true);
  addMessageToCurrentChat("user", message);

  userInput.value = "";
  userInput.style.height = "auto";
  
  setLoading(true);

  const activeChat = chats.find(c => c.id === currentChatId);
  const historyForApi = activeChat ? activeChat.messages.map(m => ({
    role: m.role === 'ai' ? 'assistant' : m.role,
    content: m.text
  })) : [];

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: historyForApi }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || "An unexpected error occurred.");
      return;
    }

    appendBubbleHTML("ai", data.reply, true);
    addMessageToCurrentChat("ai", data.reply);

  } catch (err) {
    showError("Could not reach the server. Is the backend running?");
  } finally {
    setLoading(false);
  }
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

function appendBubbleHTML(role, text, animate = false) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;
  if(!animate) wrapper.style.animation = "none";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  // Add icon for AI
  if (role === 'ai') {
      const iconWrapper = document.createElement("div");
      // Optional: Add AI mini avatar here 
      // wrapper.insertBefore(iconWrapper, bubble);
  }

  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);

  // Scroll to bottom
  requestAnimationFrame(() => {
     chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

function setLoading(isLoading) {
  sendBtn.disabled = isLoading;
  if (isLoading) {
    typingIndicator.classList.remove("hidden");
    chatMessages.appendChild(typingIndicator); // move to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } else {
    typingIndicator.classList.add("hidden");
  }
}

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.classList.remove("hidden");
  setTimeout(() => hideError(), 5000); // Auto hide after 5s
}

function hideError() {
  errorBanner.classList.add("hidden");
}

// Start
init();
