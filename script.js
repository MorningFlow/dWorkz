// script.js

document.addEventListener("DOMContentLoaded", () => {
  const jobContainer = document.getElementById("jobContainer");
  const searchInput = document.getElementById("searchInput");
  const typeFilter = document.getElementById("typeFilter");
  const locationFilter = document.getElementById("locationFilter");
  const jobModal = document.getElementById("jobModal");
  const closeModalButton = document.getElementById("closeModal");

  let allJobs = [];

  fetch("admin/data.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
      allJobs = data.jobs_list || []; // Get the array
      allJobs.reverse(); // <-- ADD THIS LINE to reverse the array
      displayJobs(allJobs); // Now display the reversed array
  })
    .catch((error) => {
        console.error("Error fetching job data:", error);
        jobContainer.innerHTML = `<p class="text-red-500 text-center col-span-full">Could not load job data. ${error.message}</p>`;
    });

  // --- Display Jobs Function ---
  function displayJobs(jobsToDisplay) {
    jobContainer.innerHTML = ""; // Clear previous listings

    if (jobsToDisplay.length === 0) {
        jobContainer.innerHTML = `<p class="text-gray-500 text-center col-span-full">No jobs found matching your criteria.</p>`;
        return;
    }
    jobsToDisplay.forEach((job, index) => {
        const cardDiv = document.createElement("div");
        // Base classes (ensure cursor-pointer is included if needed)
        cardDiv.className = "bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between cursor-pointer";

        // ... (code to set formattedDeadline, icons, cardDiv.innerHTML) ...
        const deadlineDate = new Date(job.deadline);
        const formattedDeadline = deadlineDate.toLocaleDateString("en-GB", {
            day: 'numeric', month: 'short', year: 'numeric'
        });
        const locationIcon = '📍';
        const deadlineIcon = '📅';
        const typeIcon = '💼';

        cardDiv.innerHTML = `
            <div>
                <h3 class="text-lg font-semibold mb-1">${job.title}</h3>
                <p class="text-sm text-gray-700 mb-3">${job.company}</p>
                <p class="text-sm text-gray-600 mb-1 flex items-center">${locationIcon}&nbsp;${job.location || 'N/A'}</p>
                <p class="text-sm text-gray-600 mb-1 flex items-center">${deadlineIcon}&nbsp;Deadline: ${formattedDeadline || 'N/A'}</p>
                <p class="text-sm text-gray-600 flex items-center">${typeIcon}&nbsp;${job.type || 'N/A'}</p>
            </div>
            <div class="mt-4 text-right">
               <span class="text-purple-600 text-sm font-medium hover:underline">View Details</span>
            </div>
        `;


        cardDiv.dataset.jobIndex = index;

        // ***** Add these lines for the animation *****
        // 1. Calculate staggered delay based on the card's index
        const animationDelay = index * 0.08; // Adjust 0.08s for faster/slower stagger
        cardDiv.style.animationDelay = `${animationDelay}s`;

        // 2. Add the CSS class to trigger the animation
        cardDiv.classList.add('job-card-entry-animation');
        // *********************************************

        cardDiv.addEventListener('click', () => {
            const clickedJob = allJobs[parseInt(cardDiv.dataset.jobIndex)];
            openModal(clickedJob);
        });

        jobContainer.appendChild(cardDiv);
    });
}

  function openModal(job) {
      document.getElementById('modalTitle').textContent = job.title || 'N/A';
      document.getElementById('modalCompany').textContent = job.company || 'N/A';
      document.getElementById('modalLocation').textContent = job.location || 'N/A';
      document.getElementById('modalType').textContent = job.type || 'N/A';
      document.getElementById('modalDeadline').textContent = `Deadline: ${job.deadline ? new Date(job.deadline).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}`;

      const descriptionElement = document.getElementById('modalDescription');
      descriptionElement.innerHTML = '';
      descriptionElement.innerHTML = job.description || 'No description available.';

      const applyButton = jobModal.querySelector('button.bg-purple-500');
      const applyInfoDiv = document.getElementById('modalApplyInfo');
      applyInfoDiv.innerHTML = '';

      if (job.url) {
          applyButton.onclick = () => window.open(job.url, '_blank');
          applyButton.textContent = 'Apply Now';
          applyButton.disabled = false;
      } else {
          applyButton.textContent = 'Apply Now';
          applyButton.disabled = true;
          applyInfoDiv.textContent = "Application instructions not available via direct link.";
      }

      jobModal.classList.remove('hidden');
      jobModal.classList.add('flex');
  }

  function closeModal() {
      jobModal.classList.add('hidden');
      jobModal.classList.remove('flex');
  }

  function filterJobs() {
      const searchTerm = searchInput.value.toLowerCase();
      const selectedType = typeFilter.value;
      const locationTerm = locationFilter.value.toLowerCase();

      const filteredJobs = allJobs.filter(job => {
          const jobTitle = (job.title || '').toLowerCase();
          const jobCompany = (job.company || '').toLowerCase();
          const jobDescription = (job.description || '').toLowerCase();
          const jobLocation = (job.location || '').toLowerCase();
          const jobType = (job.type || '');

          const matchesSearch = searchTerm === '' ||
                                jobTitle.includes(searchTerm) ||
                                jobCompany.includes(searchTerm) ||
                                jobDescription.includes(searchTerm);

          const matchesType = selectedType === '' || jobType === selectedType;

          const matchesLocation = locationTerm === '' || jobLocation.includes(locationTerm);

          return matchesSearch && matchesType && matchesLocation;
      });

      displayJobs(filteredJobs);
  }

  searchInput.addEventListener('input', filterJobs);
  typeFilter.addEventListener('change', filterJobs);
  locationFilter.addEventListener('input', filterJobs);
  closeModalButton.addEventListener('click', closeModal);

  jobModal.addEventListener('click', (event) => {
      if (event.target === jobModal) {
          closeModal();
      }
  });

});