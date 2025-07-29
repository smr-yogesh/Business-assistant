// 404 Page JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  // Go back button functionality
  const goBackBtn = document.getElementById("goBackBtn")

  if (goBackBtn) {
    goBackBtn.addEventListener("click", () => {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        window.history.back()
      } else {
        // If no history, redirect to home
        window.location.href = "/"
      }
    })
  }

  // Add smooth scroll behavior for any anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Track 404 errors (you can integrate with your analytics)
  function track404Error() {
    const currentUrl = window.location.href
    const referrer = document.referrer

    // You can send this data to your Flask backend for logging
    console.log("404 Error tracked:", {
      url: currentUrl,
      referrer: referrer,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    })

    // Example: Send to your Flask backend
    // fetch('/api/track-404', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         url: currentUrl,
    //         referrer: referrer,
    //         timestamp: new Date().toISOString()
    //     })
    // });
  }

  // Track the 404 error
  track404Error()

  // Add keyboard navigation
  document.addEventListener("keydown", (e) => {
    // Press 'H' to go home
    if (e.key.toLowerCase() === "h" && !e.ctrlKey && !e.metaKey) {
      window.location.href = "/"
    }

    // Press 'B' to go back
    if (e.key.toLowerCase() === "b" && !e.ctrlKey && !e.metaKey) {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        window.location.href = "/"
      }
    }
  })

  // Add loading states to buttons
  const buttons = document.querySelectorAll("a, button")
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      // Add loading state
      this.classList.add("btn-loading")

      // Remove loading state after navigation (for back button)
      setTimeout(() => {
        this.classList.remove("btn-loading")
      }, 1000)
    })
  })

  // Console message for developers
  console.log(`
    🤖 BizBot 404 Page Loaded
    ========================
    
    Keyboard shortcuts:
    - Press 'H' to go home
    - Press 'B' to go back
    
    This page matches your BizBot design system!
    `)
})

// Function to get URL parameters (useful for debugging)
function getUrlParams() {
  const params = new URLSearchParams(window.location.search)
  const urlParams = {}
  for (const [key, value] of params) {
    urlParams[key] = value
  }
  return urlParams
}

// Export functions for potential use in other scripts
window.BizBot404 = {
  goHome: () => (window.location.href = "/"),
  goBack: () => (window.history.length > 1 ? window.history.back() : (window.location.href = "/")),
  getUrlParams: getUrlParams,
}
