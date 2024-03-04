// Selecting elements
const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const totalDisplay = document.getElementById('total');

// Initialize total expense
let totalExpense = 0;

// Function to add expense
function addExpense(description, amount, userId, id, timestamp) {
    // Check if timestamp is defined and convert it to a Date object
    const date = timestamp ? new Date(timestamp.toDate()) : new Date();
    const dateString = date.toLocaleDateString(); // Format the date as a string

    // Create list item
    const expenseItem = document.createElement('div');
    expenseItem.classList.add('expense-item');
    expenseItem.setAttribute('data-id', id);
    expenseItem.innerHTML = `
        <p>${description}</p>
        <p>$${amount.toFixed(2)}</p> <!-- Display amount with two decimal places -->
        <p>${dateString}</p> <!-- Display date -->
        <button class="delete-btn">Delete</button>
    `;

    // Add delete event listener to delete button
    expenseItem.querySelector('.delete-btn').addEventListener('click', function() {
        const expenseId = this.parentElement.getAttribute('data-id');
        deleteExpense(expenseId);
    });

    // Add to expense list
    expenseList.appendChild(expenseItem);

    // Update total expense
    totalExpense += amount; // No need to parse again, since we're already using a float
    totalDisplay.textContent = totalExpense.toFixed(2); // Update total with two decimal places
}

// Function to delete expense from the UI and Firestore
function deleteExpense(id) {
    const expenseItem = document.querySelector(`[data-id="${id}"]`);
    if (!expenseItem) {
        console.error("Expense item not found.");
        return;
    }

    const amountText = expenseItem.querySelector('p:nth-child(2)').textContent;
    const amount = parseFloat(amountText.slice(1)); // Remove the '$' sign and parse as float

    // Remove the expense from the UI
    expenseItem.remove();

    // Update total expense
    totalExpense -= amount;
    totalDisplay.textContent = totalExpense.toFixed(2);

    // Delete the expense from Firestore
    db.collection('expenses').doc(id).delete()
        .then(function() {
            console.log("Expense with ID " + id + " deleted from Firestore.");
        })
        .catch(function(error) {
            console.error("Error deleting expense: ", error);
        });
}

// Event listener for deleting expenses
expenseList.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-btn')) {
        const expenseId = event.target.parentElement.getAttribute('data-id');
        deleteExpense(expenseId);
    }
});

// Function to load expenses from Firestore
function loadExpenses(userId) {
    db.collection('expenses').where("userId", "==", userId).get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            const expenseData = doc.data();
            addExpense(expenseData.description, expenseData.amount, userId, doc.id, expenseData.timestamp);
        });
    });
}

// Event listener for expense form submission
expenseForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const description = document.getElementById('expense').value;
    const amount = parseFloat(document.getElementById('amount').value); // Parse the amount as a float
    if (description.trim() === '' || isNaN(amount)) { // Check if amount is NaN
        alert('Please enter both description and a valid amount.');
        return;
    }

    const userId = firebase.auth().currentUser.uid; // Get the current user ID
    addExpense(description, amount, userId);

    // Save expense to Firestore
    saveExpenseToFirestore(description, amount, userId);

    // Reset form fields
    expenseForm.reset();
});

// Function to save expense to Firestore
function saveExpenseToFirestore(description, amount, userId) {
    const expenseData = {
        description: description,
        amount: amount,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userId: userId // Associate the expense with the user ID
    };

    db.collection('expenses').add(expenseData)
        .then(function(docRef) {
            console.log("Expense added with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding expense: ", error);
        });
}

// Load expenses from Firestore when the page loads
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        const userId = user.uid;
        loadExpenses(userId);
    }
});
