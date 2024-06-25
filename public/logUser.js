document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        });

        const result = await response.json();
        window.location.href = '/';

        // Handle success or error messages here
    } catch (error) {
        console.error('Error:', error);
        // Optionally, pass the error to another function for centralized error handling
        handleError(error);
    }
});

function handleError(error) {
    // Example of handling error, you can customize this function based on your needs
    alert('An error occurred: ' + 'Either email is not registered or Password is incorrect');
}