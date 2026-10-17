    document.getElementById('labor-registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    // Extract the skills from the checkboxes
    const selectedSkills = [];
    document.querySelectorAll('.skill-checkbox:checked').forEach((checkbox) => {
        selectedSkills.push(checkbox.value);
    });

    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirm-password'),
        skills: selectedSkills,
        address: formData.get('address'),
        pincode: formData.get('pincode'),
        upiId: formData.get('upiId'),
    }

    // console.log(JSON.stringify(data));

    try {
        const response = await fetch('/labor/registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message || 'Registration successful!');
            // Redirect to labor dashboard
            window.location.href = `/labor/dashboard/${result.laborId}`;
        } else {
            const error = await response.json();
            alert(error.error || 'Registration failed!');
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Something went wrong. Please try again later.');
    }
});
