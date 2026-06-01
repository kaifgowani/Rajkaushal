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

// APPLICATION DATA
let allApplications = [];

document.addEventListener('DOMContentLoaded', function () {
	loadApplications();
});

function loadApplications() {
	fetch('/api/applications/me')
		.then(res => res.json())
		.then(applications => {
			allApplications = applications;
			renderApplicationList(applications);
			renderInterviewSchedule(applications);
			renderStatusUpdates(applications);
		})
		.catch(() => {
			document.getElementById('applicationList').innerHTML =
				'<li class="list-group-item text-danger">Failed to load applications.</li>';
		});
}

function renderApplicationList(applications) {
	const applicationList = document.getElementById('applicationList');
	applicationList.innerHTML = '';

	if (!applications.length) {
		applicationList.innerHTML = '<li class="list-group-item text-muted">No applications yet. <a href="/student/job_search">Search for jobs</a>.</li>';
		return;
	}

	applications.forEach(app => {
		const job = app.job || {};
		const listItem = document.createElement('li');
		listItem.className = 'list-group-item';
		listItem.dataset.status = (app.status || '').toLowerCase();
		listItem.innerHTML = `
			<div>
				<h5>${job.title || 'Unknown Job'}</h5>
				<p class="mb-1">${job.company || '—'}</p>
				<p class="mb-1">Status: <strong>${app.status || 'Applied'}</strong></p>
				<p class="mb-1 text-muted small">Applied: ${new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</p>
				<button class="btn btn-primary btn-sm" onclick="viewApplicationDetails('${app._id}')">View Details</button>
			</div>
		`;
		applicationList.appendChild(listItem);
	});
}

function filterApplications() {
	const statusFilter = document.getElementById('statusFilter').value.toLowerCase();
	const items = document.querySelectorAll('#applicationList .list-group-item');
	items.forEach(item => {
		if (statusFilter === 'all' || item.dataset.status === statusFilter) {
			item.style.display = '';
		} else {
			item.style.display = 'none';
		}
	});
}

function viewApplicationDetails(appId) {
	const app = allApplications.find(a => a._id === appId);
	const modalDetailsContent = document.getElementById('modalDetailsContent');
	if (!app) {
		modalDetailsContent.innerHTML = '<p>Details not found.</p>';
	} else {
		const job = app.job || {};
		modalDetailsContent.innerHTML = `
			<h5>${job.title || 'Unknown Job'}</h5>
			<p><strong>Company:</strong> ${job.company || '—'}</p>
			<p><strong>Location:</strong> ${job.location || '—'}</p>
			${job.description ? `<p><strong>Description:</strong> ${job.description}</p>` : ''}
			<p><strong>Status:</strong> ${app.status || 'Applied'}</p>
			<p><strong>Applied On:</strong> ${new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</p>
		`;
	}
	const modal = new bootstrap.Modal(document.getElementById('applicationModal'));
	modal.show();
}

function renderInterviewSchedule(applications) {
	const interviewSchedule = document.getElementById('interviewSchedule');
	interviewSchedule.innerHTML = '';

	const interviews = applications.filter(app =>
		app.status && app.status.toLowerCase() === 'interview scheduled'
	);

	if (!interviews.length) {
		interviewSchedule.innerHTML = '<li class="list-group-item text-muted">No interviews scheduled.</li>';
		return;
	}

	interviews.forEach(app => {
		const job = app.job || {};
		const listItem = document.createElement('li');
		listItem.className = 'list-group-item';
		listItem.innerHTML = `
			<div>
				<h5>${job.title || 'Unknown Job'}</h5>
				<p>${job.company || '—'}</p>
				<p class="text-muted small">Applied: ${new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</p>
			</div>
		`;
		interviewSchedule.appendChild(listItem);
	});
}

function renderStatusUpdates(applications) {
	const statusUpdates = document.getElementById('statusUpdates');
	statusUpdates.innerHTML = '';

	if (!applications.length) {
		statusUpdates.innerHTML = '<p class="text-muted">No status updates.</p>';
		return;
	}

	applications.forEach(app => {
		const job = app.job || {};
		const updateItem = document.createElement('div');
		updateItem.className = 'alert alert-info';
		updateItem.innerHTML = `
			<strong>${job.title || 'Job'}</strong> at ${job.company || '—'}
			<p class="mb-0">Status: ${app.status || 'Applied'}</p>
		`;
		statusUpdates.appendChild(updateItem);
	});
}
