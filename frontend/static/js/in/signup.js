// Checkbox functionality
        document.getElementById('terms').addEventListener('click', function() {
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
        document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const agreeTerms = document.getElementById('terms').getAttribute('aria-checked') === 'true';
    const errorDiv = document.getElementById('error-message');
    const submitBtn = document.getElementById('signup-btn');
    const welcomeUrl = document.getElementById('welcomeUrl').value;
    
    // Clear previous errors
    errorDiv.classList.add('hidden');
    
    // Validate terms agreement
    if (!agreeTerms) {
        errorDiv.textContent = 'You must agree to the terms and conditions';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
        const res = await fetch('http://localhost:5000/api/signup', {  // CHANGE if your Flask runs elsewhere
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            // Success - redirect or show success message
            window.location.href = welcomeUrl;;
        } else {
            errorDiv.textContent = data.error || 'There was a problem creating your account.';
            errorDiv.classList.remove('hidden');
        }
    } catch (err) {
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create account';
    }
});
