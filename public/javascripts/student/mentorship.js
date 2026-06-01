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

    // ─── DYNAMIC API LOGIC: MENTORSHIP ───────────────────────────────
    const mentorshipList = document.getElementById('mentorshipList');
    const enrollForm = document.getElementById('enrollForm');

    async function loadMentorships() {
        if (!mentorshipList) return;
        try {
            const res = await fetch('/api/mentorship/my-programs');
            const programs = await res.json();
            
            mentorshipList.innerHTML = '';
            if (programs.length === 0) {
                mentorshipList.innerHTML = `<li class="list-group-item text-muted">You are not currently enrolled in any mentorship tracks.</li>`;
                return;
            }

            programs.forEach(p => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.innerHTML = `<strong>${p.mentorName}</strong> - Domain: ${p.domain} <br>
                                <small>Status: ${p.status} | Progress: ${p.progress}%</small>`;
                mentorshipList.appendChild(li);
            });
        } catch (err) {
            console.error('Error loading mentorships:', err);
        }
    }

    if (enrollForm) {
        enrollForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const mentorSelect = document.getElementById('mentorSelect');
            if(!mentorSelect) return;

            const formData = {
                mentorName: mentorSelect.value,
                domain: 'General Career Mentorship' // Or grab this from a form field
            };

            try {
                const res = await fetch('/api/mentorship/enroll', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();

                if (data.success) {
                    alert('Successfully requested enrollment!');
                    loadMentorships();
                    this.reset();
                } else {
                    alert('Failed to enroll.');
                }
            } catch(err) {
                console.error(err);
            }
        });
    }

    loadMentorships();
});