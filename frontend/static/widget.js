(function () {
  if (window.__bizbot_loaded) return;
  window.__bizbot_loaded = true;

  // Inject CSS
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "http://127.0.0.1:5000/static/style/widget.css"; // CHANGE THIS
  document.head.appendChild(link);

  // Inject Google Fonts
  var font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
  document.head.appendChild(font);

  // Inject Widget HTML (minified for clarity; expand if you wish)
  var widgetHTML = `
  <div id="adminPanel" class="admin-panel hidden">
    <div class="admin-content">
      <div class="admin-header">
        <h3>🤖 BizBot Setup</h3>
        <button id="closeAdmin" class="close-btn">&times;</button>
      </div>
      <div class="admin-body">
        <div class="input-group">
          <label for="businessIdInput">Business ID</label>
          <input id="businessIdInput" placeholder="e.g. nimbus-noodles" />
        </div>
        <div class="input-group">
          <label for="documentInput">Business Content</label>
          <textarea id="documentInput" placeholder="Paste your business content here (menus, FAQs, services, etc.)..."></textarea>
        </div>
        <button id="submitDoc" class="submit-btn">
          <span class="btn-text">Submit Content</span>
          <span class="btn-loading hidden">Submitting...</span>
        </button>
        <p id="docResponse" class="response-message"></p>
      </div>
    </div>
  </div>
  <div id="chatToggleBtn" class="chat-toggle" title="Chat with BizBot!">
    <div class="chat-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <div class="close-icon hidden">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
  </div>
  <div id="chatWidget" class="chat-widget hidden">
    <div class="chat-header">
      <div class="header-content">
        <div class="bot-avatar">
          <div class="avatar-gradient">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
        <div class="bot-info">
          <h4>BizBot</h4>
          <span class="status"><div class="status-dot"></div>Online</span>
        </div>
      </div>
      <button id="adminToggle" class="admin-toggle" title="Admin Settings">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/></svg>
      </button>
    </div>
    <div id="chatbox" class="chatbox">
      <div class="welcome-message">
        <div class="bot-message">
          <div class="message-avatar">
            <div class="avatar-gradient">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <div class="message-content">
            <div class="message-bubble bot">
              Hi! I'm BizBot, your AI assistant. I can help answer questions about our business. What would you like to know?
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="input-area">
      <div class="input-container">
        <input id="userInput" placeholder="Ask me anything..." autocomplete="off"/>
        <button id="sendBtn" class="send-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="powered-by">
        Powered by <strong>BizBot</strong>
      </div>
    </div>
  </div>
  `;

  var container = document.createElement("div");
  container.id = "bizbot-root";
  container.innerHTML = widgetHTML;
  document.body.appendChild(container);

  // BizBotWidget logic
  class BizBotWidget {
    constructor() {
      this.isOpen = false;
      this.isTyping = false;
      this.businessId = "";
      this.apiBaseUrl = "http://127.0.0.1:5000/api"; // CHANGE THIS
      this.initializeWidget();
      this.bindEvents();
    }

    initializeWidget() {
      this.chatToggle = document.getElementById("chatToggleBtn");
      this.chatWidget = document.getElementById("chatWidget");
      this.chatbox = document.getElementById("chatbox");
      this.userInput = document.getElementById("userInput");
      this.sendBtn = document.getElementById("sendBtn");
      this.adminPanel = document.getElementById("adminPanel");
      this.adminToggle = document.getElementById("adminToggle");
      this.closeAdmin = document.getElementById("closeAdmin");
      this.submitDoc = document.getElementById("submitDoc");
      this.businessIdInput = document.getElementById("businessIdInput");
      this.documentInput = document.getElementById("documentInput");
      this.docResponse = document.getElementById("docResponse");
    }

    bindEvents() {
      this.chatToggle.addEventListener("click", () => this.toggleChat());
      this.sendBtn.addEventListener("click", () => this.sendMessage());
      this.userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.sendMessage();
        }
      });
      this.adminToggle.addEventListener("click", () => this.showAdminPanel());
      this.closeAdmin.addEventListener("click", () => this.hideAdminPanel());
      this.submitDoc.addEventListener("click", () => this.addBusinessDocument());
      this.adminPanel.addEventListener("click", (e) => {
        if (e.target === this.adminPanel) {
          this.hideAdminPanel();
        }
      });
      this.userInput.addEventListener("input", () => {
        this.sendBtn.disabled = !this.userInput.value.trim();
      });
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.chatWidget.classList.remove("hidden");
        this.chatToggle.classList.add("active");
        setTimeout(() => {
          this.chatWidget.classList.add("visible");
          this.userInput.focus();
        }, 10);
      } else {
        this.chatWidget.classList.remove("visible");
        this.chatToggle.classList.remove("active");
        setTimeout(() => {
          this.chatWidget.classList.add("hidden");
        }, 300);
      }
    }

    async sendMessage() {
      const message = this.userInput.value.trim();
      if (!message || this.isTyping) return;
      this.addMessage(message, "user");
      this.userInput.value = "";
      this.sendBtn.disabled = true;
      this.showTypingIndicator();
      try {
        const response = await fetch(`${this.apiBaseUrl}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: message,
            business_id: this.businessId || "nimbus-noodles",
          }),
        });
        const data = await response.json();
        this.hideTypingIndicator();
        if (response.ok) {
          this.addMessage(data.answer || "I apologize, but I encountered an issue processing your request.", "bot");
        } else {
          this.addMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.", "bot");
        }
      } catch (error) {
        this.hideTypingIndicator();
        this.addMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.", "bot");
      }
    }

    addMessage(text, sender) {
      const messageDiv = document.createElement("div");
      messageDiv.className = `${sender}-message`;
      if (sender === "bot") {
        messageDiv.innerHTML = `
          <div class="message-avatar">
            <div class="avatar-gradient">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <div class="message-content">
            <div class="message-bubble bot">${this.escapeHtml(text)}</div>
          </div>
        `;
      } else {
        messageDiv.innerHTML = `
          <div class="message-content">
            <div class="message-bubble user">${this.escapeHtml(text)}</div>
          </div>
        `;
      }
      this.chatbox.appendChild(messageDiv);
      this.scrollToBottom();
    }

    showTypingIndicator() {
      this.isTyping = true;
      const typingDiv = document.createElement("div");
      typingDiv.className = "bot-message typing-message";
      typingDiv.innerHTML = `
        <div class="message-avatar">
          <div class="avatar-gradient">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
      this.chatbox.appendChild(typingDiv);
      this.scrollToBottom();
    }

    hideTypingIndicator() {
      this.isTyping = false;
      const typingMessage = this.chatbox.querySelector(".typing-message");
      if (typingMessage) {
        typingMessage.remove();
      }
    }

    showAdminPanel() {
      this.adminPanel.classList.remove("hidden");
      this.businessIdInput.focus();
    }

    hideAdminPanel() {
      this.adminPanel.classList.add("hidden");
      this.clearAdminForm();
    }

    async addBusinessDocument() {
      const businessId = this.businessIdInput.value.trim();
      const document = this.documentInput.value.trim();
      if (!businessId || !document) {
        this.showResponse("Please fill in both Business ID and content.", "error");
        return;
      }
      this.submitDoc.disabled = true;
      this.submitDoc.querySelector(".btn-text").classList.add("hidden");
      this.submitDoc.querySelector(".btn-loading").classList.remove("hidden");
      try {
        const response = await fetch(`${this.apiBaseUrl}/add-document`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            business_id: businessId,
            content: document,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          this.businessId = businessId;
          this.showResponse("Business content added successfully!", "success");
          setTimeout(() => {
            this.hideAdminPanel();
          }, 2000);
        } else {
          this.showResponse(data.error || "Failed to add business content.", "error");
        }
      } catch (error) {
        this.showResponse("Failed to connect to server. Please try again.", "error");
      } finally {
        this.submitDoc.disabled = false;
        this.submitDoc.querySelector(".btn-text").classList.remove("hidden");
        this.submitDoc.querySelector(".btn-loading").classList.add("hidden");
      }
    }

    showResponse(message, type) {
      this.docResponse.textContent = message;
      this.docResponse.className = `response-message ${type}`;
      this.docResponse.style.display = "block";
    }

    clearAdminForm() {
      this.businessIdInput.value = "";
      this.documentInput.value = "";
      this.docResponse.style.display = "none";
    }

    scrollToBottom() {
      this.chatbox.scrollTop = this.chatbox.scrollHeight;
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize when DOM is ready (or immediately if already loaded)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new BizBotWidget());
  } else {
    new BizBotWidget();
  }

})();
