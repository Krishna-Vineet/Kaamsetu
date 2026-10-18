document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const categoryGrid = document.getElementById("categoryGrid");
    const subcategoryContainer = document.getElementById("subcategoryContainer");
    const subcategoryGrid = document.getElementById("subcategoryGrid");
    const clientId = "<%= clientId %>"; // From EJS template
  
    // Category Data
    const subcategories = {
      "home-services": ["Electrical Work", "Plumbing", "Carpentry", "Interior Design", "Gardening"],
      repair: ["Appliance Repair", "Mobile Repair", "Computer Repair", "Bike Repair", "Car Repair"],
      cleaning: ["Home Cleaning", "Office Cleaning", "Deep Cleaning", "Carpet Cleaning", "Window Cleaning"],
      painting: ["Interior Painting", "Exterior Painting", "Wall Texture", "Furniture Painting", "Commercial Painting"]
    };
  
    // Category Selection Handler
    categoryGrid.addEventListener("click", (e) => {
      const categoryOption = e.target.closest(".category-option");
      if (!categoryOption) return;
  
      // Update category selection
      document.querySelectorAll(".category-option").forEach(el =>
        el.classList.remove("selected")
      );
      categoryOption.classList.add("selected");
  
      // Populate subcategories
      const category = categoryOption.dataset.category;
      subcategoryGrid.innerHTML = subcategories[category]
        .map(subcat => `
          <div class="category-option" data-subcategory="${subcat}">
            <p>${subcat}</p>
          </div>
        `).join("");
  
      subcategoryContainer.classList.add("active");
    });
  
    // Subcategory Selection Handler
    subcategoryGrid.addEventListener("click", (e) => {
      const subcategoryOption = e.target.closest(".category-option");
      if (!subcategoryOption) return;
  
      document.querySelectorAll(".category-option[data-subcategory]")
        .forEach(el => el.classList.remove("selected"));
      subcategoryOption.classList.add("selected");
    });
  
    // // File Upload Handler
    // document.getElementById("fileUploadContainer").addEventListener("change", (e) => {
    //   const fileInput = e.target;
    //   const file = fileInput.files[0];
    //   const fileUploadBox = fileInput.closest(".file-upload-box");
  
    //   if (!file) return;
  
    //   // Validate file type
    //   const validTypes = ["image/jpeg", "image/png", "video/mp4", "video/quicktime"];
    //   if (!validTypes.includes(file.type)) {
    //     alert("Only JPG, PNG, MP4, and MOV files are allowed!");
    //     fileInput.value = "";
    //     return;
    //   }
  
    //   // Show preview
    //   const preview = createPreviewElement(file);
    //   fileUploadBox.appendChild(preview);
    //   fileUploadBox.classList.add("filled");
    // });
  
    document.getElementById("fileUploadContainer").addEventListener("change", (e) => {
  const fileInput = e.target;
  const file = fileInput.files[0];
  const fileUploadBox = fileInput.closest(".file-upload-box");

  if (!file) return;

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "video/mp4", "video/quicktime"];
  if (!validTypes.includes(file.type)) {
    alert("Only JPG, PNG, MP4, and MOV files are allowed!");
    fileInput.value = "";
    return;
  }

  // Create a preview element using a helper function
  const previewContainer = createPreviewElement(file, fileInput);
  
  // Remove any previous preview (if exists)
  const existingPreview = fileUploadBox.querySelector(".preview-container");
  if (existingPreview) {
    existingPreview.remove();
  }
  
  // Append the new preview container to the upload box
  fileUploadBox.appendChild(previewContainer);
  fileUploadBox.classList.add("filled");
});

// Helper function to create preview element with a remove button
function createPreviewElement(file, fileInput) {
  // Create a container div for the preview and the remove button
  const container = document.createElement("div");
  container.classList.add("preview-container");
  container.style.position = "relative"; // To position the remove button

  // Create preview element (img for images, video for videos)
  let previewElement;
  if (file.type.startsWith("video")) {
    previewElement = document.createElement("video");
    previewElement.controls = true;
  } else {
    previewElement = document.createElement("img");
  }
  previewElement.classList.add("file-preview");
  previewElement.src = URL.createObjectURL(file);

  // Create a remove button/icon
  const removeButton = document.createElement("button");
  removeButton.type = "button"; // Ensure it doesn't trigger file input click
  removeButton.classList.add("remove-file");
  removeButton.innerHTML = "&times;"; // × symbol

  // When remove is clicked, remove the preview and clear the input
  removeButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the file input
    container.remove();
    fileInput.value = ""; // Clear the file input so the user can re-upload
    const fileUploadBox = fileInput.closest(".file-upload-box");
    fileUploadBox.classList.remove("filled");
  });

  // Append the preview and the remove button to the container
  container.appendChild(previewElement);
  container.appendChild(removeButton);

  return container;
}


    // Form Submission Handler
    document.getElementById("jobPostForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = document.querySelector(".category-option.selected[data-category]");
  const subcategory = document.querySelector(".category-option[data-subcategory].selected");

  if (!category || !subcategory) {
    alert("Please select both a category and subcategory");
    return;
  }

  // Prepare FormData
  const formData = new FormData();
  formData.append("title", document.getElementById("jobTitle").value);
  formData.append("description", document.getElementById("jobDescription").value);
  formData.append("category", category.dataset.category);
  formData.append("subCategory", subcategory.dataset.subcategory);
  formData.append("location", document.getElementById("jobLocation").value);
  formData.append("startDate", document.getElementById("startDate").value);
  formData.append("endDate", document.getElementById("endDate").value || "");
  formData.append("budget", document.getElementById("price").value);

  // Append files
  for (let i = 1; i <= 5; i++) {
    const fileInput = document.getElementById(`fileUpload${i}`);
    if (fileInput.files.length > 0) {
      formData.append(`media${i}`, fileInput.files[0]);
    }
  }

  try {
    const response = await fetch(`/client/post-job/${clientId}`, {
      method: "POST",
      body: formData, // ✅ Send FormData (not JSON!)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Submission failed");

    // Redirect to manage jobs page
    window.location.href = `/client/dashboard/${clientId}`;
  } catch (error) {
    console.error("Submission error:", error);
    alert(error.message || "An error occurred during submission");
  }
});

    // // Helper Functions
    // function createPreviewElement(file) {
    //   const preview = file.type.startsWith("video")
    //     ? document.createElement("video")
    //     : document.createElement("img");
  
    //   preview.classList.add("file-preview");
    //   preview.src = URL.createObjectURL(file);
    //   if (file.type.startsWith("video")) preview.controls = true;
  
    //   return preview;
    // }
  
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
      } else {
        sidebar.classList.remove("collapsed");
        mainContent.classList.remove("expanded");
        footer.classList.remove("expanded");
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call
  });
