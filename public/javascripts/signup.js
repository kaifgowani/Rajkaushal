document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form[action="/signup"]');
    if (!form) return;

    form.addEventListener('submit', function (event) {
        let isValid = true;

        const fullName = form.querySelector('[name="fullName"]');
        const email = form.querySelector('[name="email"]');
        const password = form.querySelector('[name="password"]');
        const mobile = form.querySelector('[name="mobile"]');
        const aadhar = form.querySelector('[name="aadhar"]');

        // Full Name
        if (!fullName.value.trim()) {
            fullName.classList.add('is-invalid');
            isValid = false;
        } else {
            fullName.classList.remove('is-invalid');
        }

        // Email
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email.value)) {
            email.classList.add('is-invalid');
            isValid = false;
        } else {
            email.classList.remove('is-invalid');
        }

        // Password
        if (password.value.trim().length < 6) {
            password.classList.add('is-invalid');
            isValid = false;
        } else {
            password.classList.remove('is-invalid');
        }

        // Mobile (optional but if filled must be 10 digits)
        if (mobile && mobile.value.trim() !== '') {
            if (!/^\d{10}$/.test(mobile.value.trim())) {
                mobile.classList.add('is-invalid');
                isValid = false;
            } else {
                mobile.classList.remove('is-invalid');
            }
        }

        // Aadhar (optional but if filled must be 12 digits)
        if (aadhar && aadhar.value.trim() !== '') {
            if (!/^\d{12}$/.test(aadhar.value.trim())) {
                aadhar.classList.add('is-invalid');
                isValid = false;
            } else {
                aadhar.classList.remove('is-invalid');
            }
        }

        // Only block submission if invalid
        if (!isValid) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // If valid, form submits normally to POST /signup
    });
});