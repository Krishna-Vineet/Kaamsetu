// Function to open the modal and populate it with payment details
        function openPaymentDetailsModal(payment) {
            document.getElementById('paymentDate').value = payment.date;
            document.getElementById('jobId').value = payment.jobId;
            document.getElementById('jobDescription').value = payment.description;
            document.getElementById('paymentAmount').value = `₹ ${payment.amount.toLocaleString()}`;
            document.getElementById('paymentStatus').value = payment.status;

            const modal = document.getElementById('paymentDetailsModal');
            modal.style.display = 'block';
        }

        // Function to close the modal
        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.style.display = 'none';
        }

        // Function to handle CSV export (placeholder)
        function exportCSV() {
            alert('Exporting CSV...');
            // Add logic to export data as CSV here
        }



        document.addEventListener('DOMContentLoaded', async () => {
  const laborId = document.querySelector('#laborId').value;

  try {
    const response = await fetch(`/labor/payment/${laborId}`);
    if (!response.ok) throw new Error('Failed to fetch payment history');
    const data = await response.json();

    const pendingPaymentsList = document.getElementById('pendingPayments');
    const completedPaymentsList = document.getElementById('completedPayments');

    if (data.pendingPayments.length === 0) {
      pendingPaymentsList.innerHTML = '<p>No pending payments found.</p>';
    } else {
      data.pendingPayments.forEach(payment => {
        const paymentRow = document.createElement('tr');
        paymentRow.innerHTML = `
          <td>${payment.jobTitle}</td>
          <td>₹ ${payment.amountDue}</td>
          <td>${payment.dueDate}</td>
          <td><span class="status pending">${payment.status}</span></td>
        `;
        pendingPaymentsList.appendChild(paymentRow);
      });
    }

    if (data.completedPayments.length === 0) {
      completedPaymentsList.innerHTML = '<p>No completed payments found.</p>';
    } else {
      data.completedPayments.forEach(payment => {
        const paymentRow = document.createElement('tr');
        paymentRow.innerHTML = `
          <td>${payment.jobTitle}</td>
          <td>₹ ${payment.amountPaid}</td>
          <td>${payment.paymentDate}</td>
          <td><span class="status completed">${payment.status}</span></td>
        `;
        completedPaymentsList.appendChild(paymentRow);
      });
    }
  } catch (error) {
    console.error('Error fetching payment history:', error.message);
    alert('Failed to load payment history. Please refresh the page.');
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



