document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector("form");
    const eField = form.querySelector(".email"),
        eInput = eField.querySelector("input"),
        pField = form.querySelector(".password"),
        pInput = pField.querySelector("input");
    const signupLink = document.querySelector("#signup-link");
    const resetLink = document.querySelector("#reset-password");

    signupLink.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = 'http://127.0.0.1:5500/signup-page/signup.html';
    });

    resetLink.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = 'http://127.0.0.1:5500/reset-password-page/resetPassword.html';
    });

    form.onsubmit = (e) => {
        e.preventDefault();

        // Check if email and password are empty
        (eInput.value === "") ? eField.classList.add("shake", "error") : checkEmail();
        (pInput.value === "") ? pField.classList.add("shake", "error") : checkPass();

        // Shake effect removal
        setTimeout(() => {
            eField.classList.remove("shake");
            pField.classList.remove("shake");
        }, 500);

        // Event listeners for typing in the fields
        eInput.onkeyup = () => { checkEmail(); }
        pInput.onkeyup = () => { checkPass(); }

        // Function to check email format
        function checkEmail() {
            let pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
            const emailError = document.getElementById('emailError');

            emailError.style.display = 'none';
            if (!eInput.value.match(pattern)) {
                eField.classList.add("error");
                eField.classList.remove("valid");
                let errorTxt = eField.querySelector(".error-txt");
                (eInput.value !== "") ? errorTxt.innerText = "Enter a valid email address" : errorTxt.innerText = "Email can't be blank";
            } else {
                eField.classList.remove("error");
                eField.classList.add("valid");
            }
        }

        // Function to check if password is empty
        function checkPass() {
            const emailError = document.getElementById('emailError');

            emailError.style.display = 'none';
            if (pInput.value === "") {
                pField.classList.add("error");
                pField.classList.remove("valid");
            } else {
                pField.classList.remove("error");
                pField.classList.add("valid");
            }
        }

        // If no errors, submit the form data
        if (!eField.classList.contains("error") && !pField.classList.contains("error")) {
            // Prepare data to be sent to the server
            const userData = {
                username: eInput.value,
                password: pInput.value
            };

            // Send data to the server
            fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    // Show error alert
                    Swal.fire({
                        title: 'Error!',
                        text: data.error,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                } else {
                    // Show success alert and redirect
                    Swal.fire({
                        title: 'Success!',
                        text: data.message,
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        window.location.href = 'http://127.0.0.1:5500/main-page/main_page.html';
                    });
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                // Show error alert for unexpected errors
                Swal.fire({
                    title: 'Error!',
                    text: 'Something went wrong. Please try again later.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            });
        }
    };
});
