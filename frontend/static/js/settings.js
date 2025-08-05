class SettingsManager {
  constructor() {
    this.profileFields = {
      name: document.getElementById("settingName"),
      email: document.getElementById("settingEmail"),
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

    // Added for delete account
    this.deleteAccountBtn = document.getElementById("deleteAccountBtn") // Line 20

    this.originalProfileValues = {}
    this.originalPasswordValues = {}

    this.init()
  }

  init() {
    this.loadSettings() // Load initial values
    this.setupEventListeners()
  }

  setupEventListeners() {
    this.editProfileBtn.addEventListener("click", () => this.toggleProfileEditMode(true))
    this.saveProfileBtn.addEventListener("click", () => this.saveProfile())
    this.cancelProfileBtn.addEventListener("click", () => this.cancelProfileEdit())

    this.editPasswordBtn.addEventListener("click", () => this.togglePasswordEditMode(true))
    this.savePasswordBtn.addEventListener("click", () => this.savePassword())
    this.cancelPasswordBtn.addEventListener("click", () => this.cancelPasswordEdit())

    // Added event listener for delete account button
    this.deleteAccountBtn.addEventListener("click", () => this.deleteAccount()) // Line 40
  }

  loadSettings() {
    // Simulate loading data from an API or backend
    // In a real application, this would be an AJAX call
    const loadedProfile = {
      name: this.profileFields.name.value,
      email: this.profileFields.email.value,
    }

    // Store original values
    this.originalProfileValues = { ...loadedProfile }

    // Set initial field values and disable them
    this.profileFields.name.value = loadedProfile.name
    this.profileFields.email.value = loadedProfile.email
    this.toggleProfileEditMode(false)

    // Password fields are always initially disabled and have placeholder values
    this.passwordFields.current.value = "********" // Placeholder
    this.passwordFields.new.value = ""
    this.passwordFields.confirm.value = ""
    this.togglePasswordEditMode(false)
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
    }

    // Basic validation
    if (!updatedProfile.name || !updatedProfile.email) {
      window.dashboard.showNotification("All profile fields are required.", "error")
      return
    }
    if (!this.isValidEmail(updatedProfile.email)) {
      window.dashboard.showNotification("Please enter a valid email address.", "error")
      return
    }

    // Simulate API call
    this.saveProfileBtn.disabled = true
    this.saveProfileBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10M18 8l-6 6-6-6"/></svg> Saving...`

    try {
      const response = await fetch("/api/update_profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      })
      const data = await response.json()

      if (response.ok) {
        this.originalProfileValues = { ...updatedProfile }
        window.dashboard.showNotification(data.message, "success")
        this.toggleProfileEditMode(false)
      } else {
        window.dashboard.showNotification(data.message || data.error || "Unknown error", "error")

      }
    } catch (error) {
      console.error("Error updating profile:", error)
      window.dashboard.showNotification("An error occurred while updating profile.", "error")
    } finally {
      this.saveProfileBtn.disabled = false
      this.saveProfileBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg> Save Changes`
    }
  }

  cancelProfileEdit() {
    // Revert to original values
    this.profileFields.name.value = this.originalProfileValues.name
    this.profileFields.email.value = this.originalProfileValues.email
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
    if (newPassword.length < 8) {
      window.dashboard.showNotification("New password must be at least 8 characters long.", "error")
      return
    }
    if (newPassword !== confirmPassword) {
      window.dashboard.showNotification("New password and confirm password do not match.", "error")
      return
    }

    // Simulate API call
    this.savePasswordBtn.disabled = true
    this.savePasswordBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10M18 8l-6 6-6-6"/></svg> Saving...`

    try {
      const response = await fetch("/api/change_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await response.json()

      if (response.ok) {
        window.dashboard.showNotification(data.message, "success")
        this.togglePasswordEditMode(false)
        this.passwordFields.current.value = "********" // Reset to placeholder
        this.passwordFields.new.value = ""
        this.passwordFields.confirm.value = ""
      } else {
        window.dashboard.showNotification(data.message || data.error || "Unknown error", "error")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      window.dashboard.showNotification("An error occurred while updating password.", "error")
    } finally {
      this.savePasswordBtn.disabled = false
      this.savePasswordBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg> Save Password`
    }
  }

  cancelPasswordEdit() {
    // Revert password fields to initial state
    this.passwordFields.current.value = "********"
    this.passwordFields.new.value = ""
    this.passwordFields.confirm.value = ""
    this.togglePasswordEditMode(false)
    window.dashboard.showNotification("Password change cancelled.", "info")
  }

  // Added deleteAccount method
  async deleteAccount() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      this.deleteAccountBtn.disabled = true
      this.deleteAccountBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10M18 8l-6 6-6-6"/></svg> Deleting...` // Line 190

      try {
        const response = await fetch("/api/delete_account", {
            method: "POST",
            credentials: "include" 
        })
        const data = await response.json()

        if (response.ok) {
          window.dashboard.showNotification(data.message, "success")
          // Redirect to homepage or logout page after successful deletion
          setTimeout(() => {
            window.location.href = "/" // Line 203
          }, 1500)
        } else {
          window.dashboard.showNotification(data.message || "Failed to delete account.", "error")
        }
      } catch (error) {
        console.error("Error deleting account:", error)
        window.dashboard.showNotification("An error occurred while deleting account.", "error")
      } finally {
        this.deleteAccountBtn.disabled = false
        this.deleteAccountBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg> Delete Account` // Line 213
      }
    }
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
