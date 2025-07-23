// Security Configuration
const SECURITY_CONFIG = {
    maxLoginAttempts: 3,
    lockoutDuration: 300000, // 5 minutes
    passwordMinLength: 8,
    sessionTimeout: 1800000, // 30 minutes
    captchaLength: 6
};

// Security State
let securityState = {
    loginAttempts: 0,
    isLocked: false,
    lockoutTime: null,
    currentCaptcha: '',
    sessionStartTime: null,
    failedAttempts: []
};

// Initialize Security
function initSecurity() {
    generateCaptcha();
    setupInputValidation();
    setupRateLimiting();
    checkSessionTimeout();
    
    // Check if account is locked
    const lockoutData = localStorage.getItem('accountLockout');
    if (lockoutData) {
        const { lockoutTime, attempts } = JSON.parse(lockoutData);
        if (Date.now() - lockoutTime < SECURITY_CONFIG.lockoutDuration) {
            securityState.isLocked = true;
            securityState.loginAttempts = attempts;
            showSecurityAlert('حساب شما به دلیل تلاش‌های ناموفق قفل شده است', 'error');
        } else {
            localStorage.removeItem('accountLockout');
        }
    }
}

// Generate Captcha
function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captcha = '';
    for (let i = 0; i < SECURITY_CONFIG.captchaLength; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    securityState.currentCaptcha = captcha;
    document.getElementById('captchaText').textContent = captcha;
}

// Input Validation
function setupInputValidation() {
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('input', validateEmail);
        input.addEventListener('blur', validateEmail);
    });

    // Password validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (input.id === 'registerPassword') {
                validatePasswordStrength(input);
            }
            validatePassword(input);
        });
    });

    // Name validation
    const nameInput = document.getElementById('registerName');
    if (nameInput) {
        nameInput.addEventListener('input', validateName);
    }

    // Confirm password validation
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    }
}

function validateEmail(event) {
    const input = event.target;
    const email = input.value.trim();
    const validationDiv = document.getElementById(input.id + 'Validation');
    
    if (!email) {
        showValidation(validationDiv, '', '');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (isValid) {
        showValidation(validationDiv, 'ایمیل معتبر است', 'success');
        input.style.borderColor = 'var(--success-color)';
    } else {
        showValidation(validationDiv, 'فرمت ایمیل صحیح نیست', 'error');
        input.style.borderColor = 'var(--error-color)';
    }
}

function validatePassword(input) {
    const password = input.value;
    const validationDiv = document.getElementById(input.id + 'Validation');
    
    if (!password) {
        showValidation(validationDiv, '', '');
        return;
    }

    const minLength = password.length >= SECURITY_CONFIG.passwordMinLength;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (minLength && hasUpper && hasLower && hasNumber) {
        showValidation(validationDiv, 'رمز عبور قوی است', 'success');
        input.style.borderColor = 'var(--success-color)';
    } else {
        let message = 'رمز عبور باید شامل: ';
        const requirements = [];
        if (!minLength) requirements.push('حداقل 8 کاراکتر');
        if (!hasUpper) requirements.push('حروف بزرگ');
        if (!hasLower) requirements.push('حروف کوچک');
        if (!hasNumber) requirements.push('عدد');
        
        message += requirements.join('، ');
        showValidation(validationDiv, message, 'error');
        input.style.borderColor = 'var(--error-color)';
    }
}

function validatePasswordStrength(input) {
    const password = input.value;
    const strengthDiv = document.getElementById('passwordStrength');
    const strengthFill = strengthDiv.querySelector('.strength-fill');
    const strengthText = strengthDiv.querySelector('.strength-text');
    
    if (!password) {
        strengthFill.style.width = '0%';
        strengthText.textContent = 'قدرت رمز عبور';
        return;
    }

    let strength = 0;
    let strengthLabel = '';
    let strengthColor = '';

    // Check various criteria
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
    if (password.length >= 16) strength += 10;

    if (strength < 30) {
        strengthLabel = 'ضعیف';
        strengthColor = 'var(--error-color)';
    } else if (strength < 60) {
        strengthLabel = 'متوسط';
        strengthColor = 'var(--warning-color)';
    } else if (strength < 80) {
        strengthLabel = 'قوی';
        strengthColor = 'var(--success-color)';
    } else {
        strengthLabel = 'بسیار قوی';
        strengthColor = 'var(--success-color)';
    }

    strengthFill.style.width = strength + '%';
    strengthFill.style.background = strengthColor;
    strengthText.textContent = strengthLabel;
}

function validateName(event) {
    const input = event.target;
    const name = input.value.trim();
    const validationDiv = document.getElementById('registerNameValidation');
    
    if (!name) {
        showValidation(validationDiv, '', '');
        return;
    }

    if (name.length < 2) {
        showValidation(validationDiv, 'نام باید حداقل 2 کاراکتر باشد', 'error');
        input.style.borderColor = 'var(--error-color)';
    } else if (!/^[\u0600-\u06FF\s]+$/.test(name)) {
        showValidation(validationDiv, 'لطفا از حروف فارسی استفاده کنید', 'error');
        input.style.borderColor = 'var(--error-color)';
    } else {
        showValidation(validationDiv, 'نام معتبر است', 'success');
        input.style.borderColor = 'var(--success-color)';
    }
}

function validateConfirmPassword() {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const validationDiv = document.getElementById('confirmPasswordValidation');
    
    if (!confirmPassword) {
        showValidation(validationDiv, '', '');
        return;
    }

    if (password === confirmPassword) {
        showValidation(validationDiv, 'رمز عبور تطبیق دارد', 'success');
        document.getElementById('confirmPassword').style.borderColor = 'var(--success-color)';
    } else {
        showValidation(validationDiv, 'رمز عبور تطبیق ندارد', 'error');
        document.getElementById('confirmPassword').style.borderColor = 'var(--error-color)';
    }
}

function showValidation(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `input-validation ${type}`;
}

// Rate Limiting
function setupRateLimiting() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmission);
    });
}

function handleFormSubmission(event) {
    event.preventDefault();
    
    if (securityState.isLocked) {
        showSecurityAlert('حساب شما قفل است. لطفا بعدا تلاش کنید', 'error');
        return false;
    }

    // Check rate limiting
    const now = Date.now();
    const recentAttempts = securityState.failedAttempts.filter(
        attempt => now - attempt < 60000 // Last minute
    );

    if (recentAttempts.length >= 5) {
        showSecurityAlert('تعداد تلاش‌های شما زیاد است. لطفا کمی صبر کنید', 'warning');
        return false;
    }

    const form = event.target;
    if (form.id === 'loginForm') {
        return handleLogin(form);
    } else if (form.id === 'registerForm') {
        return handleRegister(form);
    }
}

function handleLogin(form) {
    const email = form.querySelector('#loginEmail').value.trim();
    const password = form.querySelector('#loginPassword').value;
    const captchaInput = form.querySelector('#captchaInput').value.toUpperCase();
    
    // Validate captcha
    if (captchaInput !== securityState.currentCaptcha) {
        showSecurityAlert('کد امنیتی اشتباه است', 'error');
        generateCaptcha();
        securityState.failedAttempts.push(Date.now());
        return false;
    }

    // Simulate login validation
    if (validateLoginCredentials(email, password)) {
        securityState.loginAttempts = 0;
        securityState.sessionStartTime = Date.now();
        localStorage.removeItem('accountLockout');
        showSecurityAlert('ورود موفقیت‌آمیز', 'success');
        
        setTimeout(() => {
            showDashboard();
        }, 1500);
        
        return true;
    } else {
        handleFailedLogin();
        return false;
    }
}

function validateLoginCredentials(email, password) {
    // Simulate credential validation
    // In real application, this would be server-side validation
    return email.includes('@') && password.length >= 6;
}

function handleFailedLogin() {
    securityState.loginAttempts++;
    securityState.failedAttempts.push(Date.now());
    
    const remainingAttempts = SECURITY_CONFIG.maxLoginAttempts - securityState.loginAttempts;
    
    if (securityState.loginAttempts >= SECURITY_CONFIG.maxLoginAttempts) {
        securityState.isLocked = true;
        securityState.lockoutTime = Date.now();
        
        localStorage.setItem('accountLockout', JSON.stringify({
            lockoutTime: securityState.lockoutTime,
            attempts: securityState.loginAttempts
        }));
        
        showSecurityAlert('حساب شما به دلیل تلاش‌های ناموفق قفل شد', 'error');
    } else {
        showSecurityAlert(`اطلاعات اشتباه است. ${remainingAttempts} تلاش باقی مانده`, 'warning');
    }
    
    generateCaptcha();
    document.getElementById('captchaInput').value = '';
    
    // Add shake animation
    document.querySelector('.login-container').classList.add('shake');
    setTimeout(() => {
        document.querySelector('.login-container').classList.remove('shake');
    }, 500);
}

function handleRegister(form) {
    const name = form.querySelector('#registerName').value.trim();
    const email = form.querySelector('#registerEmail').value.trim();
    const password = form.querySelector('#registerPassword').value;
    const confirmPassword = form.querySelector('#confirmPassword').value;
    const agreeTerms = form.querySelector('#agreeTerms').checked;
    
    // Validate all fields
    if (!validateRegistrationData(name, email, password, confirmPassword, agreeTerms)) {
        return false;
    }
    
    showSecurityAlert('حساب کاربری با موفقیت ایجاد شد', 'success');
    
    setTimeout(() => {
        showDashboard();
    }, 1500);
    
    return true;
}

function validateRegistrationData(name, email, password, confirmPassword, agreeTerms) {
    let isValid = true;
    
    if (name.length < 2) {
        showSecurityAlert('نام باید حداقل 2 کاراکتر باشد', 'error');
        isValid = false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showSecurityAlert('فرمت ایمیل صحیح نیست', 'error');
        isValid = false;
    }
    
    if (password.length < SECURITY_CONFIG.passwordMinLength) {
        showSecurityAlert('رمز عبور باید حداقل 8 کاراکتر باشد', 'error');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showSecurityAlert('رمز عبور و تکرار آن یکسان نیستند', 'error');
        isValid = false;
    }
    
    if (!agreeTerms) {
        showSecurityAlert('باید قوانین و مقررات را بپذیرید', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Session Management
function checkSessionTimeout() {
    setInterval(() => {
        if (securityState.sessionStartTime) {
            const sessionDuration = Date.now() - securityState.sessionStartTime;
            if (sessionDuration > SECURITY_CONFIG.sessionTimeout) {
                showSecurityAlert('جلسه شما منقضی شده است', 'warning');
                setTimeout(logout, 2000);
            }
        }
    }, 60000); // Check every minute
}

// Security Alerts
function showSecurityAlert(message, type = 'info') {
    const alertDiv = document.getElementById('securityAlert');
    const messageSpan = document.getElementById('alertMessage');
    
    messageSpan.textContent = message;
    alertDiv.className = `security-alert ${type}`;
    alertDiv.classList.remove('hidden');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        alertDiv.classList.add('hidden');
    }, 5000);
}

function closeAlert() {
    document.getElementById('securityAlert').classList.add('hidden');
}

// Password Toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        toggle.className = 'fas fa-eye';
    }
}

// Input Sanitization
function sanitizeInput(input) {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/[<>]/g, '')
                .trim();
}

// XSS Protection
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize security when DOM is loaded
document.addEventListener('DOMContentLoaded', initSecurity);

// Declare showDashboard and logout functions
function showDashboard() {
    // Implementation for showing dashboard
    console.log('Showing dashboard');
}

function logout() {
    // Implementation for logging out
    console.log('Logging out');
}