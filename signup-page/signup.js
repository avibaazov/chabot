const form = document.querySelector("form");
eField = form.querySelector(".email"),
    eInput = eField.querySelector("input"),
    pField = form.querySelector(".password"),
    pInput = pField.querySelector("input");


form.onsubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Check if email and password are empty
    (eInput.value === "") ? eField.classList.add("shake", "error"): checkEmail();
    (pInput.value === "") ? pField.classList.add("shake", "error"): checkPass();

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
        if (!eInput.value.match(pattern)) {
            eField.classList.add("error");
            eField.classList.remove("valid");
            let errorTxt = eField.querySelector(".error-txt");
            (eInput.value !== "") ? errorTxt.innerText = "Enter a valid email address": errorTxt.innerText = "Email can't be blank";
        } else {
            eField.classList.remove("error");
            eField.classList.add("valid");
        }
    }

    // Function to check if password is empty
    function checkPass() {
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
        fetch('http://127.0.0.1:5000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Handle errors (e.g., username already exists)
                alert(data.error);
            } else {
                // Inform the user of successful registration
                alert(data.message);
                // Optionally, redirect or clear the form here
                // window.location.href = '/login'; // Redirect to login page, for example
                window.location.href = 'http://127.0.0.1:5500/login-page/login.html';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
};
//  implement /register

