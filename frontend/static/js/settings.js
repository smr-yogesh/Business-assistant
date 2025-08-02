class SettingsManager {
  constructor() {
    this.profileFields = {
      name: document.getElementById("settingName"),
      email: document.getElementById("settingEmail"),
      website: document.getElementById("settingWebsite"),
    }
    this.passwordFields = {
      current: document.getElementById("currentPassword"),
      new: document.getElementById("newPassword"),
      confirm: document.getElementById("confirmPassword"),
    }

    this.editProfileBtn = document.getElementById("editProfileBtn")
    this.saveProfileBtn = document.getElementById("saveProfileBtn")
    this.cancelProfileBtn = document.getElementById("cancelProfileBtn")

    this.editPasswordBtn = document.getElementById("editPasswordBtn")
    this.savePasswordBtn = document.getElementById("savePasswordBtn")
    this.cancelPasswordBtn = document.getElementById("cancelPasswordBtn")

    this.originalProfileValues = {}
    this.originalPasswordValues = {}

    this.init()
  }

  init() {
    this.loadSettings() // Load initial values
    this.setupEventListeners()
  }

  loadSettings() {
    // Simulate loading data from an API or backend
    // In a real application, this would be an AJAX call
    const loadedProfile = {
      name: this.profileFields.name.value,
      email: this.profileFields.email.value,
      website: "https://www.bizbot.com",
    }

    // Store original values
    this.originalProfileValues = { ...loadedProfile }

    // Set initial field values and disable them
    this.profileFields.name.value = loadedProfile.name
    this.profileFields.email.value = loadedProfile.email
    this.profileFields.website.value = loadedProfile.website
    this.toggleProfileEditMode(false)

    // Password fields are always initially disabled and have placeholder values
    this.passwordFields.current.value = "********" // Placeholder
    this.passwordFields.new.value = ""
    this.passwordFields.confirm.value = ""
    this.togglePasswordEditMode(false)
  }

  setupEventListeners() {
    this.editProfileBtn.addEventListener("click", () => this.toggleProfileEditMode(true))
    this.saveProfileBtn.addEventListener("click", () => this.saveProfile())
    this.cancelProfileBtn.addEventListener("click", () => this.cancelProfileEdit())

    this.editPasswordBtn.addEventListener("click", () => this.togglePasswordEditMode(true))
    this.savePasswordBtn.addEventListener("click", () => this.savePassword())
    this.cancelPasswordBtn.addEventListener("click", () => this.cancelPasswordEdit())
  }

  toggleProfileEditMode(enable) {
    for (const key in this.profileFields) {
      this.profileFields[key].disabled = !enable
      this.profileFields[key].parentNode.classList.toggle("disabled", !enable)
    }
    this.editProfileBtn.classList.toggle("hidden", enable)
    this.saveProfileBtn.classList.toggle("hidden", !enable)
    this.cancelProfileBtn.classList.toggle("hidden", !enable)
  }

  togglePasswordEditMode(enable) {
    this.passwordFields.current.disabled = !enable
    this.passwordFields.new.disabled = !enable
    this.passwordFields.confirm.disabled = !enable

    this.passwordFields.current.parentNode.classList.toggle("disabled", !enable)
    this.passwordFields.new.parentNode.classList.toggle("disabled", !enable)
    this.passwordFields.confirm.parentNode.classList.toggle("disabled", !enable)

    this.editPasswordBtn.classList.toggle("hidden", enable)
    this.savePasswordBtn.classList.toggle("hidden", !enable)
    this.cancelPasswordBtn.classList.toggle("hidden", !enable)

    // Clear new password fields when entering edit mode
    if (enable) {
      this.passwordFields.new.value = ""
      this.passwordFields.confirm.value = ""
    }
  }

  async saveProfile() {
    const updatedProfile = {
      name: this.profileFields.name.value.trim(),
      email: this.profileFields.email.value.trim(),
      website: this.profileFields.website.value.trim(),
    }

    // Basic validation
    if (!updatedProfile.name || !updatedProfile.email || !updatedProfile.website) {
      window.dashboard.showNotification("All profile fields are required.", "error")
      return
    }
    if (!this.isValidEmail(updatedProfile.email)) {
      window.dashboard.showNotification("Please enter a valid email address.", "error")
      return
    }
    if (!window.dashboard.isValidUrl(updatedProfile.website)) {
      // Re-using dashboard's URL validator
      window.dashboard.showNotification("Please enter a valid website URL.", "error")
      return
    }

    // Simulate API call
    this.saveProfileBtn.disabled = true
    this.saveProfileBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10M18 8l-6 6-6-6"/></svg> Saving...`

    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

    // Update original values on successful save
    this.originalProfileValues = { ...updatedProfile }
    window.dashboard.showNotification("Profile updated successfully!", "success")
    this.toggleProfileEditMode(false)

    this.saveProfileBtn.disabled = false
    this.saveProfileBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg> Save Changes`
  }

  cancelProfileEdit() {
    // Revert to original values
    this.profileFields.name.value = this.originalProfileValues.name
    this.profileFields.email.value = this.originalProfileValues.email
    this.profileFields.website.value = this.originalProfileValues.website
    this.toggleProfileEditMode(false)
    window.dashboard.showNotification("Profile changes cancelled.", "info")
  }

  async savePassword() {
    const currentPassword = this.passwordFields.current.value
    const newPassword = this.passwordFields.new.value
    const confirmPassword = this.passwordFields.confirm.value

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      window.dashboard.showNotification("All password fields are required.", "error")
      return
    }
    if (newPassword.length < 6) {
      window.dashboard.showNotification("New password must be at least 6 characters long.", "error")
      return
    }
    if (newPassword !== confirmPassword) {
      window.dashboard.showNotification("New password and confirm password do not match.", "error")
      return
    }
    // Simulate checking current password (in a real app, this would be server-side)
    if (currentPassword !== "********") {
      // Assuming "********" is the placeholder for the correct current password
      window.dashboard.showNotification("Incorrect current password.", "error")
      return
    }

    // Simulate API call
    this.savePasswordBtn.disabled = true
    this.savePasswordBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10M18 8l-6 6-6-6"/></svg> Saving...`

    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

    window.dashboard.showNotification("Password updated successfully!", "success")
    this.togglePasswordEditMode(false)
    this.passwordFields.current.value = "********" // Reset to placeholder
    this.passwordFields.new.value = ""
    this.passwordFields.confirm.value = ""

    this.savePasswordBtn.disabled = false
    this.savePasswordBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg> Save Password`
  }

  cancelPasswordEdit() {
    // Revert password fields to initial state
    this.passwordFields.current.value = "********"
    this.passwordFields.new.value = ""
    this.passwordFields.confirm.value = ""
    this.togglePasswordEditMode(false)
    window.dashboard.showNotification("Password change cancelled.", "info")
  }

  isValidEmail(email) {
    // Basic email validation regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}

// Initialize settings manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.settingsManager = new SettingsManager() // Make it globally accessible if needed by other scripts
})
