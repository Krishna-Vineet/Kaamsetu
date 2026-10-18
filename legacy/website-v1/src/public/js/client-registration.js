
document.getElementById('client-registration-form').addEventListener('submit', async (e) => {
e.preventDefault();

const formData = new FormData(e.target);

const data = {
name: formData.get('name'),
company: formData.get('company'), // Company is optional
email: formData.get('email'),
phone: formData.get('phone'),
password: formData.get('password'),
confirmPassword: formData.get('confirm-password'),
address: formData.get('address'),
pincode: formData.get('pincode'),
};

// console.log(JSON.stringify(data)); // Log the data for debugging

try {
const response = await fetch('/client/registration', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
});

if (response.ok) {
    const result = await response.json();
    alert(result.message || 'Registration successful!');
    // Redirect to client dashboard
    window.location.href = `/client/dashboard/${result.clientId}`;
} else {
    const error = await response.json();
    alert(error.message || 'Registration failed!');
}
} catch (err) {
console.error('Error:', err);
alert('Something went wrong. Please try again later.');
}
});
