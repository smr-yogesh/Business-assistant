// Website Modal functionality
(function() {
  'use strict';

  let websiteModal = null;
  let isInitialized = false;

  class WebsiteModalHandler {
    constructor() {
      this.modal = null;
      this.isSubmitting = false;
      this.init();
    }

    init() {
      this.modal = document.getElementById('addWebsiteModal');
      if (!this.modal) {
        console.warn('Website modal not found');
        return;
      }
      
      this.setupEventListeners();
      this.updatePricingDisplay();
    }

    setupEventListeners() {
      // Pricing radio buttons
      const monthlyRadio = document.getElementById('monthly');
      const yearlyRadio = document.getElementById('yearly');
      
      if (monthlyRadio) {
        monthlyRadio.addEventListener('change', () => this.updatePricingDisplay());
      }
      if (yearlyRadio) {
        yearlyRadio.addEventListener('change', () => this.updatePricingDisplay());
      }

      // Modal backdrop click
      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) {
            this.closeModal();
          }
        });
      }

      // Modal close button
      const closeBtn = this.modal?.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeModal());
      }

      // Escape key to close modal
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isModalOpen()) {
          this.closeModal();
        }
      });
    }

    updatePricingDisplay() {
      const monthlyRadio = document.getElementById('monthly');
      const yearlyRadio = document.getElementById('yearly');
      const selectedPlan = document.getElementById('selectedPlan');
      const billingFrequency = document.getElementById('billingFrequency');
      const totalCost = document.getElementById('totalCost');
      const costSavings = document.getElementById('costSavings');
      const submitBtn = document.getElementById('submitWebsiteBtn');

      if (!selectedPlan || !billingFrequency || !totalCost || !submitBtn) return;

      if (monthlyRadio && monthlyRadio.checked) {
        selectedPlan.textContent = 'Monthly Plan';
        billingFrequency.textContent = 'Monthly';
        totalCost.textContent = '$14.99/month';
        if (costSavings) costSavings.style.display = 'none';
        
        submitBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Start Monthly Plan - $14.99/month
        `;
      } else if (yearlyRadio && yearlyRadio.checked) {
        selectedPlan.textContent = 'Yearly Plan';
        billingFrequency.textContent = 'Annually';
        totalCost.textContent = '$149.99/year';
        if (costSavings) costSavings.style.display = 'block';
        
        submitBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Start Yearly Plan - $149.99/year
        `;
      }
    }

    openModal() {
      if (!this.modal) return;
      
      this.modal.style.display = 'flex';
      this.modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      // Focus on first input
      const firstInput = this.modal.querySelector('#websiteUrl');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }

    closeModal() {
      if (!this.modal) return;
      
      this.modal.style.display = 'none';
      this.modal.classList.remove('show');
      document.body.style.overflow = '';
      this.resetForm();
    }

    resetForm() {
      const websiteUrl = document.getElementById('websiteUrl');
      const businessContent = document.getElementById('businessContent');
      const monthlyRadio = document.getElementById('monthly');
      const yearlyRadio = document.getElementById('yearly');

      if (websiteUrl) websiteUrl.value = '';
      if (businessContent) businessContent.value = '';
      if (monthlyRadio) monthlyRadio.checked = true;
      if (yearlyRadio) yearlyRadio.checked = false;

      this.clearErrors();
      this.updatePricingDisplay();
    }

    validateForm() {
      const websiteUrl = document.getElementById('websiteUrl');
      const businessContent = document.getElementById('businessContent');
      let isValid = true;

      this.clearErrors();

      // Validate URL
      if (!websiteUrl || !websiteUrl.value.trim()) {
        this.showFieldError(websiteUrl, 'Website URL is required');
        isValid = false;
      } else if (!this.isValidUrl(websiteUrl.value.trim())) {
        this.showFieldError(websiteUrl, 'Please enter a valid URL (e.g., https://yourwebsite.com)');
        isValid = false;
      }

      // Validate business content
      if (!businessContent || !businessContent.value.trim()) {
        this.showFieldError(businessContent, 'Business content is required');
        isValid = false;
      } else if (businessContent.value.trim().length < 50) {
        this.showFieldError(businessContent, 'Please provide at least 50 characters of business content');
        isValid = false;
      }

      return isValid;
    }

    showFieldError(field, message) {
      if (!field) return;
      
      const existingError = field.parentNode.querySelector('.wm-error-message');
      if (existingError) {
        existingError.remove();
      }

      const errorDiv = document.createElement('div');
      errorDiv.className = 'wm-error-message';
      errorDiv.textContent = message;
      errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        animation: wmFadeIn 0.3s ease;
      `;
      
      field.parentNode.appendChild(errorDiv);
      field.style.borderColor = '#ef4444';
    }

    clearErrors() {
      document.querySelectorAll('.wm-error-message').forEach(error => error.remove());
      
      const fields = ['websiteUrl', 'businessContent'];
      fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
          field.style.borderColor = '';
        }
      });
    }

    isValidUrl(string) {
      try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch (_) {
        return false;
      }
    }

    async submitForm() {
  if (this.isSubmitting) return;

  if (!this.validateForm()) {
    this.showNotification('Please fix the errors above', 'error');
    return;
  }

  const websiteUrl = document.getElementById('websiteUrl').value.trim();
  const businessContent = document.getElementById('businessContent').value.trim();
  const billingType = document.querySelector('input[name="billing"]:checked')?.value || 'monthly';
  const submitBtn = document.getElementById('submitWebsiteBtn');

  const planType = billingType === 'monthly' ? 'Monthly' : 'Yearly';
  const price = billingType === 'monthly' ? 1499 : 14999; // In cents
  const currency = 'usd';

  this.isSubmitting = true;
  if (submitBtn) {
    submitBtn.classList.add('wm-loading');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="wm-spin">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      Processing...
    `;
  }

  try {
    const response = await fetch('payment/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: websiteUrl,
        content: businessContent,
        billing: billingType,
        price,
        currency,
        planType
      })
    });

    const data = await response.json();

    if (!data.sessionId) {
      throw new Error(data.error || 'Stripe session creation failed');
    }

    const stripe = Stripe('pk_test_51RsmhfJEfVkh0GZaqesGb83cGZ9y2loXvJ2C1QrnsuP3bFBvRXzbxS4JaNxPDosfw7mD1aYhJMQXu08TdUYyGLNm00leiWTGHp'); // Replace with your real public key
    await stripe.redirectToCheckout({ sessionId: data.sessionId });

    // No need to continue after redirect

  } catch (error) {
    console.error('Error submitting website:', error);
    this.showNotification('Failed to redirect to payment. Please try again.', 'error');
    this.isSubmitting = false;
    if (submitBtn) {
      submitBtn.classList.remove('wm-loading');
      submitBtn.disabled = false;
      this.updatePricingDisplay();
    }
  }
}


    showNotification(message, type = 'info') {
      // Remove existing notifications
      document.querySelectorAll('.wm-notification').forEach(n => n.remove());
      
      const notification = document.createElement('div');
      notification.className = `wm-notification wm-notification-${type}`;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        font-size: 14px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      `;

      let icon = '';
      switch (type) {
        case 'success':
          icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; flex-shrink: 0;">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>`;
          break;
        case 'error':
          icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; flex-shrink: 0;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>`;
          break;
        default:
          icon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; flex-shrink: 0;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>`;
      }

      notification.innerHTML = `
        <div style="display: flex; align-items: center;">
          ${icon}
          <span>${message}</span>
        </div>
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 10);

      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }, 4000);
    }

    isModalOpen() {
      return this.modal && this.modal.classList.contains('show');
    }
  }

  // Initialize when DOM is loaded
  function initWebsiteModal() {
    if (isInitialized) return;
    
    websiteModal = new WebsiteModalHandler();
    isInitialized = true;
  }

  // Global functions - using unique names to avoid conflicts
  window.openAddWebsiteModal = function() {
    if (!isInitialized) initWebsiteModal();
    if (websiteModal) {
      websiteModal.openModal();
    }
  };

  window.closeAddWebsiteModal = function() {
    if (websiteModal) {
      websiteModal.closeModal();
    }
  };

  window.submitWebsite = function() {
    if (websiteModal) {
      websiteModal.submitForm();
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWebsiteModal);
  } else {
    initWebsiteModal();
  }

  // Add CSS styles with unique prefixes
  const style = document.createElement('style');
  style.textContent = `
    .wm-spin {
      animation: wmSpin 1s linear infinite;
    }
    
    @keyframes wmSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes wmFadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .modal.show {
      display: flex !important;
    }
  `;
  document.head.appendChild(style);

})();
