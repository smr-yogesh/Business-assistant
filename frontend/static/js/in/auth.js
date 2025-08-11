// Authentication page logic

class ForgotPasswordManager {
  constructor() {
    this.form = document.getElementById("forgot-form")
    this.emailInput = document.getElementById("email")
    this.submitBtn = document.getElementById("forgot-submit")
    this.messageArea = document.getElementById("forgot-msg")
    this.formContainer = document.getElementById("forgot-form-container")
    this.successContainer = document.getElementById("forgot-success")
    this.emailDisplay = document.getElementById("email-display")
    this.resendBtn = document.getElementById("resend-btn")
    this.resendTimer = document.getElementById("resend-timer")

    this.resendCountdown = 60
    this.resendInterval = null
    this.lastRequestTime = 0
    this.minRequestInterval = 5000 // 5 seconds between requests

    this.init()
  }

  init() {
    if (this.form) {
      this.form.addEventListener("submit", this.handleSubmit.bind(this))
      this.emailInput.addEventListener("input", this.validateEmail.bind(this))
    }

    if (this.resendBtn) {
      this.resendBtn.addEventListener("click", this.handleResend.bind(this))
    }
  }

  validateEmail() {
    const email = this.emailInput.value.trim()
    const isValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    this.submitBtn.disabled = !isValid

    if (email && !isValid) {
      this.emailInput.classList.add("input-error")
    } else {
      this.emailInput.classList.remove("input-error")
    }
  }

  async handleSubmit(e) {
    e.preventDefault()

    const email = this.emailInput.value.trim()
    if (!email) return

    const now = Date.now()
    if (now - this.lastRequestTime < this.minRequestInterval) {
      this.showError({ message: "Please wait a moment before trying again." })
      return
    }

    this.setLoading(true)
    this.clearMessage()

    try {
      await window.AuthAPI.postForgot(email)
      this.lastRequestTime = now
      this.showSuccess(email)
    } catch (error) {
      console.error("Forgot password error:", error)
      this.showError(error)
    } finally {
      this.setLoading(false)
    }
  }

  async handleResend() {
    const email = this.emailInput.value.trim()
    if (!email) return

    this.resendBtn.disabled = true
    this.startResendTimer()

    try {
      await window.AuthAPI.postForgot(email)
      this.showResendSuccess()
    } catch (error) {
      console.error("Resend failed:", error)
      this.showError({ message: "Failed to resend email. Please try again." })
    }
  }

  showResendSuccess() {
    const successMsg = document.createElement("div")
    successMsg.className = "message-success"
    successMsg.textContent = "Reset link sent again!"
    successMsg.style.marginTop = "10px"

    this.successContainer.appendChild(successMsg)

    setTimeout(() => {
      successMsg.remove()
    }, 3000)
  }

  showSuccess(email) {
    this.formContainer.classList.add("hidden")
    this.successContainer.classList.remove("hidden")
    this.successContainer.classList.add("fade-in")

    this.emailDisplay.textContent = email
    this.startResendTimer()

    // Focus management
    const successHeading = this.successContainer.querySelector("h3")
    if (successHeading) {
      successHeading.focus()
    }
  }

  startResendTimer() {
    this.resendCountdown = 60
    this.resendBtn.disabled = true

    this.resendInterval = setInterval(() => {
      this.resendCountdown--
      this.resendTimer.textContent = `Resend in ${this.resendCountdown}s`

      if (this.resendCountdown <= 0) {
        clearInterval(this.resendInterval)
        this.resendBtn.disabled = false
        this.resendTimer.textContent = "Resend link"
      }
    }, 1000)
  }

  showError(error) {
    let message = "Something went wrong. Please try again."

    if (error.status === 0) {
      message = "No internet connection. Please check your network."
    } else if (error.status === 408) {
      message = "Request timeout. Please check your connection and try again."
    } else if (error.status === 429) {
      message = "Too many requests. Please wait a minute before trying again."
    } else if (error.status === 500) {
      message = "Server error. Please try again later."
    } else if (error.message) {
      message = error.message
    }

    this.messageArea.className = "message-error"
    this.messageArea.textContent = message
    this.messageArea.classList.remove("hidden")

    // Focus management
    this.messageArea.focus()
  }

  clearMessage() {
    this.messageArea.classList.add("hidden")
    this.messageArea.textContent = ""
  }

  setLoading(loading) {
    this.submitBtn.disabled = loading
    if (loading) {
      this.submitBtn.classList.add("btn-loading")
      this.submitBtn.textContent = "Sending..."
    } else {
      this.submitBtn.classList.remove("btn-loading")
      this.submitBtn.textContent = "Send reset link"
    }
  }
}

class ResetPasswordManager {
  constructor() {
    this.form = document.getElementById("reset-form")
    this.passwordInput = document.getElementById("password")
    this.confirmInput = document.getElementById("confirm")
    this.submitBtn = document.getElementById("reset-submit")
    this.messageArea = document.getElementById("reset-msg")
    this.togglePassBtn = document.getElementById("toggle-pass")
    this.toggleConfirmBtn = document.getElementById("toggle-confirm")
    this.mismatchMsg = document.getElementById("password-mismatch")
    this.formContainer = document.getElementById("reset-form-container")
    this.invalidTokenContainer = document.getElementById("invalid-token")

    this.token = this.getTokenFromURL()
    this.passwordStrength = { score: 0, feedback: [] }

    this.init()
  }

   getTokenFromURL() {
        const urlParams = new URLSearchParams(window.location.search)
        return urlParams.get("token")  
    }

    showInvalidToken() {
        if (this.formContainer) this.formContainer.classList.add("hidden")
        if (this.invalidTokenContainer) {
        this.invalidTokenContainer.classList.remove("hidden")
        const heading = this.invalidTokenContainer.querySelector("h2")
        if (heading) heading.focus()
        }
  }

  init() {
    // Check if token exists
    if (!this.token) {
      this.showInvalidToken()
      return
    }

    if (this.form) {
      this.form.addEventListener("submit", this.handleSubmit.bind(this))
    }

    // Password visibility toggles
    if (this.togglePassBtn) {
      this.togglePassBtn.addEventListener("click", () => this.togglePassword("password"))
    }

    if (this.toggleConfirmBtn) {
      this.toggleConfirmBtn.addEventListener("click", () => this.togglePassword("confirm"))
    }

    // Live password validation
    if (this.confirmInput) {
      this.confirmInput.addEventListener("input", this.validatePasswordMatch.bind(this))
    }

    if (this.passwordInput) {
      this.passwordInput.addEventListener("input", () => {
        this.validatePasswordStrength()
        this.validatePasswordMatch()
      })
    }
  }

  validatePasswordStrength() {
    const password = this.passwordInput.value
    const feedback = []
    let score = 0

    if (password.length >= 8) score++
    else feedback.push("Use at least 8 characters")

    if (/[a-z]/.test(password)) score++
    else feedback.push("Include lowercase letters")

    if (/[A-Z]/.test(password)) score++
    else feedback.push("Include uppercase letters")

    if (/\d/.test(password)) score++
    else feedback.push("Include numbers")

    if (/[^a-zA-Z0-9]/.test(password)) score++
    else feedback.push("Include special characters")

    // Check against common passwords
    const commonPasswords = ["password", "123456", "qwerty", "admin", "letmein"]
    if (commonPasswords.some((common) => password.toLowerCase().includes(common))) {
      score = Math.max(0, score - 2)
      feedback.push("Avoid common passwords")
    }

    this.passwordStrength = { score, feedback }
    this.updatePasswordStrengthUI()
  }

  updatePasswordStrengthUI() {
    const strengthIndicator = document.getElementById("password-strength")
    if (!strengthIndicator) return

    const { score, feedback } = this.passwordStrength
    const strength = score <= 2 ? "weak" : score <= 3 ? "medium" : "strong"

    strengthIndicator.className = `password-strength ${strength}`
    strengthIndicator.textContent = feedback.length > 0 ? feedback[0] : "Strong password"
  }

  async handleSubmit(e) {
    e.preventDefault()

    const password = this.passwordInput.value
    const confirm = this.confirmInput.value

    if (password !== confirm) {
      this.showPasswordMismatch()
      return
    }

    if (this.passwordStrength.score < 3) {
      this.showError("Please create a stronger password following the guidelines above.")
      return
    }

    this.setLoading(true)
    this.clearMessage()

    try {
      await window.AuthAPI.postReset(this.token, password)
      window.location.href = "/reset_success"
    } catch (error) {
      console.error("Reset password error:", error)
      this.showError(error)
    } finally {
      this.setLoading(false)
    }
  }

  togglePassword(inputId) {
    const input = document.getElementById(inputId)
    const isPassword = input.type === "password"
    input.type = isPassword ? "text" : "password"
  }

  validatePasswordMatch() {
    const password = this.passwordInput.value
    const confirm = this.confirmInput.value

    if (confirm && password !== confirm) {
      this.showPasswordMismatch()
    } else {
      this.hidePasswordMismatch()
    }
  }

  showPasswordMismatch() {
    this.mismatchMsg.classList.remove("hidden")
    this.confirmInput.classList.add("input-error")
  }

  hidePasswordMismatch() {
    this.mismatchMsg.classList.add("hidden")
    this.confirmInput.classList.remove("input-error")
  }

  showError(error) {
    let message = "Something went wrong. Please try again."

    if (typeof error === "string") {
      message = error
    } else if (error.status === 0) {
      message = "No internet connection. Please check your network."
    } else if (error.status === 408) {
      message = "Request timeout. Please try again."
    } else if (error.status === 410) {
      message = "This reset link has expired. Please request a new one."
    } else if (error.status === 422) {
      message = "Password doesn't meet security requirements."
    } else if (error.status === 500) {
      message = "Server error. Please try again later."
    } else if (error.message) {
      message = error.message
    }

    this.messageArea.className = "message-error"
    this.messageArea.textContent = message
    this.messageArea.classList.remove("hidden")

    // Focus management
    this.messageArea.focus()
  }

  clearMessage() {
    this.messageArea.classList.add("hidden")
    this.messageArea.textContent = ""
  }

  setLoading(loading) {
    this.submitBtn.disabled = loading
    if (loading) {
      this.submitBtn.classList.add("btn-loading")
      this.submitBtn.textContent = "Setting password..."
    } else {
      this.submitBtn.classList.remove("btn-loading")
      this.submitBtn.textContent = "Set new password"
    }
  }
}

// Initialize appropriate manager based on current page
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("forgot-form")) {
    new ForgotPasswordManager()
  }

  if (document.getElementById("reset-form")) {
    new ResetPasswordManager()
  }
})
