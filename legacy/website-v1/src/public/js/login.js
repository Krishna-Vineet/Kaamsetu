
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);

            const data = {
                email: formData.get('email'),
                password: formData.get('password'),
            };

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    const result = await response.json();

                    // Redirect based on the role
                    window.location.href = result.redirectUrl;
                } else {
                    const error = await response.json();
                    alert(error.message || 'Login failed!');
                }
            } catch (err) {
                console.error('Error:', err);
                alert('Something went wrong. Please try again later.');
            }
        });


        document.getElementById('forgot-password').addEventListener('click', function(e) {
            e.preventDefault();
            alert(`It's your mistake to forget your password. Please contact the admin.`);
        });