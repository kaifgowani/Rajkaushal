document.addEventListener('DOMContentLoaded', () => {
    // ─── UI & SIDEBAR LOGIC ──────────────────────────────────────────
    document.querySelectorAll('#sidebar .side-menu.top li a').forEach(item => {
        const li = item.parentElement;
        item.addEventListener('click', () => {
            document.querySelectorAll('#sidebar .side-menu.top li').forEach(i => {
                i.classList.remove('active');
            });
            li.classList.add('active');
        });
    });

    const menuBar = document.querySelector('#content nav .bx.bx-menu');
    const sidebar = document.getElementById('sidebar');
    if (menuBar && sidebar) {
        menuBar.addEventListener('click', () => {
            sidebar.classList.toggle('hide');
        });
    }

    const searchButton = document.querySelector('#content nav form .search-btn');
    const searchForm = document.querySelector('#content nav form');
    if (searchButton && searchForm) {
        const searchButtonIcon = searchButton.querySelector('.bx');
        searchButton.addEventListener('click', function (e) {
            if (window.innerWidth < 576) {
                e.preventDefault();
                searchForm.classList.toggle('show');
                searchButtonIcon.classList.toggle('bx-x');
                searchButtonIcon.classList.toggle('bx-search');
            }
        });

        function adjustLayout() {
            if (window.innerWidth < 768) {
                sidebar.classList.add('hide');
            } else {
                sidebar.classList.remove('hide');
                searchButtonIcon.classList.replace('bx-x', 'bx-search');
                searchForm.classList.remove('show');
            }
        }
        window.addEventListener('resize', adjustLayout);
        adjustLayout();
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
        switchMode.addEventListener('change', () => {
            setDarkMode(switchMode.checked);
        });
    }

    // ─── DYNAMIC API LOGIC: COUNSELLING ──────────────────────────────
    const bookingForm = document.getElementById('booking-form'); // Ensure this ID matches your EJS
    const scheduleContainer = document.getElementById('schedule-container') || document.getElementById('applicationList'); 

    async function loadSessions() {
        if (!scheduleContainer) return;
        try {
            const res = await fetch('/api/counselling/my-sessions');
            const sessions = await res.json();
            
            if (sessions.length === 0) {
                scheduleContainer.innerHTML = `<li class="list-group-item text-muted">No sessions scheduled yet.</li>`;
                return;
            }

            scheduleContainer.innerHTML = '';
            sessions.forEach(session => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.innerHTML = `
                    <strong>${session.type}</strong> with ${session.counsellorName} <br>
                    <small>${new Date(session.date).toLocaleDateString()} at ${session.timeSlot}</small>
                    <span class="badge bg-${session.status === 'Scheduled' ? 'warning' : 'success'} float-end">${session.status}</span>
                `;
                scheduleContainer.appendChild(li);
            });
        } catch (err) {
            console.error('Error loading sessions:', err);
        }
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                // Adjust these IDs to match your specific form inputs
                counsellorName: document.getElementById('counsellor')?.value || 'Assigned Counsellor',
                type: document.getElementById('session-type')?.value || 'Career Guidance',
                date: document.getElementById('session-date')?.value || new Date().toISOString().split('T')[0],
                timeSlot: document.getElementById('time-slot')?.value || '10:00 AM'
            };

            try {
                const res = await fetch('/api/counselling/book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();

                if (data.success) {
                    alert('Session Booked Successfully!');
                    bookingForm.reset();
                    loadSessions();
                } else {
                    alert('Failed to book session: ' + data.error);
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    loadSessions();
});
