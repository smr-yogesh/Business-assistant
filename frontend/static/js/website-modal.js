// Website Modal JavaScript functionality
class WebsiteModal {
  constructor(dashboard) {
    this.dashboard = dashboard
    this.init()
  }

  init() {
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Setup pricing calculator when modal opens
    document.addEventListener("modalOpened", (e) => {
      if (e.detail.modalId === "addWebsiteModal") {
        this.setupPricingCalculator()
      }
    })
  }

  setupPricingCalculator() {
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

  validateWebsiteForm() {
    const websiteUrl = document.getElementById("websiteUrl")
    const businessContent = document.getElementById("businessContent")
    let isValid = true

    // Clear previous error messages
    document.querySelectorAll(".error-message").forEach((msg) => {
      msg.classList.remove("show")
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
    let errorMsg = field.parentNode.querySelector(".error-message")
    if (!errorMsg) {
      errorMsg = document.createElement("div")
      errorMsg.className = "error-message"
      field.parentNode.appendChild(errorMsg)
    }
    errorMsg.textContent = message
    errorMsg.classList.add("show")
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

  addWebsite() {
    if (!this.validateWebsiteForm()) {
      this.dashboard.showNotification("Please fix the errors above", "error")
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

      this.dashboard.showNotification(`Website added successfully! ${planType} plan (${cost}) activated.`, "success")

      // Reset form and close modal
      this.closeAddWebsiteModal()

      // Remove loading state
      submitBtn.classList.remove("loading")
      submitBtn.disabled = false

      // You could redirect to a success page or update the dashboard here
      console.log("Website added:", {
        url: websiteUrl,
        content: businessContent,
        billing: billingType,
        timestamp: new Date().toISOString(),
      })
    }, 2000) // Simulate 2 second API call
  }

  openAddWebsiteModal() {
    this.dashboard.openModal("addWebsiteModal")
    // Dispatch custom event for setup
    document.dispatchEvent(
      new CustomEvent("modalOpened", {
        detail: { modalId: "addWebsiteModal" },
      }),
    )
  }

  closeAddWebsiteModal() {
    this.dashboard.closeModal("addWebsiteModal")
    this.resetWebsiteForm()
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
      msg.classList.remove("show")
    })

    // Reset field styles
    document.querySelectorAll(".form-group input, .form-group textarea").forEach((field) => {
      field.style.borderColor = ""
    })

    // Reset pricing display
    this.updatePricingDisplay()
  }
}

// Global functions for HTML onclick handlers
function openAddWebsiteModal() {
  if (window.websiteModal) {
    window.websiteModal.openAddWebsiteModal()
  }
}

function closeAddWebsiteModal() {
  if (window.websiteModal) {
    window.websiteModal.closeAddWebsiteModal()
  }
}

function addWebsite() {
  if (window.websiteModal) {
    window.websiteModal.addWebsite()
  }
}

// Make WebsiteModal available globally
window.WebsiteModal = WebsiteModal

// Initialize when dashboard is ready
document.addEventListener("DOMContentLoaded", () => {
  // WebsiteModal will be initialized by Dashboard class
})
