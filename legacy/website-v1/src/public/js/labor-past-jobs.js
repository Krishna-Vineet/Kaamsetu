// Modal Functions
// Function to open the modal and populate it with job details
        function openJobDetailsModal(job) {
            document.getElementById('jobTitle').value = job.title;
            document.getElementById('clientName').value = job.client;
            document.getElementById('location').value = job.location || 'N/A';
            document.getElementById('completedDate').value = job.completedDate || 'N/A';
            document.getElementById('totalEarnings').value = job.earnings ? `₹ ${job.earnings.toLocaleString()}` : 'N/A';

            const modal = document.getElementById('jobDetailsModal');
            modal.style.display = 'block';
        }

        // Function to close the modal
        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.style.display = 'none';
        }


        document.addEventListener('DOMContentLoaded', async () => {
  const laborId = document.querySelector('#laborId').value;

  try {
    const response = await fetch(`/labor/past-jobs/${laborId}`);
    if (!response.ok) throw new Error('Failed to fetch past jobs');
    const data = await response.json();

    const completedJobsList = document.getElementById('completedJobs');
    const cancelledJobsList = document.getElementById('cancelledJobs');

    if (data.completedJobs.length === 0) {
      completedJobsList.innerHTML = '<p>No completed jobs found.</p>';
    } else {
      data.completedJobs.forEach(job => {
        const jobRow = document.createElement('tr');
        jobRow.innerHTML = `
          <td>${job.title}</td>
          <td>${job.client}</td>
          <td>${job.completedDate}</td>
          <td>₹ ${job.earnings}</td>
          <td><span class="status completed">${job.status}</span></td>
        `;
        completedJobsList.appendChild(jobRow);
      });
    }

    if (data.cancelledJobs.length === 0) {
      cancelledJobsList.innerHTML = '<p>No cancelled jobs found.</p>';
    } else {
      data.cancelledJobs.forEach(job => {
        const jobRow = document.createElement('tr');
        jobRow.innerHTML = `
          <td>${job.title}</td>
          <td>${job.cancellationDate}</td>
          <td>${job.reason}</td>
          <td><span class="status disputed">${job.status}</span></td>
        `;
        cancelledJobsList.appendChild(jobRow);
      });
    }
  } catch (error) {
    console.error('Error fetching past jobs:', error.message);
    alert('Failed to load past jobs. Please refresh the page.');
  }
});


// Close modal when clicking outside
window.onclick = function (event) {
  const modals = document.getElementsByClassName("modal");
  for (let modal of modals) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
};



// Sidebar Responsive Handling (Mobile and Desktop, matches profile page)
    const toggleBtn = document.querySelector(".toggle-sidebar");
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    const footer = document.querySelector(".footer");

    function isMobile() {
      return window.innerWidth <= 768;
    }

    toggleBtn.addEventListener("click", () => {
      if (isMobile()) {
        sidebar.classList.toggle("collapsed");
      } else {
        sidebar.classList.toggle("collapsed");
        mainContent.classList.toggle("expanded");
        footer.classList.toggle("expanded");
      }
    });

    function handleResize() {
      if (isMobile()) {
        sidebar.classList.add("collapsed");
        mainContent.classList.add("expanded");
        footer.classList.add("expanded");
        // Hide sidebar by default on mobile
      } else {
        sidebar.classList.remove("collapsed");
        mainContent.classList.remove("expanded");
        footer.classList.remove("expanded");
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call