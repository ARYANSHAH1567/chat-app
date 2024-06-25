document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
  
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const formData = new FormData(signupForm);
      const data = Object.fromEntries(formData.entries());
  
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          // Store token in localStorage
          localStorage.setItem('token', result.token);
          // Redirect or update UI
          window.location.href = '/';
        } else {
          console.error(result.message);
        }
      } catch (error) {
        console.error('Registration error:', error);
      }
    });
  });
  