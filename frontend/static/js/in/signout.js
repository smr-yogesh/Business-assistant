const messageDiv = document.getElementById('message');

async function re_Verify() {
        const res = await fetch("/api/resend-verification", {
        method: "POST",
        credentials: "include"
    });
    dashboard.showNotification("Verification Email sent!", "success")
    const data = await res.json();
    messageDiv.textContent = data.message || 'Invalid email or password. Please try again.';
    messageDiv.classList.remove('hidden')
    }

async function signOut() {
        const res = await fetch("api/signout", {
            method: "POST",
            credentials: "include" // include cookies!
        });
        if (res.ok) {
            window.location.href = "/signin"; // or your homepage
        } else {
            alert("Failed to sign out. Try again.");
        }
    }

