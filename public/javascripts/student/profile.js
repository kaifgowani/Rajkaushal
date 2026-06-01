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

// PROFILE MANAGEMENT
document.addEventListener('DOMContentLoaded', function () {
	const editBtn = document.getElementById('editBtn');
	const authModal = new bootstrap.Modal(document.getElementById('authModal'));
	const authConfirmBtn = document.getElementById('authConfirmBtn');
	const passwordInput = document.getElementById('passwordInput');
	const passwordError = document.getElementById('passwordError');

	// Load profile data from API
	fetch('/api/user/me')
		.then(res => res.json())
		.then(user => {
			document.getElementById('fullName').value = user.name || '';
			document.getElementById('email').value = user.email || '';
			document.getElementById('phoneNumber').value = user.phone || '';
			document.getElementById('dob').value = user.dob ? user.dob.substring(0, 10) : '';
			document.getElementById('qualification').value = user.qualification || '';
			document.getElementById('fieldOfStudy').value = user.fieldOfStudy || '';
			document.getElementById('university').value = user.university || '';
			document.getElementById('graduationYear').value = user.graduationYear || '';
			document.getElementById('employmentStatus').value = user.employmentStatus || '';
			document.getElementById('jobTitle').value = user.jobTitle || '';
			document.getElementById('experienceYears').value = user.experienceYears || '';
			document.getElementById('industryPreference').value = user.industryPreference || '';
			document.getElementById('jobLocation').value = user.jobLocation || '';
			document.getElementById('linkedinUrl').value = user.linkedinUrl || '';
			document.getElementById('jobAlerts').value = user.jobAlerts || 'Weekly';
		})
		.catch(() => console.error('Failed to load profile'));

	// Edit button — verify password first
	editBtn.addEventListener('click', () => {
		passwordInput.value = '';
		passwordError.style.display = 'none';
		authModal.show();
	});

	// Confirm password via API
	authConfirmBtn.addEventListener('click', () => {
		const enteredPassword = passwordInput.value;
		if (!enteredPassword) {
			passwordError.textContent = 'Please enter your password.';
			passwordError.style.display = 'block';
			return;
		}

		fetch('/api/user/verify-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password: enteredPassword })
		})
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					authModal.hide();
					toggleFormFields(true);
				} else {
					passwordError.textContent = 'Incorrect password, please try again.';
					passwordError.style.display = 'block';
				}
			})
			.catch(() => {
				passwordError.textContent = 'Error verifying password. Try again.';
				passwordError.style.display = 'block';
			});
	});

	function toggleFormFields(enabled) {
		document.querySelectorAll('input, select, textarea').forEach(field => {
			field.disabled = !enabled;
		});
		document.querySelectorAll('button[id$="Btn"]:not(#editBtn):not(#authConfirmBtn)').forEach(btn => {
			btn.disabled = !enabled;
		});
	}

	// Save handlers for each section
	function saveSection(formId, btnId, fields) {
		document.getElementById(btnId).addEventListener('click', function () {
			const payload = {};
			fields.forEach(f => {
				const el = document.getElementById(f.id);
				if (el) payload[f.key] = el.value;
			});

			fetch('/api/user/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
				.then(res => res.json())
				.then(data => {
					if (data.success || data.user) {
						showToast('Saved successfully!', 'success');
					} else {
						showToast(data.error || 'Failed to save.', 'danger');
					}
				})
				.catch(() => showToast('Network error. Try again.', 'danger'));
		});
	}

	saveSection('personalInfoForm', 'updatePersonalInfoBtn', [
		{ id: 'fullName', key: 'name' },
		{ id: 'email', key: 'email' },
		{ id: 'phoneNumber', key: 'phone' },
		{ id: 'dob', key: 'dob' }
	]);

	saveSection('educationDetailsForm', 'updateEducationBtn', [
		{ id: 'qualification', key: 'qualification' },
		{ id: 'fieldOfStudy', key: 'fieldOfStudy' },
		{ id: 'university', key: 'university' },
		{ id: 'graduationYear', key: 'graduationYear' }
	]);

	saveSection('experienceDetailsForm', 'updateExperienceBtn', [
		{ id: 'employmentStatus', key: 'employmentStatus' },
		{ id: 'jobTitle', key: 'jobTitle' },
		{ id: 'experienceYears', key: 'experienceYears' },
		{ id: 'industryPreference', key: 'industryPreference' }
	]);

	saveSection('additionalDetailsForm', 'updateAdditionalDetailsBtn', [
		{ id: 'jobLocation', key: 'jobLocation' },
		{ id: 'linkedinUrl', key: 'linkedinUrl' },
		{ id: 'jobAlerts', key: 'jobAlerts' }
	]);
});

// Simple toast notification
function showToast(message, type) {
	let toast = document.getElementById('profile-toast');
	if (!toast) {
		toast = document.createElement('div');
		toast.id = 'profile-toast';
		toast.style.cssText = 'position:fixed;bottom:1rem;right:1rem;z-index:9999;min-width:220px;';
		document.body.appendChild(toast);
	}
	toast.innerHTML = `<div class="alert alert-${type} shadow">${message}</div>`;
	setTimeout(() => { toast.innerHTML = ''; }, 3000);
}
