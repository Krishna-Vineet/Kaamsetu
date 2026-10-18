
        // Initialize AOS animations
        AOS.init();

        // Authentication Page Redirect
        document.querySelectorAll('#login-btn').forEach(link => {
            link.addEventListener('click', () => {
                window.location.href = '/loginPage';
            });
        });
        document.querySelectorAll('#labor-register-btn').forEach(link => {
            link.addEventListener('click', () => {
                window.location.href = '/labor-registration';
            });
        });
        document.querySelectorAll('#client-register-btn').forEach(link => {
            link.addEventListener('click', () => {
                window.location.href = '/client-registration';
            });
        });

        // document.getElementById('login-btn').addEventListener('click', () => {
        //     window.location.href = '/loginPage';
        // });
        // document.getElementById('labor-register-btn').addEventListener('click', () => {
        //     window.location.href = '/labor-registration';
        // });
        // document.getElementById('client-register-btn').addEventListener('click', () => {
        //     window.location.href = '/client-registration';
        // });

        // Hamburger Menu Toggle
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.querySelector('.nav-links');

        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Smooth Scroll for Internal Links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                // e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
        
        // Header animation on scroll
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                header.style.backgroundColor = 'rgba(255,255,255,0.98)';
            } else {
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                header.style.backgroundColor = 'rgba(255,255,255,0.95)';
            }
        });