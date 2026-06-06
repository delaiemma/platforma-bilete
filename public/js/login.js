document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const createAccountLink = document.querySelector('.create-account-link');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log('🔐 Login attempt:', { email, password: '***' });

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }

        const connectBtn = document.querySelector('.connect-btn');
        const originalText = connectBtn.textContent;

        connectBtn.textContent = 'Connecting...';
        connectBtn.disabled = true;

        fetch('/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('userSession', JSON.stringify({
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        role: data.user.role
                    }));

                    alert(`✅ Welcome ${data.user.name || data.user.email}! Login successful!`);
                    window.location.href = '/';
                } else {
                    alert(`❌ ${data.message}`);
                    connectBtn.textContent = originalText;
                    connectBtn.disabled = false;
                }
            })
            .catch(error => {
                alert('❌ Connection error. Please try again.');
                connectBtn.textContent = originalText;
                connectBtn.disabled = false;
            });
    });

    createAccountLink.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '/signup.html';
    });

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function () {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
});