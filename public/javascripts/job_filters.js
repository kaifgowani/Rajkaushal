document.addEventListener('DOMContentLoaded', () => {
    // Make sure these IDs match the search inputs/selects on your listing.ejs page
    const searchInput = document.getElementById('search-input');
    const sectorFilter = document.getElementById('sector-filter');
    const typeFilter = document.getElementById('type-filter');
    const jobsContainer = document.getElementById('jobs-container') || document.querySelector('.row'); // Fallback to a generic row if no ID

    async function fetchFilteredJobs() {
        // Build the query string
        const q = searchInput ? searchInput.value : '';
        const sector = sectorFilter ? sectorFilter.value : '';
        const type = typeFilter ? typeFilter.value : '';

        const query = new URLSearchParams();
        if (q) query.append('q', q);
        if (sector) query.append('sector', sector);
        if (type) query.append('jobType', type);

        try {
            const res = await fetch(`/api/jobs?${query.toString()}`);
            const data = await res.json();

            if (data.success) {
                renderJobs(data.jobs);
            }
        } catch (err) {
            console.error('Failed to fetch jobs', err);
        }
    }

    function renderJobs(jobs) {
        if (!jobsContainer) return;
        
        if (jobs.length === 0) {
            jobsContainer.innerHTML = `<div class="col-12 text-center my-5"><h4 class="text-muted">No jobs found matching your criteria.</h4></div>`;
            return;
        }

        jobsContainer.innerHTML = jobs.map(job => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body">
                        <span class="badge bg-primary mb-2">${job.sector}</span>
                        <h5 class="card-title text-dark">${job.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted"><i class="bx bx-buildings"></i> ${job.company}</h6>
                        <p class="card-text text-muted small mt-3">${job.description.substring(0, 100)}...</p>
                        <ul class="list-unstyled small mb-0">
                            <li><i class="bx bx-map"></i> ${job.location}</li>
                            <li><i class="bx bx-briefcase"></i> ${job.jobType}</li>
                            <li><i class="bx bx-money"></i> ${job.salary || 'Not specified'}</li>
                        </ul>
                    </div>
                    <div class="card-footer bg-white border-0 pt-0">
                        <button class="btn btn-outline-primary w-100 apply-btn" data-id="${job._id}">Apply Now</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Re-attach apply button listeners
        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', applyForJob);
        });
    }

    async function applyForJob(e) {
        const jobId = e.target.getAttribute('data-id');
        try {
            const res = await fetch('/api/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId })
            });
            const data = await res.json();
            alert(data.message || data.error);
        } catch (err) {
            alert('Please login to apply for jobs.');
            window.location.href = '/login';
        }
    }

    // Attach event listeners to filters to trigger searches on change/typing
    if (searchInput) searchInput.addEventListener('input', debounce(fetchFilteredJobs, 500));
    if (sectorFilter) sectorFilter.addEventListener('change', fetchFilteredJobs);
    if (typeFilter) typeFilter.addEventListener('change', fetchFilteredJobs);

    // Helper: Debounce function so we don't spam the API on every keystroke
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
});
