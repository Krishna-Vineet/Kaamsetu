

function confirmLogout() {
  if (confirm("Are you sure you want to logout?")) {
    alert("Logout feature is under development!");
    // window.location.href = "login.html";
  }
}

function confirmAccountDeletion() {
  if (
    confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
  ) {
    alert("Account deletion feature is under development!");
    // window.location.href = "login.html";
  }
}

// Form submission handlers
 document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const laborId = document.querySelector('#laborId').value;

  const formData = new FormData(e.target);
  const profileData = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    skills: formData.get('skills'),
    upiId: formData.get('upiId')
  };

  try {
    const response = await fetch(`/labor/profile/${laborId}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) throw new Error('Failed to update profile');
    alert('Profile updated successfully!');
    location.reload(); // Refresh the page to reflect changes
  } catch (error) {
    console.error('Error updating profile:', error.message);
    alert('Failed to update profile. Please try again.');
  }
});

document
  .getElementById("passwordUpdateForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Password updatation feature is under development!");
    closeModal("passwordUpdateModal");
  });






// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
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


    

    // Modal System
    const modalTriggers = {
        'editProfileBtn': 'editProfileModal',
        'passwordUpdateBtn': 'passwordUpdateModal'
    };

    // Modal Handler
    const modalHandler = (modalId, action) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = action === 'open' ? 'block' : 'none';
            
            if (action === 'open') {
                // Add escape key listener
                const escapeHandler = (e) => {
                    if (e.key === 'Escape') modalHandler(modalId, 'close');
                };
                modal._escapeHandler = escapeHandler;
                document.addEventListener('keydown', escapeHandler);
            } else {
                document.removeEventListener('keydown', modal._escapeHandler);
            }
        }
    };

    // Set up modal triggers
    Object.entries(modalTriggers).forEach(([triggerId, modalId]) => {
        const trigger = document.getElementById(triggerId);
        if (trigger) {
            trigger.addEventListener('click', () => modalHandler(modalId, 'open'));
        }
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modalHandler(modal.id, 'close');
        });
    });



    // Form Handling
    const handleFormSubmit = async (formId, successMessage) => {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            alert('This feature is under development!');
        });
    };

    // Toast Notification System
    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    // Initialize form handlers
    handleFormSubmit('editProfileForm', 'Profile updated successfully!');
    handleFormSubmit('passwordUpdateForm', 'Password updated successfully!');


});







