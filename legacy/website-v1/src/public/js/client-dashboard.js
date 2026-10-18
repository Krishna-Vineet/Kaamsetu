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



// Approve Laborers Modal
document.querySelectorAll('.btn-approve').forEach(button => {
  button.addEventListener('click', async (e) => {
      const jobId = e.target.dataset.jobid;
      // console.log(jobId);
      
      const modalOverlay = document.getElementById('approveModalOverlay');
      const laborerList = document.getElementById('laborerList');
      
      try {
          const response = await fetch(`/client/job-applicants/${jobId}`);
          const { applicants } = await response.json();
          
          laborerList.innerHTML = applicants.map(laborer => `
              <div class="laborer-item" data-laborer-id="${laborer._id}">
                  <div>
                      <h4>${laborer.name}</h4>
                      <p>Completion Rate: ${laborer.completionRate}%</p>
                  </div>
                  <div class="laborer-actions">
                      <button class="btn btn-success select-btn">✓</button>
                      <button class="btn btn-danger reject-btn">✕</button>
                  </div>
              </div>
          `).join('');

          modalOverlay.style.display = 'block';
          let selectedLaborers = [];

          laborerList.addEventListener('click', (e) => {
              const laborerItem = e.target.closest('.laborer-item');
              if (!laborerItem) return;

              if (e.target.classList.contains('select-btn')) {
                  laborerItem.classList.add('selected');
                  laborerItem.classList.remove('rejected');
                  selectedLaborers.push(laborerItem.dataset.laborerId);
              } else if (e.target.classList.contains('reject-btn')) {
                  laborerItem.classList.add('rejected');
                  laborerItem.classList.remove('selected');
                  selectedLaborers = selectedLaborers.filter(id => id !== laborerItem.dataset.laborerId);
              }
          });

          document.getElementById('confirmApproval').onclick = async () => {
              if (selectedLaborers.length === 0) {
                  alert('Please select at least one laborer');
                  return;
              }

              try {
                  const response = await fetch(`/client/approve-laborers/${jobId}`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ laborers: selectedLaborers }),
                  });

                  if (response.ok) {
                      window.location.reload();
                  }
              } catch (error) {
                  console.error('Error:', error);
              }
          };
      } catch (error) {
          console.error('Error:', error);
      }
  });
});

// Delete Job Modal
document.querySelectorAll('.btn-delete').forEach(button => {
  button.addEventListener('click', (e) => {
      const jobId = e.target.dataset.jobId;
      const modalOverlay = document.getElementById('deleteModalOverlay');
      modalOverlay.style.display = 'block';

      document.getElementById('confirmDelete').onclick = async () => {

          try {
              const response = await fetch(`/client/cancel-job/${jobId}`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  }
              });

              if (response.ok) {
                  window.location.reload();
              }
          } catch (error) {
              console.error('Error:', error);
          }
      };
  });
});

// Close Modals
document.querySelectorAll('.close-modal').forEach(button => {
  button.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(modal => {
          modal.style.display = 'none';
      });
  });
});