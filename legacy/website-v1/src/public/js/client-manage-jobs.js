document.addEventListener("DOMContentLoaded", () => {
  const jobList = document.getElementById("job-list");
  const jobDetails = document.getElementById("job-details");
  const jobInfo = document.getElementById("job-info");
  const updatesSection = document.getElementById("updates-section");
  const addUpdateBtn = document.getElementById("add-update-btn");
  const updateModal = document.getElementById("update-modal");
  const closeModal = document.querySelector(".close-modal");
  const updateForm = document.getElementById("update-form");
  const clientId = document.querySelector("#clientId").value;
  let selectedJobId = null;

  // Fetch job details when a job is clicked
  jobList.addEventListener("click", async (e) => {
    const jobItem = e.target.closest(".job-item");
    if (jobItem) {
      // Highlight selected job
      document.querySelectorAll(".job-item").forEach(item => item.classList.remove("active"));
      jobItem.classList.add("active");

      selectedJobId = jobItem.dataset.jobid;
      const url = `/client/${clientId}/jobs/${selectedJobId}`;
      const response = await fetch(url);
      const job = await response.json();

      // Populate basic details
      document.getElementById("job-title").textContent = job.title || "N/A";
      document.getElementById("job-description").textContent = job.description || "No description available.";
      document.getElementById("job-category").textContent = job.category || "N/A";
      document.getElementById("job-subCategory").textContent = job.subCategory || "N/A";
      document.getElementById("job-status").textContent = job.status || "Unknown";
      document.getElementById("job-location").textContent = job.location || "N/A";
      document.getElementById("job-start-date").textContent = job.startDate || "N/A";
      document.getElementById("job-end-date").textContent = job.endDate ? new Date(job.endDate).toLocaleDateString() : "N/A";
      document.getElementById("job-budget").textContent = job.budget || "N/A";
      document.getElementById("job-cost").textContent = job.cost || "0";

      // Populate media
      const mediaGallery = document.getElementById("job-media");
      mediaGallery.innerHTML = "";
      if (job.media && job.media.length > 0) {
        job.media.forEach(media => {
          const mediaElement = document.createElement("div");
          mediaElement.classList.add("media-item");
          if (media.resource_type === "image") {
            mediaElement.innerHTML = `<img src="${media.url}" alt="Job Media" />`;
          } else if (media.resource_type === "video") {
            mediaElement.innerHTML = `<video controls><source src="${media.url}" type="video/mp4">Your browser does not support the video tag.</video>`;
          }
          mediaGallery.appendChild(mediaElement);
        });
      } else {
        mediaGallery.innerHTML = "<p>No media available.</p>";
      }

      // Populate team members
      const teamMembersList = document.getElementById("team-members");
      teamMembersList.innerHTML = "";
      if (job.laborers && job.laborers.length > 0) {
        job.laborers.forEach(member => {
          const li = document.createElement("li");
          li.innerHTML = `
            ${member.name} (${member.phone})
            <a href="tel:${member.phone}" class="call-laborer">📞 Call</a>
          `;
          teamMembersList.appendChild(li);
        });
      } else {
        teamMembersList.innerHTML = "<li>No team members assigned yet.</li>";
      }

      // Populate updates
      const updatesSection = document.getElementById("job-updates");
      updatesSection.innerHTML = "";
      if (job.updates && job.updates.length > 0) {
        job.updates.forEach(update => {
          const div = document.createElement("div");
          div.innerHTML = `
            <h5>${update.title}</h5>
            <p>${update.text}</p>
            <small>${update.timeStamp}</small>
          `;
          updatesSection.appendChild(div);
        });
      } else {
        updatesSection.innerHTML = "<p>No updates available.</p>";
      }

      // Show job details section
      jobDetails.style.display = "block";
    }
  });

  // Open modal for adding updates
  addUpdateBtn.addEventListener("click", () => {
    if (!selectedJobId) return alert("Please select a job first.");
    updateModal.style.display = "block";
  });

  // Close modal
  closeModal.addEventListener("click", () => {
    updateModal.style.display = "none";
  });

  // Submit update form
  updateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(updateForm);
    const title = formData.get("title");
    const description = formData.get("description");
    console.log(title, description);
    
    const updatesSection = document.getElementById("job-updates");


    const response = await fetch(
      `/client/${clientId}/jobs/${selectedJobId}/update`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      }
    );

    if (response.ok) {
      const { update } = await response.json();
      updatesSection.innerHTML += `
        <div class="job-update">
            <h5>${update.title}</h5>
            <p>${update.text}</p>
            <small>${update.timeStamp}</small>
        </div>
      `;
      updateModal.style.display = "none";
      updateForm.reset();
    } else {
      alert("Failed to add update.");
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
});
