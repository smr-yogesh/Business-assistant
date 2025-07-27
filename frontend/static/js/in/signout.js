

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