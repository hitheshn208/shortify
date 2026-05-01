let passwordInput;
let passwordvisibility, switchAuth;
const authRoot = document.querySelector('#authRoot');
const loginTemplate = document.querySelector('#loginTemplate');
const registerTemplate = document.querySelector('#registerTemplate');
const otpTemplate = document.querySelector('#otpTemplate');
const nameTemplate = document.querySelector('#nameTemplate');
// Frontend endpoints used by the multi-step signup flow:
// POST /auth/signup            -> payload: { email, password }
//    - Backend should send OTP to the provided email and respond with success.
// POST /auth/verify-otp        -> payload: { email, otp }
//    - Backend verifies OTP and responds with success if valid.
// POST /auth/complete-profile  -> payload: { email, name }
//    - Backend completes profile and returns { redirectUrl } (or 200).
// Note: Google OAuth button is left as a no-op for now.
let isPasswordVisible = false;
let signupEmail = null;
let pendingRegisterEmail = '';

function getAuthMessageElement() {
    return document.querySelector('#authMessage');
}

function showAuthMessage(message, type = 'error') {
    const messageElement = getAuthMessageElement();

    if(!messageElement) {
        return;
    }

    messageElement.textContent = message || '';
    messageElement.classList.remove('is-error', 'is-success', 'is-visible');

    if(message) {
        messageElement.classList.add('is-visible');
        messageElement.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
}

async function readResponseData(response) {
    const contentType = response.headers.get('content-type') || '';

    if(contentType.includes('application/json')) {
        return await response.json();
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (error) {
        return { message: text };
    }
}

async function submitAuthForm(form) {
    const endpoint = form.dataset.endpoint;
    const successRedirect = form.dataset.successRedirect || '/user/dashboard';
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    showAuthMessage('');
    console.log(data.email)

    if(submitButton) {
        submitButton.disabled = true;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await readResponseData(response);
        const message = responseData.message || responseData.error || responseData.msg || '';

        if(response.ok) {
            if(message) {
                showAuthMessage(message, 'success');
            }

            if(response.redirected) {
                window.location.replace(response.url);
                return;
            }

            window.location.replace(responseData.redirectUrl || successRedirect);
            return;
        }
        showAuthMessage(message || 'Authentication failed. Please try again.', 'error');
    } catch (error) {
        showAuthMessage('Unable to submit the form right now. Please try again.', 'error');
    } finally {
        if(submitButton) {
            submitButton.disabled = false;
        }
    }
}

function renderTemplate(template){
    if(!authRoot || !template)
    {
        return;
    }
    authRoot.innerHTML = template.innerHTML;
}

function populateOtpTemplate(email) {
    if(!otpTemplate) return;
    renderTemplate(otpTemplate);
    setTimeout(() => {
        const resolvedEmail = email || signupEmail || '';
        const otpEmailInput = document.querySelector('#otpEmailInput');
        const otpEmailText = document.querySelector('#otpEmailText');
        if(otpEmailInput) otpEmailInput.value = resolvedEmail;
        if(otpEmailText) otpEmailText.textContent = resolvedEmail || 'your email';
        initialiseOTPPage();
    }, 50);
}

function populateNameTemplate(email) {
    if(!nameTemplate) return;
    renderTemplate(nameTemplate);
    setTimeout(() => {
        const nameEmailInput = document.querySelector('#nameEmailInput');
        if(nameEmailInput) nameEmailInput.value = email || signupEmail || '';
        initialiseNamePage();
    }, 50);
}

function togglePasswordVisibility(passwordField, visibilityButton) {
    isPasswordVisible = !isPasswordVisible;

    if(isPasswordVisible) {
        passwordField.type = "text";
        visibilityButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#6b7280">
                <path d="M607.5-372.5Q660-425 660-500t-52.5-127.5Q555-680 480-680t-127.5 52.5Q300-575 300-500t52.5 127.5Q405-320 480-320t127.5-52.5Zm-204-51Q372-455 372-500t31.5-76.5Q435-608 480-608t76.5 31.5Q588-545 588-500t-31.5 76.5Q525-392 480-392t-76.5-31.5ZM214-281.5Q94-363 40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200q-146 0-266-81.5ZM480-500Zm207.5 160.5Q782-399 832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280q113 0 207.5-59.5Z"/>
            </svg>`;
    } else {
        passwordField.type = "password";
        visibilityButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#6b7280">
                <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"/>
            </svg>`;
    }
}

function initialiseLoginPage(){
    const authForm = document.querySelector('.auth-form');
    passwordInput = document.querySelector("#passwordInput");
    passwordvisibility = document.querySelector("#visibility");
    
    const googleLoginBtn = document.querySelector("#googleLoginBtn");
    switchAuth = document.querySelector("#switchAuth");

    if(!passwordInput || !passwordvisibility) {
        return;
    }

    if(authForm) {
        authForm.addEventListener('submit', (event) => {
            event.preventDefault();
            submitAuthForm(authForm);
        });
    }

    // Password visibility toggle
    passwordvisibility.addEventListener("click", (e) => {
        e.preventDefault();
        togglePasswordVisibility(passwordInput, passwordvisibility);
    });

    // Google login button
    if(googleLoginBtn) {
        googleLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            // TODO: Integrate with Google OAuth
            console.log("Google login clicked");
            // Redirect to your backend Google OAuth endpoint
            // window.location.href = '/auth/google';
        });
    }

    // Switch to register
    if(switchAuth) {
        switchAuth.addEventListener("click", (e) => {
            e.preventDefault();
            populateRegister();
        });
    }
}

function populateLogin() {
    isPasswordVisible = false;
    renderTemplate(loginTemplate);
    setTimeout(() => {
        initialiseLoginPage();
    }, 50);
}

function initialiseRegisterPage() {
    const authForm = document.querySelector('.auth-form');
    passwordInput = document.querySelector("#passwordInput");
    passwordvisibility = document.querySelector("#visibility");
    
    const googleSignupBtn = document.querySelector("#googleSignupBtn");
    switchAuth = document.querySelector("#switchAuth");

    if(!passwordInput || !passwordvisibility) {
        return;
    }

    // Register uses a custom flow: signup -> OTP -> name
    if(authForm) {
        authForm.addEventListener('submit', (event) => {
            event.preventDefault();
            submitSignupForm(authForm);
        });
    }

    // Password visibility toggle
    passwordvisibility.addEventListener("click", (e) => {
        e.preventDefault();
        togglePasswordVisibility(passwordInput, passwordvisibility);
    });

    // Google signup button
    if(googleSignupBtn) {
        googleSignupBtn.addEventListener("click", (e) => {
            e.preventDefault();
            // TODO: Integrate with Google OAuth
            console.log("Google signup clicked");
            // Redirect to your backend Google OAuth endpoint
            // window.location.href = '/auth/google';
        });
    }

    // Switch to login
    if(switchAuth) {
        switchAuth.addEventListener("click", (e) => {
            e.preventDefault();
            populateLogin();
        });
    }
}

function populateRegister() {
    isPasswordVisible = false;
    renderTemplate(registerTemplate);
    setTimeout(() => {
        initialiseRegisterPage();
        if(pendingRegisterEmail) {
            const emailInput = document.querySelector('#emailInput');
            if(emailInput) {
                emailInput.value = pendingRegisterEmail;
                emailInput.focus();
                emailInput.setSelectionRange(emailInput.value.length, emailInput.value.length);
            }
            pendingRegisterEmail = '';
        }
    }, 50);
}

// Initialize based on current page
if(authRoot && authRoot.dataset.isLogin === "true") {
    populateLogin();
} else {
    populateRegister();
}

async function submitSignupForm(form) {
    const endpoint = form.dataset.endpoint;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    showAuthMessage('');
    if(submitButton) submitButton.disabled = true;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(data)
        });

        const responseData = await readResponseData(response);
        const message = responseData.message || responseData.error || '';

        if(response.ok) {
            // Expect backend to have sent OTP to email. Store email and show OTP step.
            signupEmail = data.email || responseData.email || signupEmail;
            showAuthMessage(message || 'OTP sent to your email', 'success');
            populateOtpTemplate(signupEmail);
            return;
        }

        showAuthMessage(message || 'Signup failed. Please try again.', 'error');
    } catch (error) {
        showAuthMessage('Unable to submit the form right now. Please try again.', 'error');
    } finally {
        if(submitButton) submitButton.disabled = false;
    }
}

function initialiseOTPPage() {
    const otpForm = document.querySelector('.otp-form');
    const resendLink = document.querySelector('#resendOtp');
    const resendTimer = document.querySelector('#resendTimer');
    const backToRegisterButton = document.querySelector('#backToRegister');
    const otpBoxes = document.querySelectorAll('.otp-box');
    const otpCombinedInput = document.querySelector('#otpCombined');

    // Start 2-minute (120 second) timer for resend
    let resendCountdown = 120;
    let timerInterval = null;

    function updateTimerDisplay() {
        const minutes = Math.floor(resendCountdown / 60);
        const seconds = resendCountdown % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if(resendTimer) {
            if(resendCountdown > 0) {
                resendTimer.textContent = `(${timeStr})`;
                resendTimer.classList.remove('hidden');
                if(resendLink) {
                    resendLink.style.pointerEvents = 'none';
                    resendLink.style.opacity = '0.5';
                }
            } else {
                resendTimer.classList.add('hidden');
                if(resendLink) {
                    resendLink.style.pointerEvents = 'auto';
                    resendLink.style.opacity = '1';
                }
            }
        }
    }

    function startTimer() {
        resendCountdown = 120;
        updateTimerDisplay();
        
        timerInterval = setInterval(() => {
            resendCountdown--;
            updateTimerDisplay();
            
            if(resendCountdown <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }, 1000);
    }

    // Initialize timer on page load
    startTimer();

    // Setup 6-box OTP auto-focus and backspace
    otpBoxes.forEach((box, index) => {
        box.addEventListener('input', (e) => {
            // Only allow digits
            if(!/^\d$/.test(e.target.value)) {
                e.target.value = '';
                return;
            }
            
            // Auto-focus next box
            if(index < otpBoxes.length - 1 && e.target.value) {
                otpBoxes[index + 1].focus();
            }

            // Update hidden input with combined OTP
            const combined = Array.from(otpBoxes).map(b => b.value).join('');
            if(otpCombinedInput) otpCombinedInput.value = combined;
        });

        box.addEventListener('keydown', (e) => {
            // Backspace: move to previous box
            if(e.key === 'Backspace' && !box.value && index > 0) {
                otpBoxes[index - 1].focus();
            }
        });

        box.addEventListener('focus', (e) => {
            e.target.select();
        });
    });

    if(otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const combined = Array.from(otpBoxes).map(b => b.value).join('');
            
            // Validate all 6 digits entered
            if(combined.length !== 6) {
                showAuthMessage('Please enter all 6 digits', 'error');
                return;
            }

            const formData = new FormData(otpForm);
            const data = Object.fromEntries(formData.entries());
            data.otp = combined;
            const endpoint = '/auth/verify-otp';

            showAuthMessage('');
            const submitButton = otpForm.querySelector('button[type="submit"]');
            if(submitButton) submitButton.disabled = true;

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const responseData = await readResponseData(response);
                const message = responseData.message || responseData.error || '';

                if(response.ok) {
                    if(timerInterval) clearInterval(timerInterval);
                    showAuthMessage(message || 'Verification successful', 'success');
                    // Move to name step
                    populateNameTemplate(data.email || signupEmail);
                    return;
                }

                showAuthMessage(message || 'OTP verification failed', 'error');
                // Clear boxes on failed verification
                otpBoxes.forEach(b => b.value = '');
                otpBoxes[0].focus();
            } catch (err) {
                showAuthMessage('Unable to verify OTP right now. Please try again.', 'error');
            } finally {
                if(submitButton) submitButton.disabled = false;
            }
        });
    }

    if(resendLink) {
        resendLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Prevent resend if timer is still running
            if(resendCountdown > 0) {
                return;
            }

            // Call resend endpoint
            try {
                const resp = await fetch('/auth/signup/resend-otp', {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify({ email: signupEmail, resend: true })
                });
                const rd = await readResponseData(resp);
                showAuthMessage(rd.message || 'OTP resent', resp.ok ? 'success' : 'error');
                // Clear boxes and restart timer on successful resend
                if(resp.ok) {
                    otpBoxes.forEach(b => b.value = '');
                    otpBoxes[0].focus();
                    startTimer();
                }
            } catch (err) {
                showAuthMessage('Unable to resend OTP right now.', 'error');
            }
        });
    }

    if(backToRegisterButton) {
        backToRegisterButton.addEventListener('click', (e) => {
            e.preventDefault();
            if(timerInterval) {
                clearInterval(timerInterval);
            }
            pendingRegisterEmail = signupEmail || document.querySelector('#otpEmailInput')?.value || '';
            populateRegister();
        });
    }
}

function initialiseNamePage() {
    const nameForm = document.querySelector('.name-form');

    if(nameForm) {
        nameForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(nameForm);
            const data = Object.fromEntries(formData.entries());
            const endpoint = nameForm.dataset.endpoint || '/auth/complete-profile';
            const successRedirect = nameForm.dataset.successRedirect || '/user/dashboard';

            showAuthMessage('');
            const submitButton = nameForm.querySelector('button[type="submit"]');
            if(submitButton) submitButton.disabled = true;

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const responseData = await readResponseData(response);
                const message = responseData.message || responseData.error || '';

                if(response.ok) {
                    showAuthMessage(message || 'Profile completed', 'success');
                    // redirect to dashboard
                    window.location.replace(responseData.redirectUrl || successRedirect);
                    return;
                }

                showAuthMessage(message || 'Could not complete profile', 'error');
            } catch (err) {
                showAuthMessage('Unable to complete profile right now. Please try again.', 'error');
            } finally {
                if(submitButton) submitButton.disabled = false;
            }
        });
    }
}