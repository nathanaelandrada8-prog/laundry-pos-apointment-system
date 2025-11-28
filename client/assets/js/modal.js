document.addEventListener('DOMContentLoaded', () => {
    // Buttons to open the login modal
    const openLoginNav = document.getElementById('open-login');
    const openLoginHero = document.getElementById('open-login-hero');
    
    // Modal containers
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');

    // Close buttons (on both modals)
    const closeButtons = document.querySelectorAll('.close-btn');

    // Buttons to switch between login and signup
    const slideToSignup = document.getElementById('slide-to-signup');
    const slideToLogin = document.getElementById('slide-to-back-login');

    // Function to open a modal
    function openModal(modal) {
        // Ensure both are closed first to prevent conflicts
        loginModal.classList.remove('active');
        signupModal.classList.remove('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Function to close all modals
    function closeModal() {
        loginModal.classList.remove('active');
        signupModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // 1. Open Login Modal from Nav and Hero
    openLoginNav.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
    });
    // Link the new Hero CTA button to open the login modal as well
    openLoginHero.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
    });

    // 2. Close Modal
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal();
        });
    });

    // Close modal when clicking the overlay (but not the box itself)
    loginModal.addEventListener('click', (e) => {
        if (e.target.id === 'login-modal') {
            closeModal();
        }
    });
    signupModal.addEventListener('click', (e) => {
        if (e.target.id === 'signup-modal') {
            closeModal();
        }
    });

    // 3. Switch to Signup Modal
    slideToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(signupModal);
    });

    // 4. Switch back to Login Modal
    slideToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
    });
});