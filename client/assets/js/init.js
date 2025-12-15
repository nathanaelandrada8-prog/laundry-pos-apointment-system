document.addEventListener('DOMContentLoaded', () => {
    // --- Message Box Elements ---
    const loginMessageBox = document.getElementById('login-message-box');
    const signupMessageBox = document.getElementById('signup-message-box');

    // --- Form & Button Elements (Ensure these IDs match your HTML) ---
    const loginForm = document.querySelector('#login-modal form'); 
    const loginButton = document.querySelector('#login-modal .sign-in-btn');
    const loginEmail = document.querySelector('#login-modal input[type="email"]');
    const loginPassword = document.querySelector('#login-modal input[type="password"]');

    const signupForm = document.querySelector('#signup-modal form');
    const signupButton = document.querySelector('#signup-modal .sign-in-btn');
    const signupEmail = document.querySelector('#signup-modal input[type="email"]');
    const signupPassword = document.querySelector('#signup-modal input[type="password"]');
    const signupFName = document.querySelector('#signup-modal input[placeholder="First Name"]'); 
    const signupLName = document.querySelector('#signup-modal input[placeholder="Last Name"]'); 

    // function to display messages in the correct box
    function displayMessage(targetBox, message, isSuccess = false) {
        if (!targetBox) return; // Safety check

        targetBox.textContent = message;
        targetBox.classList.remove('success', 'error');

        if (isSuccess) {
            targetBox.classList.add('success');
            targetBox.style.display = 'block';
        } else {
            targetBox.classList.add('error');
            targetBox.style.display = 'block';
        }
        
        // Hide the message after a few seconds
        setTimeout(() => {
            targetBox.style.display = 'none';
        }, 5000);
    }

    // --- LOGIN HANDLER ---
    if (loginForm && loginButton) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (loginMessageBox) loginMessageBox.style.display = 'none';
            loginButton.disabled = true;
            loginButton.textContent = 'Authenticating...';

            const email = loginEmail.value;
            const password = loginPassword.value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    displayMessage(loginMessageBox, data.message || 'Login successful!', true);
                    if (data.redirectTo) {
                        setTimeout(() => { window.location.href = data.redirectTo; }, 1500);
                    }
                } else {
                    const errorMessage = data.message || 'Invalid credentials or network issue.';
                    displayMessage(loginMessageBox, errorMessage, false);
                }

            } catch (error) {
                displayMessage(loginMessageBox, 'Network error: Could not connect to the server.', false);
            } finally {
                loginButton.disabled = false;
                loginButton.textContent = 'Sign In';
            }
        });
    }


    // --- SIGNUP HANDLER ---
    if (signupForm && signupButton) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (signupMessageBox) signupMessageBox.style.display = 'none';
            signupButton.disabled = true;
            signupButton.textContent = 'Registering...';

            const fname = signupFName.value;
            const lname = signupLName.value;
            console.log(fname, lname);
            const email = signupEmail.value;
            const password = signupPassword.value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fname, lname, email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    displayMessage(signupMessageBox, data.message || 'Registration successful!', true);
                    if (data.redirectTo) {
                        setTimeout(() => { window.location.href = data.redirectTo; }, 1500);
                    }
                } else {
                    const errorMessage = data.message || 'An error occurred during registration.';
                    displayMessage(signupMessageBox, errorMessage, false);
                }

            } catch (error) {
                displayMessage(signupMessageBox, 'Network error: Could not connect to the server.', false);
            } finally {
                signupButton.disabled = false;
                signupButton.textContent = 'Sign Up';
            }
        });
    }
});