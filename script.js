function startForm() {
    // Reveal form container
    document.getElementById('form-container').classList.add('active');
    
    // Deactivate intro UI
    const introStep = document.getElementById('step-intro');
    const startBtn = introStep.querySelector('.next-btn');
    startBtn.style.display = 'none';

    // Activate the first form field
    const firstStep = document.getElementById('step-company');
    firstStep.classList.add('active');
    
    setTimeout(() => {
        document.getElementById('company').focus();
        firstStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function handleEnter(e, nextStepId) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const currentStepEl = e.target.closest('.form-step');
        nextStep(currentStepEl.id, nextStepId);
        
        // Show submit button if it's the final question
        if (currentStepEl.id === 'step-price') {
            enableSubmit();
        }
    }
}

function nextStep(currentStepId, nextStepId) {
    const currentStep = document.getElementById(currentStepId);
    
    // Validation
    const input = currentStep.querySelector('input, textarea');
    let isValid = true;
    
    if (input) {
        if (!input.value.trim()) {
            isValid = false;
        }
        if (input.type === 'email' && !input.value.includes('@')) {
            isValid = false;
        }
    }
    
    const errorMsg = currentStep.querySelector('.error-msg');
    
    if (!isValid) {
        if (errorMsg) errorMsg.style.display = 'block';
        if (input) input.focus();
        return;
    }
    
    if (errorMsg) errorMsg.style.display = 'none';
    
    // Mark current as completed to remove styling borders
    currentStep.classList.add('completed');
    
    // Show next step
    if (nextStepId) {
        const nextStepEl = document.getElementById(nextStepId);
        nextStepEl.classList.add('active');
        
        setTimeout(() => {
            const nextInput = nextStepEl.querySelector('input, textarea, select');
            if (nextInput) nextInput.focus();
            
            // smooth scroll to the newly revealed step
            nextStepEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
    }
}

function enableSubmit() {
    const input = document.getElementById('price-range');
    const submitContainer = document.getElementById('submit-container');
    const errorMsg = document.getElementById('step-price').querySelector('.error-msg');
    
    if (input.value.trim()) {
        submitContainer.classList.add('active');
        if(errorMsg) errorMsg.style.display = 'none';
        
        checkSubmitConditions();
        
        setTimeout(() => {
            submitContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    }
}

function checkSubmitConditions() {
    const priceInput = document.getElementById('price-range');
    const privacyCheckbox = document.getElementById('privacy-agree');
    const submitBtn = document.getElementById('submit-btn');
    
    if (priceInput.value.trim() && privacyCheckbox && privacyCheckbox.checked) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

async function submitForm() {
    const priceInput = document.getElementById('price-range');
    if(!priceInput.value.trim()) {
        document.getElementById('step-price').querySelector('.error-msg').style.display = 'block';
        return;
    }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.textContent = '제출 중...';
    submitBtn.disabled = true;
    
    const formData = {
        company: document.getElementById('company').value,
        contactName: document.getElementById('contact-name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        product: document.getElementById('product').value,
        priceRange: priceInput.value.trim(),
        timestamp: new Date().toISOString()
    };

    // TODO: Replace this URL with the actual Google Apps Script Webhook URL
    const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxvmTPa2o_2TinaJCe_t0gHYu7aTdG56oZYkXkudCLQIYNktF9lZ60y6o_Rn4lcrkMM_w/exec'; 

    try {
        if (WEBHOOK_URL) {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                // Using text/plain to avoid CORS preflight issues with Google Apps Script
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Network error');
        } else {
            await new Promise(r => setTimeout(r, 800));
        }

        // Hide form contents and spacer, show success screen inside app
        document.getElementById('step-intro').style.display = 'none';
        document.getElementById('form-container').style.display = 'none';
        document.querySelector('.app-header').style.display = 'none';
        
        // Hide the 50vh spacer at the bottom
        const spacer = document.querySelector('div[style*="height: 50vh"]');
        if (spacer) {
            spacer.style.display = 'none';
        }
        
        const successScreen = document.getElementById('success-screen');
        successScreen.classList.add('active');
        window.scrollTo(0, 0);
        
    } catch (e) {
        console.error(e);
        alert('진행 중 오류가 발생했습니다.');
        submitBtn.textContent = '제휴 의향서 제출하기';
        submitBtn.disabled = false;
    }
}

// Allow re-editing and dynamic completion of steps
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.form-step input, .form-step textarea, .form-step select').forEach(input => {
        input.addEventListener('focus', function() {
            const step = this.closest('.form-step');
            if (step && step.classList.contains('completed')) {
                step.classList.remove('completed');
            }
        });

        input.addEventListener('blur', function() {
            const step = this.closest('.form-step');
            // Slight delay to allow clicks on 'Next' button to register first
            setTimeout(() => {
                if (document.activeElement !== this && this.value.trim() !== '') {
                    if (this.type === 'email' && !this.value.includes('@')) return;
                    step.classList.add('completed');
                }
            }, 100);
        });
    });
});

function togglePrivacyDetails() {
    const details = document.getElementById('privacy-details-content');
    const chevron = document.getElementById('privacy-chevron');
    if (details.style.display === 'none' || details.style.display === '') {
        details.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
    } else {
        details.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
}
