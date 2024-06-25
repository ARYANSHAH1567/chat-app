document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        });

        const result = await response.json();
        window.location.href = '/api/auth/login';

        // Handle success or error messages here
    } catch (error) {
      
        handleError(error);
    }
});


function handleError(error) {
    // Example of handling error, you can customize this function based on your needs
    alert('An error occurred: ' + "Please check the entered details once. If the issue persists try changing username and email");
}