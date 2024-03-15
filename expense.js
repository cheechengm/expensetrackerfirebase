    // Selecting elements
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalDisplay = document.getElementById('total');

    // Initialize total expense
    let totalExpense = 0;
    // Function to add expense to the expense list table
    function addExpense(description, amount, userId, id, date, category) {
        // Create a new row for the expense
        //console.log("Adding expense to table:", description, amount, userId, id, date, category);
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-id', id); // Set data-id attribute to identify the expense

        // Create cells for each data field
        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = description;
        descriptionCell.classList.add('description'); // Add the .amount class
        newRow.appendChild(descriptionCell);

        const amountCell = document.createElement('td');
        amountCell.textContent = '$' + amount.toFixed(2); // Display amount with two decimal places
        amountCell.classList.add('amount'); // Add the .amount class
        newRow.appendChild(amountCell);

        const categoryCell = document.createElement('td');
        categoryCell.textContent = category; // Display category
        categoryCell.classList.add('category'); // Add the .date class
        newRow.appendChild(categoryCell);

        const dateCell = document.createElement('td');
        dateCell.textContent = date; // Display date in a formatted string
        dateCell.classList.add('date'); // Add the .date class
        newRow.appendChild(dateCell);

        const deleteCell = document.createElement('td');
        deleteCell.innerHTML = '<button class="delete-btn">Delete</button>';
        newRow.appendChild(deleteCell);

        const editCell = document.createElement('td');
        editCell.innerHTML = '<button class="edit-btn">Edit</button>';
        newRow.appendChild(editCell);

        // Add event listeners to delete and edit buttons
        deleteCell.querySelector('.delete-btn').addEventListener('click', function() {
            const expenseId = newRow.getAttribute('data-id');
            deleteExpense(expenseId);
        });

        editCell.querySelector('.edit-btn').addEventListener('click', function() {
            const expenseId = newRow.getAttribute('data-id');
            editExpense(expenseId);
        });

        // Append the new row to the table body
        const tableBody = document.querySelector('.expense-list-body');
        tableBody.appendChild(newRow);

        // Update total expense
        totalExpense += amount; // No need to parse again, since we're already using a float
        totalDisplay.textContent = totalExpense.toFixed(2); // Update total with two decimal places
    }

    // Function to delete expense from the UI and Firestore
    function deleteExpense(id) {
        const expenseRow = document.querySelector(`tr[data-id="${id}"]`);
        if (!expenseRow) {
            console.error("Expense item not found.");
            return;
        }

        const amountText = expenseRow.querySelector('td:nth-child(2)').textContent;
        const amount = parseFloat(amountText.slice(1)); // Remove the '$' sign and parse as float

        // Remove the expense row from the table
        expenseRow.remove();

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
            const expenseId = event.target.closest('tr').getAttribute('data-id');
            deleteExpense(expenseId);
        }
    });

    function loadExpenses(userId) {
        db.collection('expenses')
            .where("userId", "==", userId)
            .orderBy("date", "asc") // Order expenses by date in ascending order
            .get()
            .then(snapshot => {
                snapshot.docs.forEach(doc => {
                    const expenseData = doc.data();
                    addExpense(expenseData.description, expenseData.amount, userId, doc.id, expenseData.date, expenseData.category);
                });
            })
            .catch(error => {
                console.error("Error fetching expenses:", error);
            });
    }
    
/*
function loadExpenses(userId) {
    db.collection('expenses').where("userId", "==", userId).get().then(snapshot => {
       // const expenses = [];
        snapshot.docs.forEach(doc => {
            const expenseData = doc.data();
           // expenses.push(expenseData);
            addExpense(expenseData.description, expenseData.amount, userId, doc.id, expenseData.date, expenseData.category); // Pass category to addExpense function
        });

        // Group expenses by category
       // expensesByCategory = groupExpensesByCategory(expenses);
        //console.log("Expenses grouped by category:", expensesByCategory);

        // Group expenses by month
        //expensesByMonth = groupExpensesByMonth(expenses);
        //console.log("Expenses grouped by month:", expensesByMonth);

        // Group expenses by first month then categories
        //groupedExpenses = groupExpensesByFirstMonthThenCategories(expenses);

        // Log the grouped expenses to the console
        //console.log("Grouped expenses by first month then categories:", groupedExpenses);
    });
}
*/

    // Event listener for expense form submission
    expenseForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById("date").value;
        const userId = firebase.auth().currentUser.uid;
    
        if (description.trim() === '' || isNaN(amount)) {
            alert('Please enter both description and a valid amount.');
            return;
        }
    
        addExpense(description, amount, userId, null, date, category);
        expenseForm.reset();
    });

    // Function to save expense to Firestore
    function saveExpenseToFirestore(description, amount, userId,expenseDate, category) {
        const expenseData = {
            description: description,
            amount: amount,
            date: expenseDate,
            userId: userId, // Associate the expense with the user ID
            category: category // Associate the expense with the category
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

// Function to edit expense
function editExpense(id) {
    const expenseRow = document.querySelector(`tr[data-id="${id}"]`);
    if (!expenseRow) {
        console.error("Expense item not found.");
        return;
    }

    // Extract existing expense data
    const description = expenseRow.querySelector('.description').textContent;
    const amountText = expenseRow.querySelector('.amount').textContent;
    const amount = parseFloat(amountText.slice(1)); // Remove the '$' sign and parse as float
    const category = expenseRow.querySelectorAll('td')[2].textContent;
    const date = expenseRow.querySelectorAll('td')[3].textContent;

    // Prompt the user to enter new description
    const newDescription = prompt("Enter new description:", description);
    if (newDescription === null) {
        // User cancelled editing
        return;
    }

    // Prompt the user to enter new amount
    let newAmount = parseFloat(prompt("Enter new amount:", amount.toFixed(2)));
    if (isNaN(newAmount)) {
        alert("Please enter a valid amount.");
        return;
    }

    // Create a category dropdown with options
    const newCategoryDropdown = createCategoryDropdown(category);

    // Prompt the user to enter a new date
    const newDate = prompt("Enter new date (YYYY-MM-DD):", date);
    if (!isValidDate(newDate)) {
        alert("Please enter a valid date in the format YYYY-MM-DD.");
        return;
    }

    // Function to check if a date is valid (in YYYY-MM-DD format)
    function isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateString);
    }


    // Append the category dropdown to the category cell in the expense row
    const categoryCell = expenseRow.querySelector('.category');
    categoryCell.innerHTML = ''; // Clear existing content
    categoryCell.appendChild(newCategoryDropdown);

    // Update the expense row with new values
    expenseRow.querySelector('.description').textContent = newDescription;
    expenseRow.querySelector('.amount').textContent = `$${newAmount.toFixed(2)}`;
    expenseRow.querySelectorAll('td')[3].textContent = newDate;

    // Update total expense
    const oldAmount = parseFloat(amountText.slice(1));
    totalExpense = totalExpense - oldAmount + newAmount;
    totalDisplay.textContent = totalExpense.toFixed(2);

    // Add event listener to the category dropdown to update the category in Firestore
    newCategoryDropdown.addEventListener('change', function() {
        // Update the category cell content when the dropdown value changes
        const newCategory = newCategoryDropdown.value;
        categoryCell.textContent = newCategory;
        
        // Update the expense data in Firestore
        db.collection('expenses').doc(id).update({
            description: newDescription,
            amount: newAmount,
            category: newCategory,
            date: newDate
        })
        .then(function() {
            console.log("Expense with ID " + id + " updated in Firestore.");
        })
        .catch(function(error) {
            console.error("Error updating expense: ", error);
        });
    });
}

    // Function to create a custom category dropdown
function createCategoryDropdown(selectedCategory) {
    const categoryDropdown = document.createElement('select');
    categoryDropdown.classList.add('category-dropdown');

    // Define the category options
    const categories = [
        "Food",
        "Shopping",
        "Housing",
        "Entertainment",
        "Transport",
        "Utilities",
        "Healthcare",
        "Education",
        "Travel"
    ];

    // Create options for each category
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.textContent = cat;
        option.value = cat.toLowerCase(); // Lowercase value for consistency
        categoryDropdown.appendChild(option);
    });

    // Set the default value to the selected category
    categoryDropdown.value = selectedCategory;

    return categoryDropdown;
}

/*
    // Select the button and dropdown menu
    const showExpensesButton = document.getElementById('show-monthly-expenses-btn');
    const monthSelect = document.getElementById('month-select');

    // Add event listener to the button
    showExpensesButton.addEventListener('click', function() {
        // Get the selected month value
        const selectedMonth = parseInt(monthSelect.value);
        
        // Call a function to filter and display expenses for the selected month
        filterAndDisplayExpenses(selectedMonth);

        
    });
    */
// Function to load expenses from Firestore and sort them by categories
// Function to plot expenses graph// Function to plot expenses graph
function plotExpensesGraph(expensesByMonth) {
    const ctx = document.getElementById('monthly-expenses-chart').getContext('2d');

    // Define a color scheme for each category
    const categoryColors = {
        "Food": "red",
        "Shopping": "blue",
        "Housing": "green",
        "Entertainment": "orange",
        "Transport": "purple",
        "Utilities": "brown",
        "Healthcare": "pink",
        "Education": "yellow",
        "Travel": "cyan"
    };

    // Extract labels (months) and data (total expenses for each category) from expensesByMonth object
    let labels = Object.keys(expensesByMonth);
    labels.sort(); // Sort the month-year keys in ascending order
    const datasets = [];

    // Get all unique categories
    const allCategories = new Set();
    labels.forEach(month => {
        for (const category in expensesByMonth[month]) {
            allCategories.add(category);
        }
    });

    // Iterate through each category
    allCategories.forEach(category => {
        const data = labels.map(month => {
            return expensesByMonth[month][category] || 0; // If no expenses for a category in a month, set to 0
        });

        // Get color for the category from the color scheme
        const color = categoryColors[category];

        // Add dataset for the category
        datasets.push({
            label: category,
            data: data,
            backgroundColor: color
        });
    });

    // Create a new Chart instance
    new Chart(ctx, {
        type: 'bar', // Set the type of chart (bar chart)
        data: {
            labels: labels.map(monthYearKey => {
                const [year, month] = monthYearKey.split('-');
                return getMonthName(parseInt(month)) + ' ' + year;
            }), // Set the labels (months) for the x-axis
            datasets: datasets // Set the datasets for the chart
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true // Start the y-axis at 0
                    }
                }]
            }
        }
    });
}


// Function to get the name of the month from its numerical representation
function getMonthName(monthIndex) {
    const date = new Date();
    date.setMonth(monthIndex - 1);
    return date.toLocaleString('default', { month: 'long' });
}


// Function to group expenses by month and calculate total expenses for each category in each month
// Function to group expenses by month and calculate total expenses for each category in each month
function groupExpensesByMonth(expenses) {
    const expensesByMonth = {};

    expenses.forEach(expense => {
        const { amount, category, date } = expense;
        const expenseDate = new Date(date); // Convert the date string to a JavaScript Date object
        const year = expenseDate.getFullYear();
        const month = expenseDate.getMonth() + 1; // JavaScript months are zero-indexed, so we add 1
        const monthYearKey = `${year}-${month}`; // Combine year and month to form the key

        if (!expensesByMonth[monthYearKey]) {
            expensesByMonth[monthYearKey] = {};
        }

        if (!expensesByMonth[monthYearKey][category]) {
            expensesByMonth[monthYearKey][category] = 0;
        }

        expensesByMonth[monthYearKey][category] += amount;
    });

    return expensesByMonth;
}


// Function to load expenses from Firestore and group them by month
function loadExpensesAndGroup(userId) {
    db.collection('expenses').where("userId", "==", userId).get().then(snapshot => {
        const expenses = [];
        snapshot.docs.forEach(doc => {
            const expenseData = doc.data();
            expenses.push(expenseData);
        });

        // Group expenses by month
        const expensesByMonth = groupExpensesByMonth(expenses);

        // Once expenses are grouped by month, plot the expenses graph
        plotExpensesGraph(expensesByMonth);
    });
}

// Call the function to load expenses from Firestore
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        const userId = user.uid;
        loadExpensesAndGroup(userId);
    }
});


    // Function to filter and display expenses for the selected month
    /*
    function filterAndDisplayExpenses(selectedMonth) {
        // Get the monthly summary element
        const summaryTable = document.getElementById('monthly-summary');

        // Check if the summary table contains any rows for the selected month
        const hasDataForSelectedMonth = Array.from(summaryTable.querySelectorAll('tbody tr')).some(row => {
            const [month, year] = row.firstElementChild.textContent.split(' ');
            return month === getMonthName(selectedMonth) && year === new Date().getFullYear().toString();
        });

        // Display or hide the summary table and chart based on whether a month is selected
        const expensesChart = document.getElementById('monthly-expenses-chart');

        if (selectedMonth === 0 || hasDataForSelectedMonth) {
            summaryTable.style.display = 'table'; // Set back to default display for table
            expensesChart.style.display = 'block'; // Set back to default display for block elements
        } else {
            summaryTable.style.display = 'none';
            expensesChart.style.display = 'none';

            // Display "No data" message
            alert('No data for the selected month.');
        }
    }
    */

    // Function to get the name of the month from its numerical representation
    function getMonthName(monthIndex) {
        const date = new Date();
        date.setMonth(monthIndex - 1);
        return date.toLocaleString('default', { month: 'long' });
    }

  // Function to calculate monthly expense summary
// Function to calculate monthly expense summary and populate the table
function calculateAndDisplayMonthlySummary(userId) {
    const monthlySummary = {}; // Object to store monthly totals

    db.collection('expenses').where("userId", "==", userId).get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            const expenseData = doc.data();
            const expenseDate = new Date(expenseData.date); // Convert the date string to a JavaScript Date object
            const monthYearKey = `${expenseDate.getMonth() + 1}-${expenseDate.getFullYear()}`;

            if (!monthlySummary[monthYearKey]) {
                monthlySummary[monthYearKey] = 0; // Initialize if not exists
            }

            monthlySummary[monthYearKey] += expenseData.amount;
        });
        
         // Log the monthlySummary object to the console
         console.log("Monthly Summary:", monthlySummary);

        // After calculating the summary, populate the monthly summary table
        populateMonthlySummaryTable(monthlySummary);
    });
}

// Check if a user is authenticated
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        const userId = user.uid;
        // Once the user is authenticated, call the function to calculate and display monthly summary
        calculateAndDisplayMonthlySummary(userId);
    }
});

// Function to populate the monthly summary table
function populateMonthlySummaryTable(monthlySummary) {
    const tableBody = document.getElementById('monthly-summary-body');
    tableBody.innerHTML = ''; // Clear existing table rows

    // Get the keys (month-year combinations) from the monthly summary object
    const keys = Object.keys(monthlySummary);

    // Sort the keys in ascending order
    keys.sort();

    // Iterate through the sorted keys and create a row for each month
    keys.forEach(monthYearKey => {
        const [month, year] = monthYearKey.split('-');
        const totalExpense = monthlySummary[monthYearKey].toFixed(2); // Format total expense with two decimal places

        // Create a new row for the month
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${getMonthName(parseInt(month))} ${year}</td>
            <td>$${totalExpense}</td>
        `;

        // Append the new row to the table body
        tableBody.appendChild(newRow);
    });
}
