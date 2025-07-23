// Enhanced Main Script with Security Integration

// Global state
let currentUser = null;
let dashboardInitialized = false;
let loadingManager = {}; // Declare loadingManager
let securityState = {}; // Declare securityState
let DashboardAnimations = {}; // Declare DashboardAnimations
let dashboardAnimations = {}; // Declare dashboardAnimations
let initSecurity = function() {}; // Declare initSecurity
let SECURITY_CONFIG = {}; // Declare SECURITY_CONFIG

// Tab switching functionality
function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    tabs[0].classList.add('active');
    tabs[1].classList.remove('active');
    
    // Reset validation states
    resetFormValidation('loginForm');
}

function showRegister() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    tabs[1].classList.add('active');
    tabs[0].classList.remove('active');
    
    // Reset validation states
    resetFormValidation('registerForm');
}

function resetFormValidation(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input');
    const validations = form.querySelectorAll('.input-validation');
    
    inputs.forEach(input => {
        input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });
    
    validations.forEach(validation => {
        validation.textContent = '';
        validation.className = 'input-validation';
    });
}

// Enhanced form submission handlers
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmission);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmission);
    }
    
    // Initialize dashboard animations when shown
    const dashboard = document.getElementById('dashboard');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (!dashboard.classList.contains('hidden') && !dashboardInitialized) {
                    initializeDashboard();
                    dashboardInitialized = true;
                }
            }
        });
    });
    
    observer.observe(dashboard, { attributes: true });
});

function handleLoginSubmission(e) {
    e.preventDefault();
    
    if (loadingManager) {
        loadingManager.show();
    }
    
    // Simulate authentication process
    setTimeout(() => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const captcha = document.getElementById('captchaInput').value.toUpperCase();
        
        // Validate captcha first
        if (captcha !== securityState.currentCaptcha) {
            if (loadingManager) loadingManager.hide();
            showSecurityAlert('کد امنیتی اشتباه است', 'error');
            generateCaptcha();
            document.getElementById('captchaInput').value = '';
            return;
        }
        
        // Simulate login validation
        if (validateLoginCredentials(email, password)) {
            currentUser = {
                name: extractNameFromEmail(email),
                email: email,
                loginTime: new Date()
            };
            
            if (loadingManager) loadingManager.hide();
            showSecurityAlert('ورود موفقیت‌آمیز! در حال انتقال...', 'success');
            
            setTimeout(() => {
                showDashboard();
            }, 1500);
        } else {
            if (loadingManager) loadingManager.hide();
            handleFailedLogin();
        }
    }, 2000);
}

function handleRegisterSubmission(e) {
    e.preventDefault();
    
    if (loadingManager) {
        loadingManager.show();
    }
    
    // Simulate registration process
    setTimeout(() => {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        if (validateRegistrationData(name, email, password, confirmPassword, agreeTerms)) {
            currentUser = {
                name: name,
                email: email,
                loginTime: new Date(),
                isNewUser: true
            };
            
            if (loadingManager) loadingManager.hide();
            showSecurityAlert('حساب کاربری با موفقیت ایجاد شد!', 'success');
            
            setTimeout(() => {
                showDashboard();
            }, 1500);
        } else {
            if (loadingManager) loadingManager.hide();
        }
    }, 2500);
}

function extractNameFromEmail(email) {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
}

function showDashboard() {
    // Hide login container
    document.querySelector('.container').style.display = 'none';
    
    // Show dashboard
    const dashboard = document.getElementById('dashboard');
    dashboard.classList.remove('hidden');
    
    // Update user info
    if (currentUser) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
        }
    }
    
    // Initialize dashboard if not already done
    if (!dashboardInitialized) {
        initializeDashboard();
        dashboardInitialized = true;
    }
    
    // Show welcome message for new users
    if (currentUser && currentUser.isNewUser) {
        setTimeout(() => {
            showSecurityAlert('به خانواده Company خوش آمدید!', 'success');
        }, 1000);
    }
}

function initializeDashboard() {
    // Initialize dashboard animations
    if (typeof DashboardAnimations !== 'undefined') {
        dashboardAnimations = new DashboardAnimations();
    }
    
    // Setup element interactions
    setupElementInteractions();
    
    // Start session monitoring
    startSessionMonitoring();
    
    // Setup notification system
    setupNotifications();
}

function setupElementInteractions() {
    const elementCards = document.querySelectorAll('.element-card');
    
    elementCards.forEach(card => {
        const btn = card.querySelector('.element-btn');
        const element = card.dataset.element;
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            handleElementSelection(element, card);
        });
        
        // Enhanced hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
            
            // Animate stats
            const statFills = this.querySelectorAll('.stat-fill');
            statFills.forEach(fill => {
                const originalWidth = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = originalWidth;
                }, 100);
            });
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
}

function handleElementSelection(element, card) {
    // Remove previous selections
    document.querySelectorAll('.element-card').forEach(c => {
        c.classList.remove('selected');
        c.style.transform = 'translateY(0) scale(1)';
    });
    
    // Add selection to current card
    card.classList.add('selected');
    card.style.transform = 'translateY(-15px) scale(1.02)';
    
    // Create selection effect
    createSelectionEffect(card);
    
    // Show detailed element info
    showElementDetails(element);
    
    // Log selection for analytics
    logElementSelection(element);
}

function createSelectionEffect(card) {
    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        margin-left: -50px;
        margin-top: -50px;
    `;
    
    card.style.position = 'relative';
    card.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
    
    // Show success message
    const elementName = card.querySelector('h3').textContent;
    showElementSelectionFeedback(elementName);
}

function showElementSelectionFeedback(elementName) {
    const feedback = document.createElement('div');
    feedback.innerHTML = `
        <div class="feedback-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="feedback-content">
            <h3>عنصر انتخاب شد!</h3>
            <p>شما عنصر ${elementName} را انتخاب کردید</p>
        </div>
    `;
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
        backdrop-filter: blur(20px);
        color: white;
        padding: 30px;
        border-radius: 20px;
        font-weight: 600;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 20px;
        box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: feedbackSlideIn 0.5s ease-out;
        min-width: 300px;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes feedbackSlideIn {
            from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        .feedback-icon {
            font-size: 2rem;
            background: rgba(255, 255, 255, 0.2);
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .feedback-content h3 {
            margin: 0 0 5px 0;
            font-size: 1.2rem;
        }
        .feedback-content p {
            margin: 0;
            opacity: 0.9;
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.animation = 'feedbackSlideIn 0.3s ease-in reverse';
        setTimeout(() => {
            document.body.removeChild(feedback);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
}

function showElementDetails(element) {
    const elementData = {
        water: {
            name: 'آب',
            description: 'عنصر حیات و طراوت که نماد انعطاف‌پذیری و قدرت درونی است.',
            powers: ['شفابخشی', 'تطهیر', 'انعطاف'],
            color: '#3b82f6'
        },
        fire: {
            name: 'آتش',
            description: 'عنصر انرژی و قدرت که نماد شور و اشتیاق است.',
            powers: ['انرژی', 'تحول', 'قدرت'],
            color: '#ef4444'
        },
        wind: {
            name: 'باد',
            description: 'عنصر آزادی و حرکت که نماد تغییر و پیشرفت است.',
            powers: ['سرعت', 'آزادی', 'تغییر'],
            color: '#10b981'
        },
        earth: {
            name: 'خاک',
            description: 'عنصر ثبات و استحکام که نماد پایداری و قدرت است.',
            powers: ['ثبات', 'محافظت', 'استحکام'],
            color: '#f59e0b'
        }
    };
    
    const data = elementData[element];
    if (data) {
        console.log(`Element Selected: ${data.name}`, data);
        // Here you could show a modal or update UI with element details
    }
}

function logElementSelection(element) {
    const selectionData = {
        element: element,
        user: currentUser?.email || 'anonymous',
        timestamp: new Date().toISOString(),
        sessionId: generateSessionId()
    };
    
    // In a real application, this would be sent to analytics service
    console.log('Element Selection Logged:', selectionData);
}

function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
}

function startSessionMonitoring() {
    // Update session time every minute
    setInterval(() => {
        if (currentUser) {
            const sessionDuration = Date.now() - currentUser.loginTime.getTime();
            const minutes = Math.floor(sessionDuration / 60000);
            
            // Show session warning at 25 minutes
            if (minutes === 25) {
                showSecurityAlert('جلسه شما در 5 دقیقه منقضی می‌شود', 'warning');
            }
        }
    }, 60000);
}

function setupNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', showNotifications);
    }
}

function showNotifications() {
    const notifications = [
        {
            id: 1,
            title: 'به‌روزرسانی سیستم',
            message: 'سیستم با موفقیت به‌روزرسانی شد',
            time: '5 دقیقه پیش',
            type: 'success'
        },
        {
            id: 2,
            title: 'ورود جدید',
            message: 'ورود موفقیت‌آمیز از دستگاه جدید',
            time: '10 دقیقه پیش',
            type: 'info'
        },
        {
            id: 3,
            title: 'تنظیمات امنیتی',
            message: 'تنظیمات امنیتی به‌روزرسانی شد',
            time: '1 ساعت پیش',
            type: 'warning'
        }
    ];
    
    // Create notification panel
    const panel = document.createElement('div');
    panel.innerHTML = `
        <div class="notification-header">
            <h3>اعلان‌ها</h3>
            <button onclick="closeNotifications()" class="close-btn">×</button>
        </div>
        <div class="notification-list">
            ${notifications.map(notif => `
                <div class="notification-item ${notif.type}">
                    <div class="notification-content">
                        <h4>${notif.title}</h4>
                        <p>${notif.message}</p>
                        <span class="notification-time">${notif.time}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    panel.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        width: 350px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        color: #333;
    `;
    
    panel.id = 'notificationPanel';
    document.body.appendChild(panel);
    
    // Add styles for notification panel
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-header {
            padding: 20px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .notification-header h3 {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
        }
        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
        }
        .notification-list {
            max-height: 400px;
            overflow-y: auto;
        }
        .notification-item {
            padding: 15px 20px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            transition: background 0.2s ease;
        }
        .notification-item:hover {
            background: rgba(0, 0, 0, 0.02);
        }
        .notification-item:last-child {
            border-bottom: none;
        }
        .notification-content h4 {
            margin: 0 0 5px 0;
            font-size: 0.9rem;
            font-weight: 600;
        }
        .notification-content p {
            margin: 0 0 5px 0;
            font-size: 0.8rem;
            color: #666;
        }
        .notification-time {
            font-size: 0.7rem;
            color: #999;
        }
        .notification-item.success { border-right: 3px solid #10b981; }
        .notification-item.warning { border-right: 3px solid #f59e0b; }
        .notification-item.info { border-right: 3px solid #3b82f6; }
    `;
    document.head.appendChild(notificationStyles);
}

function closeNotifications() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(panel);
        }, 300);
    }
}

function logout() {
    // Show confirmation
    if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
        // Clear user data
        currentUser = null;
        dashboardInitialized = false;
        
        // Reset security state
        securityState.sessionStartTime = null;
        
        // Hide dashboard
        document.getElementById('dashboard').classList.add('hidden');
        
        // Show login container
        document.querySelector('.container').style.display = 'flex';
        
        // Reset forms
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        
        // Reset form validation
        resetFormValidation('loginForm');
        resetFormValidation('registerForm');
        
        // Show login tab
        showLogin();
        
        // Generate new captcha
        generateCaptcha();
        
        // Show logout message
        showSecurityAlert('با موفقیت خارج شدید', 'success');
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Generate initial captcha
    generateCaptcha();
    
    // Setup form event listeners
    setupFormEventListeners();
    
    // Initialize security
    if (typeof initSecurity === 'function') {
        initSecurity();
    }
});

function setupFormEventListeners() {
    // Prevent form submission on Enter in captcha field
    const captchaInput = document.getElementById('captchaInput');
    if (captchaInput) {
        captchaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const form = this.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        });
    }
    
    // Auto-focus first input when switching tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            setTimeout(() => {
                const activeForm = document.querySelector('.auth-form.active');
                const firstInput = activeForm?.querySelector('input');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        });
    });
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showSecurityAlert('خطایی رخ داده است. لطفا صفحه را تازه‌سازی کنید', 'error');
});

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page hidden - pausing timers');
    } else {
        console.log('Page visible - resuming timers');
        // Check session validity when page becomes visible
        if (currentUser && securityState.sessionStartTime) {
            const sessionDuration = Date.now() - securityState.sessionStartTime;
            if (sessionDuration > SECURITY_CONFIG.sessionTimeout) {
                showSecurityAlert('جلسه شما منقضی شده است', 'warning');
                setTimeout(logout, 2000);
            }
        }
    }
});

// Declare functions that were previously undeclared
function showSecurityAlert(message, type) {
    console.log(`Security Alert (${type}): ${message}`);
}

function generateCaptcha() {
    securityState.currentCaptcha = 'ABC123'; // Example captcha
    console.log('Captcha generated:', securityState.currentCaptcha);
}

function validateLoginCredentials(email, password) {
    return email === 'test@example.com' && password === 'password'; // Example validation
}

function handleFailedLogin() {
    console.log('Login failed');
}

function validateRegistrationData(name, email, password, confirmPassword, agreeTerms) {
    return name && email && password === confirmPassword && agreeTerms; // Example validation
}
