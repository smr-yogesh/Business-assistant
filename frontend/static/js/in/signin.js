        // Checkbox functionality
        document.getElementById('remember').addEventListener('click', function() {
            const isChecked = this.getAttribute('aria-checked') === 'true';
            const newState = !isChecked;
            
            this.setAttribute('aria-checked', newState);
            this.setAttribute('data-state', newState ? 'checked' : 'unchecked');
            
            const svg = this.querySelector('svg');
            if (newState) {
                svg.classList.remove('hidden');
                this.classList.add('bg-primary', 'text-primary-foreground');
            } else {
                svg.classList.add('hidden');
                this.classList.remove('bg-primary', 'text-primary-foreground');
            }
        });

        // Form submission
        document.getElementById('signin-form').addEventListener('submit', async function(e) {e.preventDefault();
    
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember') && document.getElementById('remember').getAttribute('aria-checked') === 'true';
        const errorDiv = document.getElementById('error-message');
        const submitBtn = document.getElementById('signin-btn');
        const dashboardUrl = document.getElementById('dashboardUrl').value;
        
        // Clear previous errors
        errorDiv.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
        
        try {
            // Call your API!
            const res = await fetch('/api/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, remember }),
            });

            const data = await res.json();

            if (res.ok) {
                // Save JWT token (for now, use localStorage - see earlier messages about security!)
                localStorage.setItem('access_token', data.access_token);

                // Redirect to dashboard
                window.location.href = dashboardUrl;  // or Flask's injected url, see earlier answer
            } else {
                errorDiv.textContent = data.error || 'Invalid email or password. Please try again.';
                errorDiv.classList.remove('hidden');
            }
            } catch (err) {
                errorDiv.textContent = 'Server error. Please try again.';
                errorDiv.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign in';
            }
        });

        document.addEventListener("DOMContentLoaded", function() {
        const resendBtn = document.getElementById("resend-verification-btn");
        if (resendBtn) {
            resendBtn.addEventListener("click", async function() {
                const res = await fetch("/api/resend-verification", {
                method: "POST",
                credentials: "include"
            });
            const data = await res.json();
            alert(data.message);
        });
        }
    });
