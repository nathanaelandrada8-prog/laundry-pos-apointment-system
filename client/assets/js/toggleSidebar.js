document.addEventListener('DOMContentLoaded', ()=> {
    const sidebar = document.getElementById('sidebar');
    const togglebutton = document.getElementById('sidebar-toggle');

    togglebutton.addEventListener('click', ()=> {
        sidebar.classList.toggle('min');
    })
})