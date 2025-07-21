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
        document.getElementById('signin-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').getAttribute('aria-checked') === 'true';
            const errorDiv = document.getElementById('error-message');
            const submitBtn = document.getElementById('signin-btn');
            
            // Clear previous errors
            errorDiv.classList.add('hidden');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';
            
            // Simulate API call
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Simulate success - redirect to dashboard
                window.location.href = 'dashboard.html';
            } catch (err) {
                // Show error
                errorDiv.textContent = 'Invalid email or password. Please try again.';
                errorDiv.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign in';
            }
        });