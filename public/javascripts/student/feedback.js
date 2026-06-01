document.addEventListener('DOMContentLoaded', () => {
    // ─── UI & SIDEBAR LOGIC ──────────────────────────────────────────
    const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');
    allSideMenu.forEach(item=> {
        const li = item.parentElement;
        item.addEventListener('click', function () {
            allSideMenu.forEach(i=> {
                i.parentElement.classList.remove('active');
            });
            li.classList.add('active');
        });
    });

    const menuBar = document.querySelector('#content nav .bx.bx-menu');
    const sidebar = document.getElementById('sidebar');
    if(menuBar && sidebar) {
        menuBar.addEventListener('click', function () {
            sidebar.classList.toggle('hide');
        });
    }

    const switchMode = document.getElementById('switch-mode');
    if (switchMode) {
        function setDarkMode(enabled) {
            if (enabled) {
                document.body.classList.add('dark');
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.body.classList.remove('dark');
                localStorage.setItem('darkMode', 'disabled');
            }
        }
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'enabled') {
            switchMode.checked = true;
            setDarkMode(true);
        } else {
            switchMode.checked = false;
            setDarkMode(false);
        }
        switchMode.addEventListener('change', function () {
            setDarkMode(this.checked);
        });
    }

    // ─── DYNAMIC API LOGIC: FEEDBACK ─────────────────────────────────
    // If your feedback page uses an ID like 'feedbackForm' or 'portal-feedback-form'
    const feedbackForm = document.getElementById('feedbackForm') || document.getElementById('portal-feedback-form');

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Checking common IDs based on your previous code snippet
            const ratingEl = document.getElementById('feedbackRating') || document.getElementById('feedback-rating');
            const commentsEl = document.getElementById('feedbackComments') || document.getElementById('feedback-comments');
            const categoryEl = document.getElementById('feedbackCategory') || document.getElementById('feedback-category');

            const formData = {
                category: categoryEl ? categoryEl.value : 'General',
                rating: ratingEl ? parseInt(ratingEl.value) : 5,
                comments: commentsEl ? commentsEl.value : ''
            };

            try {
                const res = await fetch('/api/feedback/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();

                if (data.success) {
                    alert('Thank you for your feedback! It has been securely saved.');
                    feedbackForm.reset();
                } else {
                    alert('Submission failed: ' + data.error);
                }
            } catch(err) {
                console.error('Error submitting feedback:', err);
                alert('A network error occurred.');
            }
        });
    }
});