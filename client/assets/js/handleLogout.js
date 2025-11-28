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