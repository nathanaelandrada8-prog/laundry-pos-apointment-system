const sidebar = document.getElementById('sidebar');
const contentArea = document.getElementById('content-area');
const toggleButton = document.getElementById('sidebar-toggle');
const logoFull = document.getElementById('logo-full');
const logoIcon = document.getElementById('logo-icon');

sidebar.style.width = '16rem';
contentArea.style.marginLeft = '16rem';

toggleButton.addEventListener('click', () => {
    if (sidebar.classList.contains('minimized')) {
        sidebar.classList.remove('minimized');
        sidebar.style.width = '16rem';
        contentArea.style.marginLeft = '16rem';
        logoFull.classList.remove('hidden');
        logoIcon.classList.add('hidden');
    } else {
        sidebar.classList.add('minimized');
        sidebar.style.width = '4rem';
        contentArea.style.marginLeft = '4rem';
        logoFull.classList.add('hidden');
        logoIcon.classList.remove('hidden');
    }
});