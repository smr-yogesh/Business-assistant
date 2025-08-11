// API helper functions for authentication

class AuthAPI {
  static async makeRequest(endpoint, data, timeout = 10000) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest", // CSRF protection
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const result = await response.json()

      if (!response.ok) {
        const error = new Error(result.message || "Request failed")
        error.status = response.status
        error.code = result.code || null
        throw error
      }

      return result
    } catch (err) {
      clearTimeout(timeoutId)

      if (err.name === "AbortError") {
        const timeoutError = new Error("Request timeout. Please check your connection.")
        timeoutError.status = 408
        throw timeoutError
      }

      if (!navigator.onLine) {
        const networkError = new Error("No internet connection. Please check your network.")
        networkError.status = 0
        throw networkError
      }

      throw err
    }
  }

  static async postForgot(email) {
    // Input validation
    if (!email || !email.includes("@")) {
      const error = new Error("Please enter a valid email address")
      error.status = 400
      throw error
    }

    return this.makeRequest("/api/forgot", { email })
  }

  static async postReset(token, password) {
    // Input validation
    if (!token) {
      const error = new Error("Invalid reset token")
      error.status = 400
      throw error
    }

    if (!password || password.length < 8) {
      const error = new Error("Password must be at least 8 characters long")
      error.status = 400
      throw error
    }

    return this.makeRequest("/api/reset", { token, password })
  }
}

// Export for use in other scripts
window.AuthAPI = AuthAPI
