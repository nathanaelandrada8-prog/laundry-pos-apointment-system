async function handleLogout(event) {
    event.preventDefault();
    
    const link = event.currentTarget;
    const linkTextSpan = link.querySelector('.nav-link-text');
    const originalText = linkTextSpan ? linkTextSpan.textContent : 'Logout';
    
    if (linkTextSpan) {
        linkTextSpan.textContent = 'Logging out...';
    }

    try {
        const response = await fetch('/api/auth/logout');
        const data = await response.json();

        if (response.ok && data.redirectTo) {
            window.location.href = data.redirectTo;
        } else {
            console.error('Logout failed or server response was missing redirect info. Redirecting to login manually.');
            window.location.href = '/';
        }

    } catch (error) {
        console.error('Network error during logout:', error);
        window.location.href = '/';
    } finally {
        if (linkTextSpan) {
            linkTextSpan.textContent = originalText;
        }
    }
}

const modal = document.getElementById('logoutModal');
const userLogoutLink = document.getElementById('userLogoutLink');
const cancelBtn = document.getElementById('cancelLogout');
const confirmBtn = document.getElementById('confirmLogout');

function showLogoutModal(e) {
    e.preventDefault();
    modal.style.display = 'flex';
}

function hideLogoutModal() {
    modal.style.display = 'none';
}

if (userLogoutLink) {
    userLogoutLink.onclick = showLogoutModal; 
}
cancelBtn.addEventListener('click', hideLogoutModal);

confirmBtn.addEventListener('click', async () => {
    hideLogoutModal();
    
    const mockEvent = { 
        preventDefault: () => {}, 
        currentTarget: userLogoutLink 
    };
    await window.handleLogout(mockEvent); 
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideLogoutModal();
    }
});
