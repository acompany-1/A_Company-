// Enhanced Security System with 2FA and CSRF Protection

// Security Configuration
const SECURITY_CONFIG = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  passwordMinLength: 8,
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true,
  csrfTokenLength: 32,
  captchaLength: 6,
  twoFACodeLength: 6,
  rateLimitWindow: 60 * 1000, // 1 minute
  rateLimitMaxRequests: 10,
}

// Security State Management
const securityState = {
  loginAttempts: 0,
  isLockedOut: false,
  lockoutEndTime: null,
  sessionStartTime: null,
  currentCaptcha: "",
  csrfToken: "",
  twoFAEnabled: false,
  pendingTwoFA: false,
  requestCount: 0,
  lastRequestTime: 0,
  failedAttempts: JSON.parse(localStorage.getItem("failedAttempts") || "{}"),
}

// Loading Manager
const loadingManager = {
  show: () => {
    const buttons = document.querySelectorAll(".submit-btn")
    buttons.forEach((btn) => {
      btn.classList.add("loading")
      btn.disabled = true
    })
  },

  hide: () => {
    const buttons = document.querySelectorAll(".submit-btn")
    buttons.forEach((btn) => {
      btn.classList.remove("loading")
      btn.disabled = false
    })
  },
}

// Initialize Security System
function initSecurity() {
  generateCSRFToken()
  generateCaptcha()
  setupRateLimiting()
  setupPasswordStrengthMeter()
  setupInputValidation()
  setupSecurityEventListeners()
  loadSecuritySettings()

  console.log("Security system initialized")
}

// CSRF Token Generation and Management
function generateCSRFToken() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""

  for (let i = 0; i < SECURITY_CONFIG.csrfTokenLength; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  securityState.csrfToken = token
  const csrfInput = document.getElementById("csrfToken")
  if (csrfInput) {
    csrfInput.value = token
  }

  return token
}

function validateCSRFToken(token) {
  return token === securityState.csrfToken
}

// Enhanced Captcha System
function generateCaptcha() {
  const canvas = document.getElementById("captchaCanvas")
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let captcha = ""

  // Generate random captcha
  for (let i = 0; i < SECURITY_CONFIG.captchaLength; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  securityState.currentCaptcha = captcha

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Set background with gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, "#f8fafc")
  gradient.addColorStop(1, "#e2e8f0")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Add noise lines
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`
    ctx.lineWidth = Math.random() * 2
    ctx.beginPath()
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.stroke()
  }

  // Draw captcha text
  ctx.font = "bold 18px Arial"
  ctx.textBaseline = "middle"

  for (let i = 0; i < captcha.length; i++) {
    const x = 15 + i * 15
    const y = canvas.height / 2 + (Math.random() - 0.5) * 8
    const rotation = (Math.random() - 0.5) * 0.4

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rotation)
    ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 40%)`
    ctx.fillText(captcha[i], 0, 0)
    ctx.restore()
  }

  // Add noise dots
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.4)`
    ctx.beginPath()
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, 2 * Math.PI)
    ctx.fill()
  }
}

// Rate Limiting
function setupRateLimiting() {
  const now = Date.now()

  if (now - securityState.lastRequestTime > SECURITY_CONFIG.rateLimitWindow) {
    securityState.requestCount = 0
    securityState.lastRequestTime = now
  }
}

function checkRateLimit() {
  const now = Date.now()

  if (now - securityState.lastRequestTime <= SECURITY_CONFIG.rateLimitWindow) {
    securityState.requestCount++

    if (securityState.requestCount > SECURITY_CONFIG.rateLimitMaxRequests) {
      showSecurityAlert("تعداد درخواست‌های شما بیش از حد مجاز است. لطفا کمی صبر کنید.", "warning")
      return false
    }
  } else {
    securityState.requestCount = 1
    securityState.lastRequestTime = now
  }

  return true
}

// Password Strength Meter
function setupPasswordStrengthMeter() {
  const passwordInputs = document.querySelectorAll("#registerPassword, #loginPassword")

  passwordInputs.forEach((input) => {
    if (input.id === "registerPassword") {
      input.addEventListener("input", updatePasswordStrength)
    }
    input.addEventListener("input", validatePasswordInput)
  })
}

function updatePasswordStrength() {
  const password = document.getElementById("registerPassword").value
  const strengthBar = document.querySelector(".strength-fill")
  const strengthText = document.querySelector(".strength-text")

  if (!strengthBar || !strengthText) return

  const strength = calculatePasswordStrength(password)
  const percentage = Math.min(strength.score * 25, 100)

  strengthBar.style.width = percentage + "%"
  strengthBar.className = "strength-fill " + strength.level
  strengthText.textContent = getStrengthText(strength.level) + ` (${Math.round(percentage)}%)`
}

function calculatePasswordStrength(password) {
  let score = 0
  let level = "weak"

  if (password.length >= SECURITY_CONFIG.passwordMinLength) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (password.length >= 16) score++

  if (score >= 6) level = "strong"
  else if (score >= 4) level = "medium"

  return { score, level }
}

function getStrengthText(level) {
  const texts = {
    weak: "ضعیف",
    medium: "متوسط",
    strong: "قوی",
  }
  return texts[level] || "ضعیف"
}

// Input Validation
function setupInputValidation() {
  const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]')

  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateInput(input))
    input.addEventListener("input", () => clearValidationMessage(input))
  })
}

function validateInput(input) {
  const validation = input.parentNode.querySelector(".input-validation")
  if (!validation) return

  let isValid = true
  let message = ""

  // Email validation
  if (input.type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.value)) {
      isValid = false
      message = "لطفا یک ایمیل معتبر وارد کنید"
    }
  }

  // Password validation
  if (input.type === "password") {
    if (input.value.length < SECURITY_CONFIG.passwordMinLength) {
      isValid = false
      message = `رمز عبور باید حداقل ${SECURITY_CONFIG.passwordMinLength} کاراکتر باشد`
    } else if (SECURITY_CONFIG.requireSpecialChars && !/[^A-Za-z0-9]/.test(input.value)) {
      isValid = false
      message = "رمز عبور باید حداقل یک کاراکتر خاص داشته باشد"
    } else if (SECURITY_CONFIG.requireNumbers && !/[0-9]/.test(input.value)) {
      isValid = false
      message = "رمز عبور باید حداقل یک عدد داشته باشد"
    } else if (SECURITY_CONFIG.requireUppercase && !/[A-Z]/.test(input.value)) {
      isValid = false
      message = "رمز عبور باید حداقل یک حرف بزرگ داشته باشد"
    }
  }

  // Name validation
  if (input.id === "registerName") {
    if (input.value.trim().length < 2) {
      isValid = false
      message = "نام باید حداقل 2 کاراکتر باشد"
    }
  }

  // Confirm password validation
  if (input.id === "confirmPassword") {
    const password = document.getElementById("registerPassword").value
    if (input.value !== password) {
      isValid = false
      message = "تکرار رمز عبور مطابقت ندارد"
    }
  }

  updateValidationUI(input, validation, isValid, message)
  return isValid
}

function updateValidationUI(input, validation, isValid, message) {
  if (isValid) {
    input.style.borderColor = "#10b981"
    validation.textContent = ""
    validation.className = "input-validation success"
  } else {
    input.style.borderColor = "#ef4444"
    validation.textContent = message
    validation.className = "input-validation error"
  }
}

function clearValidationMessage(input) {
  const validation = input.parentNode.querySelector(".input-validation")
  if (validation) {
    input.style.borderColor = "rgba(255, 255, 255, 0.2)"
    validation.textContent = ""
    validation.className = "input-validation"
  }
}

// Login Validation
function validateLoginCredentials(email, password) {
  // Simulate different user accounts for demo
  const validCredentials = [
    { email: "admin@company.com", password: "Admin123!" },
    { email: "user@company.com", password: "User123!" },
    { email: "test@company.com", password: "Test123!" },
    { email: "demo@company.com", password: "Demo123!" },
  ]

  return validCredentials.some((cred) => cred.email === email && cred.password === password)
}

// Registration Validation
function validateRegistrationData(name, email, password, confirmPassword, agreeTerms) {
  let isValid = true

  // Validate all fields
  const nameInput = document.getElementById("registerName")
  const emailInput = document.getElementById("registerEmail")
  const passwordInput = document.getElementById("registerPassword")
  const confirmInput = document.getElementById("confirmPassword")

  if (!validateInput(nameInput)) isValid = false
  if (!validateInput(emailInput)) isValid = false
  if (!validateInput(passwordInput)) isValid = false
  if (!validateInput(confirmInput)) isValid = false

  // Check if passwords match
  if (password !== confirmPassword) {
    showSecurityAlert("تکرار رمز عبور مطابقت ندارد", "error")
    isValid = false
  }

  // Check terms agreement
  if (!agreeTerms) {
    showSecurityAlert("لطفا قوانین و مقررات را مطالعه و تأیید کنید", "warning")
    isValid = false
  }

  // Check password strength
  const strength = calculatePasswordStrength(password)
  if (strength.score < 4) {
    showSecurityAlert("رمز عبور انتخابی بسیار ضعیف است", "warning")
    isValid = false
  }

  return isValid
}

// Failed Login Handling
function handleFailedLogin() {
  const email = document.getElementById("loginEmail").value
  const now = Date.now()

  securityState.loginAttempts++

  // Track failed attempts per email
  if (!securityState.failedAttempts[email]) {
    securityState.failedAttempts[email] = { count: 0, lastAttempt: 0 }
  }

  securityState.failedAttempts[email].count++
  securityState.failedAttempts[email].lastAttempt = now

  // Save to localStorage
  localStorage.setItem("failedAttempts", JSON.stringify(securityState.failedAttempts))

  if (securityState.loginAttempts >= SECURITY_CONFIG.maxLoginAttempts) {
    initiateSecurityLockout()
  } else {
    const remaining = SECURITY_CONFIG.maxLoginAttempts - securityState.loginAttempts
    showSecurityAlert(`اطلاعات وارد شده اشتباه است. ${remaining} تلاش باقی‌مانده`, "error")
  }

  // Generate new captcha after failed attempt
  generateCaptcha()
  document.getElementById("captchaInput").value = ""
}

// Security Lockout
function initiateSecurityLockout() {
  securityState.isLockedOut = true
  securityState.lockoutEndTime = Date.now() + SECURITY_CONFIG.lockoutDuration

  const minutes = Math.ceil(SECURITY_CONFIG.lockoutDuration / 60000)
  showSecurityAlert(`بخاطر تلاش‌های ناموفق متعدد، حساب شما برای ${minutes} دقیقه قفل شد`, "error")

  // Disable login form
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    const inputs = loginForm.querySelectorAll("input, button")
    inputs.forEach((input) => (input.disabled = true))
  }

  // Start countdown timer
  startLockoutTimer()
}

function startLockoutTimer() {
  const timer = setInterval(() => {
    const now = Date.now()
    if (now >= securityState.lockoutEndTime) {
      clearInterval(timer)
      endSecurityLockout()
    } else {
      const remaining = Math.ceil((securityState.lockoutEndTime - now) / 1000)
      const minutes = Math.floor(remaining / 60)
      const seconds = remaining % 60

      const message = `قفل حساب: ${minutes}:${seconds.toString().padStart(2, "0")}`
      updateSecurityAlert(message, "warning")
    }
  }, 1000)
}

function endSecurityLockout() {
  securityState.isLockedOut = false
  securityState.lockoutEndTime = null
  securityState.loginAttempts = 0

  // Re-enable login form
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    const inputs = loginForm.querySelectorAll("input, button")
    inputs.forEach((input) => (input.disabled = false))
  }

  showSecurityAlert("قفل حساب برداشته شد. می‌توانید مجدداً تلاش کنید", "success")
  generateCaptcha()
}

// Two-Factor Authentication
function setup2FA() {
  securityState.twoFAEnabled = true
  localStorage.setItem("twoFAEnabled", "true")
  showSecurityAlert("احراز هویت دو مرحله‌ای فعال شد", "success")
}

function generate2FACode() {
  let code = ""
  for (let i = 0; i < SECURITY_CONFIG.twoFACodeLength; i++) {
    code += Math.floor(Math.random() * 10)
  }
  return code
}

function send2FACode() {
  const code = generate2FACode()
  securityState.currentTwoFACode = code

  // Simulate sending SMS/Email
  console.log("2FA Code sent:", code)
  showSecurityAlert(`کد تأیید به شماره موبایل شما ارسال شد: ${code}`, "info")

  return code
}

function showTwoFAModal() {
  const modal = document.getElementById("twoFAModal")
  if (modal) {
    modal.classList.add("active")
    send2FACode()
    startResendTimer()

    // Focus first input
    const firstInput = modal.querySelector(".verification-input")
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100)
    }

    setupVerificationInputs()
  }
}

function closeTwoFAModal() {
  const modal = document.getElementById("twoFAModal")
  if (modal) {
    modal.classList.remove("active")
    clearVerificationInputs()
  }
}

function setupVerificationInputs() {
  const inputs = document.querySelectorAll(".verification-input")

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value

      if (value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus()
      }

      // Check if all inputs are filled
      const allFilled = Array.from(inputs).every((inp) => inp.value.length === 1)
      if (allFilled) {
        const code = Array.from(inputs)
          .map((inp) => inp.value)
          .join("")
        setTimeout(() => verify2FACode(code), 100)
      }
    })

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && index > 0) {
        inputs[index - 1].focus()
      }
    })
  })
}

function clearVerificationInputs() {
  const inputs = document.querySelectorAll(".verification-input")
  inputs.forEach((input) => (input.value = ""))
}

function verify2FACode(code) {
  if (code === securityState.currentTwoFACode) {
    closeTwoFAModal()
    securityState.pendingTwoFA = false
    showSecurityAlert("احراز هویت دو مرحله‌ای موفقیت‌آمیز بود", "success")

    setTimeout(() => {
      showDashboard()
    }, 1000)

    return true
  } else {
    showSecurityAlert("کد وارد شده اشتباه است", "error")
    clearVerificationInputs()
    const firstInput = document.querySelector(".verification-input")
    if (firstInput) firstInput.focus()
    return false
  }
}

function verifyTwoFA() {
  const inputs = document.querySelectorAll(".verification-input")
  const code = Array.from(inputs)
    .map((input) => input.value)
    .join("")

  if (code.length === SECURITY_CONFIG.twoFACodeLength) {
    verify2FACode(code)
  } else {
    showSecurityAlert("لطفا کد 6 رقمی را کامل وارد کنید", "warning")
  }
}

function startResendTimer() {
  let timeLeft = 60
  const timerElement = document.getElementById("resendTimer")

  const timer = setInterval(() => {
    timeLeft--
    if (timerElement) {
      timerElement.textContent = timeLeft
    }

    if (timeLeft <= 0) {
      clearInterval(timer)
      if (timerElement) {
        timerElement.parentNode.innerHTML =
          '<button onclick="resend2FACode()" class="resend-btn">ارسال مجدد کد</button>'
      }
    }
  }, 1000)
}

function resend2FACode() {
  send2FACode()
  startResendTimer()
}

// Security Alert System
function showSecurityAlert(message, type = "info", duration = 5000) {
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll(".security-alert")
  existingAlerts.forEach((alert) => alert.remove())

  const alert = document.createElement("div")
  alert.className = `security-alert ${type}`

  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  }

  alert.innerHTML = `
        <div class="alert-content">
            <i class="${icons[type]}"></i>
            <span>${message}</span>
        </div>
        <button class="alert-close" onclick="this.parentNode.remove()">×</button>
    `

  // Add styles
  alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getAlertColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        animation: slideInRight 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `

  document.body.appendChild(alert)

  // Auto remove
  if (duration > 0) {
    setTimeout(() => {
      if (alert.parentNode) {
        alert.style.animation = "slideInRight 0.3s ease reverse"
        setTimeout(() => alert.remove(), 300)
      }
    }, duration)
  }
}

function updateSecurityAlert(message, type) {
  const existingAlert = document.querySelector(".security-alert")
  if (existingAlert) {
    const messageSpan = existingAlert.querySelector("span")
    if (messageSpan) {
      messageSpan.textContent = message
    }
  } else {
    showSecurityAlert(message, type, 0)
  }
}

function getAlertColor(type) {
  const colors = {
    success: "linear-gradient(135deg, #10b981, #059669)",
    error: "linear-gradient(135deg, #ef4444, #dc2626)",
    warning: "linear-gradient(135deg, #f59e0b, #d97706)",
    info: "linear-gradient(135deg, #3b82f6, #2563eb)",
  }
  return colors[type] || colors.info
}

// Input Sanitization
function sanitizeInput(input) {
  return input
    .replace(/[<>"']/g, "") // Remove potential XSS characters
    .trim()
    .substring(0, 1000) // Limit length
}

// Security Event Listeners
function setupSecurityEventListeners() {
  // Password toggle functionality
  window.togglePassword = (inputId) => {
    const input = document.getElementById(inputId)
    const icon = input.parentNode.querySelector(".password-toggle i")

    if (input.type === "password") {
      input.type = "text"
      icon.className = "fas fa-eye-slash"
    } else {
      input.type = "password"
      icon.className = "fas fa-eye"
    }
  }

  // Prevent multiple form submissions
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    let isSubmitting = false

    form.addEventListener("submit", (e) => {
      if (isSubmitting) {
        e.preventDefault()
        return false
      }

      isSubmitting = true
      setTimeout(() => {
        isSubmitting = false
      }, 3000)
    })
  })

  // Clear failed attempts periodically
  setInterval(
    () => {
      cleanupFailedAttempts()
    },
    5 * 60 * 1000,
  ) // Every 5 minutes
}

function cleanupFailedAttempts() {
  const now = Date.now()
  const maxAge = 60 * 60 * 1000 // 1 hour

  Object.keys(securityState.failedAttempts).forEach((email) => {
    const attemptData = securityState.failedAttempts[email]

    if (now - attemptData.lastAttempt > maxAge) {
      delete securityState.failedAttempts[email]
    }
  })

  localStorage.setItem("failedAttempts", JSON.stringify(securityState.failedAttempts))
}

// Load Security Settings
function loadSecuritySettings() {
  // Load 2FA setting
  const twoFAEnabled = localStorage.getItem("twoFAEnabled") === "true"
  if (twoFAEnabled) {
    securityState.twoFAEnabled = true
    const checkbox = document.getElementById("enable2FA")
    if (checkbox) checkbox.checked = true
  }

  // Load failed attempts
  try {
    securityState.failedAttempts = JSON.parse(localStorage.getItem("failedAttempts") || "{}")
  } catch (e) {
    securityState.failedAttempts = {}
  }
}

// Session Management
function startSecureSession() {
  securityState.sessionStartTime = Date.now()

  // Set session timeout warning
  setTimeout(
    () => {
      if (securityState.sessionStartTime) {
        showSecurityAlert("جلسه شما بزودی منقضی می‌شود", "warning")
      }
    },
    SECURITY_CONFIG.sessionTimeout - 5 * 60 * 1000,
  ) // 5 minutes before timeout

  // Set session timeout
  setTimeout(() => {
    if (securityState.sessionStartTime) {
      showSecurityAlert("جلسه شما منقضی شد", "error")
      setTimeout(() => {
        if (typeof window.logout === "function") {
          window.logout()
        }
      }, 2000)
    }
  }, SECURITY_CONFIG.sessionTimeout)
}

// Export functions for global access
window.initSecurity = initSecurity
window.generateCaptcha = generateCaptcha
window.validateLoginCredentials = validateLoginCredentials
window.validateRegistrationData = validateRegistrationData
window.handleFailedLogin = handleFailedLogin
window.showSecurityAlert = showSecurityAlert
window.loadingManager = loadingManager
window.securityState = securityState
window.SECURITY_CONFIG = SECURITY_CONFIG
window.showTwoFAModal = showTwoFAModal
window.closeTwoFAModal = closeTwoFAModal
window.verifyTwoFA = verifyTwoFA
window.resend2FACode = resend2FACode
window.sanitizeInput = sanitizeInput

// Initialize when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSecurity)
} else {
  initSecurity()
}

// Declare undeclared variables
function validatePasswordInput() {
  // Placeholder for password validation input function
}

function showDashboard() {
  // Placeholder for show dashboard function
}

window.logout = () => {
  // Placeholder for logout function
}
