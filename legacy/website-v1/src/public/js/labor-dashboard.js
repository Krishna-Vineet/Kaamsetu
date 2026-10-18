// Function to view job details in a modal or redirect
        function viewJobDetails(job) {
            alert(`Viewing details for job: ${job.title}`);
            console.log(job); // You can replace this with modal logic or redirection
        }


        document.addEventListener('DOMContentLoaded', async () => {
  const laborId = document.querySelector('#laborId').value; // Hidden input in EJS template
  try {
    const response = await fetch(`/labor/dashboard/${laborId}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    const data = await response.json();

    // Update UI dynamically
    document.getElementById('totalJobs').textContent = data.totalJobs;
    document.getElementById('activeJobs').textContent = data.activeJobs;
    document.getElementById('totalEarnings').textContent = `₹ ${data.totalEarnings}`;
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message);
    alert('Failed to load dashboard data. Please refresh the page.');
  }
});





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