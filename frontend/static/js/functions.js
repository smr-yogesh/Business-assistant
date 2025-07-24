class BizBotWidget {
  constructor() {
    this.isOpen = false
    this.isTyping = false
    this.businessId = ""
    this.apiBaseUrl = "http://localhost:5000/api" // Update with your Flask API URL

    this.initializeWidget()
    this.bindEvents()
  }

  initializeWidget() {
    // Get DOM elements
    this.chatToggle = document.getElementById("chatToggleBtn")
    this.chatWidget = document.getElementById("chatWidget")
    this.chatbox = document.getElementById("chatbox")
    this.userInput = document.getElementById("userInput")
    this.sendBtn = document.getElementById("sendBtn")
    this.adminPanel = document.getElementById("adminPanel")
    this.adminToggle = document.getElementById("adminToggle")
    this.closeAdmin = document.getElementById("closeAdmin")
    this.submitDoc = document.getElementById("submitDoc")
    this.businessIdInput = document.getElementById("businessIdInput")
    this.documentInput = document.getElementById("documentInput")
    this.docResponse = document.getElementById("docResponse")
  }

  bindEvents() {
    // Chat toggle
    this.chatToggle.addEventListener("click", () => this.toggleChat())

    // Send message
    this.sendBtn.addEventListener("click", () => this.sendMessage())
    this.userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.sendMessage()
      }
    })

    // Admin panel
    this.adminToggle.addEventListener("click", () => this.showAdminPanel())
    this.closeAdmin.addEventListener("click", () => this.hideAdminPanel())
    this.submitDoc.addEventListener("click", () => this.addBusinessDocument())

    // Close admin panel when clicking outside
    this.adminPanel.addEventListener("click", (e) => {
      if (e.target === this.adminPanel) {
        this.hideAdminPanel()
      }
    })

    // Auto-resize input
    this.userInput.addEventListener("input", () => {
      this.sendBtn.disabled = !this.userInput.value.trim()
    })
  }

  toggleChat() {
    this.isOpen = !this.isOpen

    if (this.isOpen) {
      this.chatWidget.classList.remove("hidden")
      this.chatToggle.classList.add("active")
      setTimeout(() => {
        this.chatWidget.classList.add("visible")
        this.userInput.focus()
      }, 10)
    } else {
      this.chatWidget.classList.remove("visible")
      this.chatToggle.classList.remove("active")
      setTimeout(() => {
        this.chatWidget.classList.add("hidden")
      }, 300)
    }
  }

  async sendMessage() {
    const message = this.userInput.value.trim()
    if (!message || this.isTyping) return

    // Add user message to chat
    this.addMessage(message, "user")
    this.userInput.value = ""
    this.sendBtn.disabled = true

    // Show typing indicator
    this.showTypingIndicator()

    try {
      // Send message to API
      const response = await fetch(`${this.apiBaseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: message,
          business_id: this.businessId || "nimbus-noodles",
        }),
      })

      const data = await response.json()

      // Hide typing indicator
      this.hideTypingIndicator()

      if (response.ok) {
        // Add bot response
        this.addMessage(data.answer || "I apologize, but I encountered an issue processing your request.", "bot")
      } else {
        this.addMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.", "bot")
      }
    } catch (error) {
      console.error("Chat error:", error)
      this.hideTypingIndicator()
      this.addMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.", "bot")
    }
  }

  addMessage(text, sender) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `${sender}-message`

    if (sender === "bot") {
      messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-gradient">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-bubble bot">${this.escapeHtml(text)}</div>
                </div>
            `
    } else {
      messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble user">${this.escapeHtml(text)}</div>
                </div>
            `
    }

    this.chatbox.appendChild(messageDiv)
    this.scrollToBottom()
  }

  showTypingIndicator() {
    this.isTyping = true
    const typingDiv = document.createElement("div")
    typingDiv.className = "bot-message typing-message"
    typingDiv.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-gradient">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `
    this.chatbox.appendChild(typingDiv)
    this.scrollToBottom()
  }

  hideTypingIndicator() {
    this.isTyping = false
    const typingMessage = this.chatbox.querySelector(".typing-message")
    if (typingMessage) {
      typingMessage.remove()
    }
  }

  showAdminPanel() {
    this.adminPanel.classList.remove("hidden")
    this.businessIdInput.focus()
  }

  hideAdminPanel() {
    this.adminPanel.classList.add("hidden")
    this.clearAdminForm()
  }

  async addBusinessDocument() {
    const businessId = this.businessIdInput.value.trim()
    const document = this.documentInput.value.trim()

    if (!businessId || !document) {
      this.showResponse("Please fill in both Business ID and content.", "error")
      return
    }

    // Show loading state
    this.submitDoc.disabled = true
    this.submitDoc.querySelector(".btn-text").classList.add("hidden")
    this.submitDoc.querySelector(".btn-loading").classList.remove("hidden")

    try {
      const response = await fetch(`${this.apiBaseUrl}/add_document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_id: businessId,
          content: document,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        this.businessId = businessId
        this.showResponse("Business content added successfully!", "success")
        setTimeout(() => {
          this.hideAdminPanel()
        }, 2000)
      } else {
        this.showResponse(data.error || "Failed to add business content.", "error")
      }
    } catch (error) {
      console.error("Document upload error:", error)
      this.showResponse("Failed to connect to server. Please try again.", "error")
    } finally {
      // Reset loading state
      this.submitDoc.disabled = false
      this.submitDoc.querySelector(".btn-text").classList.remove("hidden")
      this.submitDoc.querySelector(".btn-loading").classList.add("hidden")
    }
  }

  showResponse(message, type) {
    this.docResponse.textContent = message
    this.docResponse.className = `response-message ${type}`
    this.docResponse.style.display = "block"
  }

  clearAdminForm() {
    this.businessIdInput.value = ""
    this.documentInput.value = ""
    this.docResponse.style.display = "none"
  }

  scrollToBottom() {
    this.chatbox.scrollTop = this.chatbox.scrollHeight
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

// Initialize the widget when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new BizBotWidget()
})

// Legacy function support (for backward compatibility)
function toggleChat() {
  const event = new CustomEvent("toggleChat")
  document.dispatchEvent(event)
}

function sendMessage() {
  const event = new CustomEvent("sendMessage")
  document.dispatchEvent(event)
}

function addBusinessDocument() {
  const event = new CustomEvent("addBusinessDocument")
  document.dispatchEvent(event)
}
