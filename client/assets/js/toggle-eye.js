document.querySelectorAll('.password-group').forEach(group => {
    const input = group.querySelector('input');
    const eye = group.querySelector('.fa-eye');
    const eyeSlash = group.querySelector('.fa-eye-slash');

    group.querySelector('.eye-icon').addEventListener('click', () => {
        if (input.type === 'password') {
            input.type = 'text';
            eye.style.display = 'none';
            eyeSlash.style.display = 'block';
        } else {
            input.type = 'password';
            eye.style.display = 'block';
            eyeSlash.style.display = 'none';
        }
    });
});