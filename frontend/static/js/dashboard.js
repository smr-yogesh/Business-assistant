// Dashboard JavaScript functionality
class Dashboard {
  constructor() {
    this.currentView = "dashboard"
    this.sidebarCollapsed = false
    this.websiteModal = null // Add this line
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.setupDropdowns()
    this.setupTabs()
    this.showView("dashboard")
    this.setupWebsiteModal()
  }

  setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll(".nav-link[data-view]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const view = e.currentTarget.getAttribute("data-view")
        this.showView(view)
        this.setActiveNavLink(e.currentTarget)
      })
    })

    document.querySelectorAll(".dropdown-item[data-view]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const view = e.currentTarget.getAttribute("data-view")
        this.showView(view)
        this.setActiveNavLink(e.currentTarget)
      })
    })


    // Sidebar toggle
    const sidebarToggle = document.getElementById("sidebarToggle")
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        this.toggleSidebar()
      })
    }

    // Search functionality
    const contentSearch = document.getElementById("contentSearch")
    if (contentSearch) {
      contentSearch.addEventListener("input", (e) => {
        this.filterContent(e.target.value)
      })
    }

    const conversationSearch = document.getElementById("conversationSearch")
    if (conversationSearch) {
      conversationSearch.addEventListener("input", (e) => {
        this.filterConversations(e.target.value)
      })
    }

    // Close modals when clicking outside
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.closeModal(e.target.id)
      }
    })

    // Escape key to close modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals()
      }
    })
  }

  setupDropdowns() {
    // Notification dropdown
    const notificationBtn = document.getElementById("notificationBtn")
    const notificationDropdown = document.getElementById("notificationDropdown")

    if (notificationBtn && notificationDropdown) {
      notificationBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.toggleDropdown(notificationDropdown)
      })
    }

    // User dropdown
    const userBtn = document.getElementById("userBtn")
    const userDropdown = document.getElementById("userDropdown")

    if (userBtn && userDropdown) {
      userBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.toggleDropdown(userDropdown)
      })
    }

    // Close dropdowns when clicking outside
    document.addEventListener("click", () => {
      this.closeAllDropdowns()
    })
  }

  setupTabs() {
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const tabName = e.currentTarget.getAttribute("data-tab")
        this.showTab(tabName)
        this.setActiveTab(e.currentTarget)
      })
    })
  }

  setupWebsiteModal() {
    // Setup pricing calculator
    const monthlyRadio = document.getElementById("monthly")
    const yearlyRadio = document.getElementById("yearly")

    if (monthlyRadio && yearlyRadio) {
      monthlyRadio.addEventListener("change", () => this.updatePricingDisplay())
      yearlyRadio.addEventListener("change", () => this.updatePricingDisplay())
    }

    // Initialize display
    this.updatePricingDisplay()
  }

  updatePricingDisplay() {
    const monthlyRadio = document.getElementById("monthly")
    const yearlyRadio = document.getElementById("yearly")
    const selectedPlan = document.getElementById("selectedPlan")
    const billingFrequency = document.getElementById("billingFrequency")
    const totalCost = document.getElementById("totalCost")
    const costSavings = document.getElementById("costSavings")
    const submitBtn = document.getElementById("submitWebsiteBtn")

    if (monthlyRadio && monthlyRadio.checked) {
      selectedPlan.textContent = "Monthly Plan"
      billingFrequency.textContent = "Monthly"
      totalCost.textContent = "$29.00/month"
      costSavings.style.display = "none"
      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Start Monthly Plan - $29/month
      `
    } else if (yearlyRadio && yearlyRadio.checked) {
      selectedPlan.textContent = "Yearly Plan"
      billingFrequency.textContent = "Annually"
      totalCost.textContent = "$240.00/year"
      costSavings.style.display = "block"
      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Start Yearly Plan - $240/year
      `
    }
  }

  showView(viewName) {
    // Hide all views
    document.querySelectorAll(".view-content").forEach((view) => {
      view.classList.remove("active")
    })

    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`)
    if (targetView) {
      targetView.classList.add("active")
      this.currentView = viewName
    }

    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 1024) {
      this.closeSidebar()
    }
  }

  setActiveNavLink(activeLink) {
    // Remove active class from all nav links
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active")
    })

    // Add active class to clicked link
    activeLink.classList.add("active")
  }

  showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active")
    })

    // Show selected tab content
    const targetTab = document.getElementById(`${tabName}-tab`)
    if (targetTab) {
      targetTab.classList.add("active")
    }
  }

  setActiveTab(activeTab) {
    // Remove active class from all tab buttons
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.classList.remove("active")
    })

    // Add active class to clicked tab
    activeTab.classList.add("active")
  }

  toggleSidebar() {
    const sidebar = document.getElementById("sidebar")
    const mainContent = document.querySelector(".main-content")

    if (sidebar.classList.contains("show")) {
      this.closeSidebar()
    } else {
      this.openSidebar()
    }
  }

  openSidebar() {
    const sidebar = document.getElementById("sidebar")
    sidebar.classList.add("show")
    this.sidebarCollapsed = false
  }

  closeSidebar() {
    const sidebar = document.getElementById("sidebar")
    sidebar.classList.remove("show")
    this.sidebarCollapsed = true
  }

  toggleDropdown(dropdown) {
    const isOpen = dropdown.classList.contains("show")

    // Close all dropdowns first
    this.closeAllDropdowns()

    // Toggle the clicked dropdown
    if (!isOpen) {
      dropdown.classList.add("show")
    }
  }

  closeAllDropdowns() {
    document.querySelectorAll(".dropdown-content").forEach((dropdown) => {
      dropdown.classList.remove("show")
    })
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.add("show")
      document.body.style.overflow = "hidden"

      // Dispatch custom event for modal opened
      document.dispatchEvent(
        new CustomEvent("modalOpened", {
          detail: { modalId: modalId },
        }),
      )
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = ""
    }
  }

  closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("show")
    })
    document.body.style.overflow = ""
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`

    // Add icon based on type
    let icon = ""
    switch (type) {
      case "success":
        icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; flex-shrink: 0;">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>`
        break
      case "error":
        icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; flex-shrink: 0;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`
        break
      case "warning":
        icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; flex-shrink: 0;">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>`
        break
      default:
        icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; flex-shrink: 0;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>`
    }

    notification.innerHTML = `
      <div style="display: flex; align-items: center;">
        ${icon}
        <span>${message}</span>
      </div>
    `

    // Add to page
    document.body.appendChild(notification)

    // Remove after 4 seconds with animation
    setTimeout(() => {
      notification.classList.add("removing")
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove()
        }
      }, 300)
    }, 4000)
  }

  validateWebsiteForm() {
    const websiteUrl = document.getElementById("websiteUrl")
    const businessContent = document.getElementById("businessContent")
    let isValid = true

    // Clear previous error messages
    document.querySelectorAll(".error-message").forEach((msg) => {
      msg.remove()
    })

    // Reset field styles
    document.querySelectorAll(".form-group input, .form-group textarea").forEach((field) => {
      field.style.borderColor = ""
    })

    // Validate URL
    if (!websiteUrl.value.trim()) {
      this.showFieldError(websiteUrl, "Website URL is required")
      isValid = false
    } else if (!this.isValidUrl(websiteUrl.value.trim())) {
      this.showFieldError(websiteUrl, "Please enter a valid URL (e.g., https://yourwebsite.com)")
      isValid = false
    }

    // Validate business content
    if (!businessContent.value.trim()) {
      this.showFieldError(businessContent, "Business content is required")
      isValid = false
    } else if (businessContent.value.trim().length < 50) {
      this.showFieldError(businessContent, "Please provide at least 50 characters of business content")
      isValid = false
    }

    return isValid
  }

  showFieldError(field, message) {
    const errorMsg = document.createElement("div")
    errorMsg.className = "error-message show"
    errorMsg.textContent = message
    field.parentNode.appendChild(errorMsg)
    field.style.borderColor = "#ef4444"
  }

  isValidUrl(string) {
    try {
      const url = new URL(string)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch (_) {
      return false
    }
  }

  resetWebsiteForm() {
    const websiteUrl = document.getElementById("websiteUrl")
    const businessContent = document.getElementById("businessContent")
    const monthlyRadio = document.getElementById("monthly")
    const yearlyRadio = document.getElementById("yearly")

    if (websiteUrl) websiteUrl.value = ""
    if (businessContent) businessContent.value = ""
    if (monthlyRadio) monthlyRadio.checked = true
    if (yearlyRadio) yearlyRadio.checked = false

    // Clear error messages
    document.querySelectorAll(".error-message").forEach((msg) => {
      msg.remove()
    })

    // Reset field styles
    document.querySelectorAll(".form-group input, .form-group textarea").forEach((field) => {
      field.style.borderColor = ""
    })

    // Reset pricing display
    this.updatePricingDisplay()
  }

  filterContent(searchTerm) {
    const rows = document.querySelectorAll(".data-table tbody tr")

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase()
      const matches = text.includes(searchTerm.toLowerCase())
      row.style.display = matches ? "" : "none"
    })
  }

  filterConversations(searchTerm) {
    const rows = document.querySelectorAll("#conversations-view .data-table tbody tr")

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase()
      const matches = text.includes(searchTerm.toLowerCase())
      row.style.display = matches ? "" : "none"
    })
  }

  // API simulation methods
  async loadDashboardData() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          stats: {
            conversations: 47,
            users: 1234,
            responseTime: "1.2s",
            satisfaction: 4.8,
          },
        })
      }, 1000)
    })
  }

  async loadConversations() {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "conv_001",
            customer: "john@example.com",
            topic: "Business Hours",
            startTime: "2024-01-15 14:30:22",
            duration: "3m 45s",
            messages: 8,
            status: "resolved",
            satisfaction: 5,
          },
        ])
      }, 1000)
    })
  }
}

// Global functions for HTML onclick handlers
function openAddContentModal() {
  dashboard.openModal("addContentModal")
}

function closeAddContentModal() {
  dashboard.closeModal("addContentModal")
}

function addContent() {
  const type = document.getElementById("contentType").value
  const title = document.getElementById("contentTitle").value
  const body = document.getElementById("contentBody").value

  if (!type || !title || !body) {
    dashboard.showNotification("Please fill in all fields", "error")
    return
  }

  // Simulate API call
  dashboard.showNotification("Content added successfully!", "success")
  closeAddContentModal()

  // Clear form
  document.getElementById("contentType").value = ""
  document.getElementById("contentTitle").value = ""
  document.getElementById("contentBody").value = ""
}

function viewConversation(conversationId) {
  // Populate conversation details
  const details = document.getElementById("conversationDetails")
  details.innerHTML = `
        <div class="conversation-meta">
            <div class="meta-item">
                <div class="meta-label">Customer</div>
                <div class="meta-value">john@example.com</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Topic</div>
                <div class="meta-value">Business Hours</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Duration</div>
                <div class="meta-value">3m 45s</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Messages</div>
                <div class="meta-value">8</div>
            </div>
        </div>
        
        <div class="conversation-transcript">
            <div class="message">
                <div class="message-avatar user">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <div class="message-content">
                    <div class="message-sender">Customer</div>
                    <div class="message-text">Hello, what are your business hours?</div>
                    <div class="message-time">14:30:22</div>
                </div>
            </div>
            
            <div class="message">
                <div class="message-avatar bot">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
                    </svg>
                </div>
                <div class="message-content">
                    <div class="message-sender">BizBot</div>
                    <div class="message-text">We're open Monday-Friday 9AM-6PM, Saturday 10AM-4PM, and closed on Sundays. Is there anything specific you'd like to know about our hours?</div>
                    <div class="message-time">14:30:25</div>
                </div>
            </div>
            
            <div class="message">
                <div class="message-avatar user">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <div class="message-content">
                    <div class="message-sender">Customer</div>
                    <div class="message-text">Thank you for the information!</div>
                    <div class="message-time">14:34:07</div>
                </div>
            </div>
        </div>
    `

  dashboard.openModal("conversationModal")
}

function closeConversationModal() {
  dashboard.closeModal("conversationModal")
}

function openAddWebsiteModal() {
  dashboard.openModal("addWebsiteModal")
}

function closeAddWebsiteModal() {
  dashboard.closeModal("addWebsiteModal")
  dashboard.resetWebsiteForm()
}

function submitWebsite() {
  if (!dashboard.validateWebsiteForm()) {
    dashboard.showNotification("Please fix the errors above", "error")
    return
  }

  const websiteUrl = document.getElementById("websiteUrl").value.trim()
  const businessContent = document.getElementById("businessContent").value.trim()
  const billingType = document.querySelector('input[name="billing"]:checked').value
  const submitBtn = document.getElementById("submitWebsiteBtn")

  // Show loading state
  submitBtn.classList.add("loading")
  submitBtn.disabled = true

  // Simulate API call
  setTimeout(() => {
    // Success simulation
    const planType = billingType === "monthly" ? "Monthly" : "Yearly"
    const cost = billingType === "monthly" ? "$29/month" : "$240/year"

    dashboard.showNotification(`Website added successfully! ${planType} plan (${cost}) activated.`, "success")

    // Reset form and close modal
    closeAddWebsiteModal()

    // Remove loading state
    submitBtn.classList.remove("loading")
    submitBtn.disabled = false

    // Log the data (in real app, this would be sent to server)
    console.log("Website added:", {
      url: websiteUrl,
      content: businessContent,
      billing: billingType,
      timestamp: new Date().toISOString(),
    })
  }, 2000) // Simulate 2 second API call
}

function copyCode() {
  const codeBlock = document.querySelector(".code-block code")
  if (!codeBlock) {
    dashboard.showNotification("Code block not found", "error")
    return
  }

  const text = codeBlock.textContent

  // Try modern clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        dashboard.showNotification("Installation code copied to clipboard!", "success")

        // Update button text temporarily
        const copyBtn = document.querySelector(".copy-btn")
        const originalText = copyBtn.innerHTML
        copyBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          Copied!
        `
        copyBtn.style.color = "#059669"

        setTimeout(() => {
          copyBtn.innerHTML = originalText
          copyBtn.style.color = ""
        }, 2000)
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
        fallbackCopyTextToClipboard(text)
      })
  } else {
    // Fallback for older browsers
    fallbackCopyTextToClipboard(text)
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea")
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.top = "0"
  textArea.style.left = "0"
  textArea.style.position = "fixed"
  textArea.style.opacity = "0"

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand("copy")
    if (successful) {
      dashboard.showNotification("Installation code copied to clipboard!", "success")

      // Update button text temporarily
      const copyBtn = document.querySelector(".copy-btn")
      const originalText = copyBtn.innerHTML
      copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        Copied!
      `
      copyBtn.style.color = "#059669"

      setTimeout(() => {
        copyBtn.innerHTML = originalText
        copyBtn.style.color = ""
      }, 2000)
    } else {
      dashboard.showNotification("Failed to copy code. Please copy manually.", "error")
    }
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err)
    dashboard.showNotification("Copy not supported. Please copy manually.", "warning")
  }

  document.body.removeChild(textArea)
}

// Initialize dashboard when DOM is loaded
let dashboard
document.addEventListener("DOMContentLoaded", () => {
  dashboard = new Dashboard()
  // Make dashboard globally available
  window.dashboard = dashboard
})

// Handle window resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 1024) {
    dashboard.closeSidebar()
  }
})

// Only show banner if user is not verified (backend will control this)
document.addEventListener("DOMContentLoaded", function() {
  const banner = document.getElementById("verificationBanner");
  const closeBtn = document.getElementById("dismissBanner");

  if (banner) {
    document.body.classList.add("with-banner");
    closeBtn.addEventListener("click", function() {
      banner.classList.add("hidden");
      document.body.classList.remove("with-banner");
    });
  }
});
