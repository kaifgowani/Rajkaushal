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

// JOB SEARCH
document.addEventListener('DOMContentLoaded', function () {
	// Load all jobs on page load
	fetchJobListings();

	document.getElementById('search-btn').addEventListener('click', function () {
		fetchJobListings();
	});

	function fetchJobListings() {
		const keyword = document.getElementById('search-keyword').value.trim();
		const location = document.getElementById('search-location').value.trim();
		const jobType = document.getElementById('search-job-type').value;
		const salary = document.getElementById('filter-salary').value.trim();
		const company = document.getElementById('filter-company').value.trim();
		const industry = document.getElementById('filter-industry').value.trim();
		const skills = document.getElementById('filter-skills').value.trim();

		// Build query string
		const params = new URLSearchParams();
		if (keyword) params.append('keyword', keyword);
		if (location) params.append('location', location);
		if (jobType) params.append('type', jobType);
		if (salary) params.append('salary', salary);
		if (company) params.append('company', company);
		if (industry) params.append('industry', industry);
		if (skills) params.append('skills', skills);

		const jobList = document.getElementById('job-listings');
		jobList.innerHTML = '<p class="text-muted">Loading jobs...</p>';

		fetch('/api/jobs?' + params.toString())
			.then(res => res.json())
			.then(jobs => {
				jobList.innerHTML = '';

				if (!jobs.length) {
					jobList.innerHTML = '<p class="text-muted">No jobs found. Try different filters.</p>';
					return;
				}

				jobs.forEach(job => {
					const jobItem = document.createElement('div');
					jobItem.className = 'job-item card mb-3 p-3';
					jobItem.innerHTML = `
						<h5>${job.title}</h5>
						<p class="mb-1"><strong>${job.company}</strong> — ${job.location}</p>
						<p class="mb-1">Type: ${job.type || 'N/A'} | Sector: ${job.sector || 'N/A'}</p>
						${job.salary ? `<p class="mb-1">Salary: ${job.salary}</p>` : ''}
						${job.description ? `<p class="text-muted small mb-2">${job.description}</p>` : ''}
						<button class="btn btn-primary btn-sm apply-btn" data-id="${job._id}">Apply Now</button>
						<span class="apply-msg ms-2 text-success" style="display:none;"></span>
					`;
					jobList.appendChild(jobItem);
				});

				// Attach apply button listeners
				document.querySelectorAll('.apply-btn').forEach(btn => {
					btn.addEventListener('click', function () {
						const jobId = this.getAttribute('data-id');
						const msgEl = this.nextElementSibling;
						this.disabled = true;
						this.textContent = 'Applying...';

						fetch('/api/apply', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ jobId })
						})
							.then(res => res.json())
							.then(data => {
								if (data.message) {
									msgEl.textContent = data.message;
									msgEl.style.display = 'inline';
									this.textContent = 'Applied';
								} else if (data.error) {
									msgEl.textContent = data.error;
									msgEl.classList.replace('text-success', 'text-danger');
									msgEl.style.display = 'inline';
									this.disabled = false;
									this.textContent = 'Apply Now';
								}
							})
							.catch(() => {
								msgEl.textContent = 'Failed to apply. Try again.';
								msgEl.classList.replace('text-success', 'text-danger');
								msgEl.style.display = 'inline';
								this.disabled = false;
								this.textContent = 'Apply Now';
							});
					});
				});
			})
			.catch(() => {
				jobList.innerHTML = '<p class="text-danger">Failed to load jobs. Please try again.</p>';
			});
	}
});
