// Modal Functions
function openJobDetailsModal() {
  document.getElementById("jobDetailsModal").style.display = "block";
}

function openCancellationDetailsModal() {
  document.getElementById("cancellationDetailsModal").style.display = "block";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
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

function openCancellationDetailsModal(jobStr) {
  try {
    // Parse the JSON string
    const job = JSON.parse(jobStr);
    
    // Populate the modal fields using the name attribute selectors
    document.querySelector('#cancellationDetailsModal input[name="jobTitle"]').value = job.title || "";
    document.querySelector('#cancellationDetailsModal input[name="jobDescription"]').value = job.description || "";
    document.querySelector('#cancellationDetailsModal input[name="jobStartDate"]').value = job.startDate || "";
    document.querySelector('#cancellationDetailsModal input[name="jobCancellationDate"]').value = job.cancellationDate || "";
    document.querySelector('#cancellationDetailsModal textarea[name="jobCancellationReason"]').value = job.reason || "";
    
    // Display the modal
    document.getElementById('cancellationDetailsModal').style.display = 'block';
  } catch (error) {
    console.error('Error parsing job details:', error);
  }
}

// A simple function to close the modal (if you haven't defined it already)
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}


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