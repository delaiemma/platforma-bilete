document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signupForm');
    const backToLoginLink = document.querySelector('.back-to-login-link');

    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;

        const formData = {
            name: `${firstName} ${lastName}`.trim(),
            phoneNumber: document.getElementById('phoneNumber').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            email: document.getElementById('signupEmail').value,
            password: document.getElementById('signupPassword').value
        };

        if (!firstName || !lastName || !formData.email || !formData.password) {
            alert('Please fill in all required fields');
            return;
        }

        if (!formData.email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }

        if (formData.password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        if (formData.dateOfBirth) {
            const birthDate = new Date(formData.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
        }

        const continueBtn = document.querySelector('.continue-btn');
        const originalText = continueBtn.textContent;

        continueBtn.textContent = 'Creating Account...';
        continueBtn.disabled = true;

        fetch('/api/user/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`✅ Welcome ${data.user.name}! Account created successfully!`);
                    window.location.href = '/login.html';
                } else {
                    alert(`❌ ${data.message}`);
                    continueBtn.textContent = originalText;
                    continueBtn.disabled = false;
                }
            })
            .catch(error => {
                alert('❌ Connection error. Please try again.');
                continueBtn.textContent = originalText;
                continueBtn.disabled = false;
            });
    });

    backToLoginLink.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '/login.html';
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