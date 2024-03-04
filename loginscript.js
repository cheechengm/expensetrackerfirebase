

function validateEmail(email) {
    // Regular expression for validating email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function checkPasswordStrength(password) {
    // Password strength criteria: At least 8 characters long
    return password.length >= 8;
}

function register() {
    const fullName = document.getElementById("full_name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("signup-error-message");

    // Validate email
    if (!validateEmail(email)) {
        errorMessage.innerText = "Please enter a valid email address.";
        return;
    }

    // Check password strength
    if (!checkPasswordStrength(password)) {
        errorMessage.innerText = "Password must be at least 8 characters long.";
        return;
    }

    // Auth
    auth.createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            // Success - User created
            var user = userCredential.user;

            // Create user data
            var userData = {
                email: email,
                full_name: fullName,
                last_login: firebase.firestore.FieldValue.serverTimestamp() // Use server timestamp
            };

            // Reference to Firestore collection
            var usersCollection = firebase.firestore().collection("users");

            // Add user data to Firestore
            usersCollection.doc(user.uid).set(userData)
                .then(() => {
                    // Print message when successfully registered in Firestore
                    console.log("User registered successfully in Firestore:", email);

                    // Clear error message
                    errorMessage.innerText = "";

                    // Reset form fields (optional)
                    document.getElementById("full_name").value = "";
                    document.getElementById("email").value = "";
                    document.getElementById("password").value = "";

                    // Inform the user that registration was successful
                    alert('User registered successfully!');
                })
                .catch((error) => {
                    console.error("Error saving user data to Firestore:", error);
                    errorMessage.innerText = error.message;
                });
        })
        .catch(function(error) {
            // Error handling
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error(errorCode, errorMessage);

            // Display error message to the user
            errorMessage.innerText = errorMessage;
        });
}



function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("login-error-message");

    // Validate email
    if (!validateEmail(email)) {
        errorMessage.innerText = "Please enter a valid email address.";
        return;
    }

    // Auth
    auth.signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            // Logged in successfully
            var user = userCredential.user;
            console.log("User logged in successfully:", user.email);
            // Clear error message
            errorMessage.innerText = "";
            // Reset form fields (optional)
            document.getElementById("email").value = "";
            document.getElementById("password").value = "";
            // Redirect to dashboard or perform any other action
            window.location.href = "index.html"; // Example redirect to dashboard page
        })
        .catch(function(error) {
            // Error handling
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error(errorCode, errorMessage);
            // Display error message to the user
            errorMessage.innerText = errorMessage;
        });
}

