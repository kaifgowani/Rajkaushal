document.addEventListener('DOMContentLoaded', () => {
    const jobForm = document.getElementById('employer-job-form');

    if (jobForm) {
        jobForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                title: document.getElementById('job-title').value,
                company: document.getElementById('job-company').value,
                location: document.getElementById('job-location').value,
                sector: document.getElementById('job-sector').value,
                jobType: document.getElementById('job-type').value,
                salary: document.getElementById('job-salary').value,
                vacancies: document.getElementById('job-vacancies').value,
                description: document.getElementById('job-description').value,
                requirements: document.getElementById('job-requirements').value,
                isActive: false // Forces admin approval
            };

            try {
                const res = await fetch('/api/employer/post-job', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();

                if (data.success) {
                    alert('Job posted successfully! It is now pending admin approval.');
                    jobForm.reset();
                } else {
                    alert('Failed to post job: ' + data.error);
                }
            } catch (err) {
                console.error(err);
                alert('A network error occurred.');
            }
        });
    }
});