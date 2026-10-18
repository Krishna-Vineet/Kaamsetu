// Toggle Sidebar
const toggleBtn = document.querySelector(".toggle-sidebar");
const sidebar = document.querySelector(".sidebar");
const mainContent = document.querySelector(".main-content");
const footer = document.querySelector(".footer");
const sidebarOverlay = document.querySelector('.sidebar-overlay');

toggleBtn.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle("open");
    sidebarOverlay.classList.toggle("active");
  } else {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
    footer.classList.toggle("expanded");
  }
});

sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
});

// Responsive sidebar behavior
function handleResize() {
  if (window.innerWidth <= 768) {
    sidebar.classList.remove("collapsed");
    mainContent.classList.add("expanded");
    footer.classList.add("expanded");
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  } else {
    sidebar.classList.remove("collapsed");
    mainContent.classList.remove("expanded");
    footer.classList.remove("expanded");
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  }
}

window.addEventListener("resize", handleResize);
handleResize(); // Initial check
