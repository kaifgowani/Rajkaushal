// SIDEBAR ACTIVE STATE
const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');
allSideMenu.forEach(item => {
	const li = item.parentElement;
	item.addEventListener('click', function () {
		allSideMenu.forEach(i => i.parentElement.classList.remove('active'));
		li.classList.add('active');
	});
});

// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');
menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
});

const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');
searchButton.addEventListener('click', function (e) {
	if (window.innerWidth < 576) {
		e.preventDefault();
		searchForm.classList.toggle('show');
		if (searchForm.classList.contains('show')) {
			searchButtonIcon.classList.replace('bx-search', 'bx-x');
		} else {
			searchButtonIcon.classList.replace('bx-x', 'bx-search');
		}
	}
});
if (window.innerWidth < 768) {
	sidebar.classList.add('hide');
} else if (window.innerWidth > 576) {
	searchButtonIcon.classList.replace('bx-x', 'bx-search');
	searchForm.classList.remove('show');
}
window.addEventListener('resize', function () {
	if (this.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
});

// DARK MODE
document.addEventListener('DOMContentLoaded', function () {
	const switchMode = document.getElementById('switch-mode');
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
});

// LOAD USER DATA FROM API
document.addEventListener('DOMContentLoaded', function () {
	fetch('/api/user/me')
		.then(res => {
			if (!res.ok) throw new Error('Not logged in');
			return res.json();
		})
		.then(user => {
			document.getElementById('name').textContent = user.name || '—';
			document.getElementById('email').textContent = user.email || '—';
			document.getElementById('phone').textContent = user.phone || '—';
			document.getElementById('dob').textContent = user.dob || '—';
			document.getElementById('qualification').textContent = user.qualification || '—';
			document.getElementById('field_of_study').textContent = user.fieldOfStudy || '—';
			document.getElementById('university').textContent = user.university || '—';
			document.getElementById('graduation_year').textContent = user.graduationYear || '—';
			document.getElementById('employment_status').textContent = user.employmentStatus || '—';
			document.getElementById('job_title').textContent = user.jobTitle || '—';
			document.getElementById('experience_years').textContent = user.experienceYears || '—';
			document.getElementById('industry_preference').textContent = user.industryPreference || '—';
			document.getElementById('job_location').textContent = user.jobLocation || '—';
			document.getElementById('resume').textContent = user.resume || '—';
			document.getElementById('linkedin_url').textContent = user.linkedinUrl || '—';
			document.getElementById('job_alerts').textContent = user.jobAlerts || '—';
		})
		.catch(err => {
			console.error('Failed to load user data:', err);
			// Set all fields to error state
			const fields = ['name','email','phone','dob','qualification','field_of_study',
				'university','graduation_year','employment_status','job_title',
				'experience_years','industry_preference','job_location','resume',
				'linkedin_url','job_alerts'];
			fields.forEach(id => {
				const el = document.getElementById(id);
				if (el) el.textContent = '—';
			});
		});
});
