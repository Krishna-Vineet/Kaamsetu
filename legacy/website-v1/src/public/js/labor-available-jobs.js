// Modal Functions
function openJobDetailsModal(job) {
      document.getElementById('jobId').value = job._id;
      document.getElementById('jobTitle').textContent = job.title;
      document.getElementById('jobDescription').textContent = job.description;
      document.getElementById('clientName').textContent = job.client || 'N/A';
      document.getElementById('location').textContent = job.location;
      document.getElementById('budget').textContent = `₹ ${job.budget.toLocaleString("en-IN")}`;
      
      // Open the modal.
      document.getElementById('jobDetailsModal').style.display = 'flex';
    }

    // Close the modal.
    function closeModal(modalId) {
      document.getElementById(modalId).style.display = 'none';
    }

    // This function confirms the application using the job id from the modal.
    async function confirmJobApplication() {
      const laborId = document.getElementById('laborId').value;
      const jobId = document.getElementById('jobId').value;

      if (!laborId || !jobId) {
        alert("Labor ID or Job ID is missing. Please try again.");
        return;
      }

      try {
        const response = await fetch(`/labor/available-jobs/${laborId}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId })
        });

        if (!response.ok) throw new Error('Failed to apply for job');
        alert('Job application submitted successfully!');
        closeModal('jobDetailsModal');
        location.reload();
      } catch (error) {
        console.error('Error applying for job:', error.message);
        alert('Failed to apply for the job. Please try again.');
      }
    }

    // This function cancels the application for a given job.
    async function cancelJobApplication(job) {
      const laborId = document.getElementById('laborId').value;
      const jobId = job._id;

      if (!laborId || !jobId) {
        alert("Labor ID or Job ID is missing. Please try again.");
        return;
      }

      try {
        const response = await fetch(`/labor/available-jobs/${laborId}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId })
        });

        if (!response.ok) throw new Error('Failed to cancel job application');
        alert('Job application cancelled successfully!');
        location.reload();
      } catch (error) {
        console.error('Error cancelling job application:', error.message);
        alert('Failed to cancel the job application. Please try again.');
      }  
    }  
    
    
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





