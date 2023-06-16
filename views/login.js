$(function () {

    $('#loginForm').on('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        const username = $('#username').val();
        const password = $('#password').val();

        const loginData = {
            username: username,
            password: password
        };

        $.ajax({
            url: '/login',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(loginData), // Use data instead of body
            success: function (response) {
                console.log('Login successful:', response);
                window.location.href = '/content';
            },
            error: function (xhr, error, status) {
                const response = xhr.responseJSON;
    
                if (response.error === 'Invalid username or password') {
                    const error = "Invalid username or password"
                    if (error) {
                        const errorBox = document.getElementById('errorbox');
                        errorBox.textContent = error;
                        errorBox.style.display = 'block';
                    }
                } else {
                    console.error('Login failed:', error);
                    $('#errorbox').text('An error occurred during login');
                }
            }
        });
    });
}
)