const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "login.html";
}

let transactions = [];

let income = 0;
let expense = 0;
let categoryChart;
const API = "http://localhost:5000/api/transactions";
const form = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const incomeDisplay = document.getElementById("income");
const expenseDisplay = document.getElementById("expense");
const balanceDisplay = document.getElementById("balance");

// ================= DISPLAY TRANSACTIONS =================
function displayTransactions(list = transactions) {

    transactionList.innerHTML = "";

    income = 0;
    expense = 0;

    list.forEach(function(transaction, index){

        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between";

        li.innerHTML = `
        <div>
            <h6 class="mb-1">
                ${getCategoryIcon(transaction.category)}
                ${transaction.category}
            </h6>

            <small class="text-muted">
                ${transaction.description}
            </small>
        </div>

        <div class="text-end">

            <strong class="${
                transaction.type === "income"
                ? "text-success"
                : "text-danger"
            }">

                ${transaction.type === "income" ? "+" : "-"}
                ₹${transaction.amount}

            </strong>

            <br>

            <button class="btn btn-danger btn-sm mt-2"
           onclick="deleteTransaction('${transaction._id}')">

            🗑 Delete

            </button>

        </div>
        `;

        transactionList.appendChild(li);

        if(transaction.type === "income"){
            income += transaction.amount;
        } else {
            expense += transaction.amount;
        }

    });

    updateDashboard();
    updateBudget(); // 🔥 IMPORTANT AUTO UPDATE
}

// ================= DELETE =================
async function deleteTransaction(id) {
    await fetch(`${API}/delete/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": token
        }
    });

    loadTransactions();
}

// ================= CATEGORY ICON =================
function getCategoryIcon(category){

    switch(category){
        case "Salary": return "💼";
        case "Freelance": return "💸";
        case "Food": return "🍔";
        case "Travel": return "🚗";
        case "Shopping": return "🛍️";
        case "Bills": return "💡";
        case "Mobile Recharge": return "📱";
        case "Health": return "💊";
        case "Education": return "🎓";
        case "Entertainment": return "🎬";
        case "Rent": return "🏠";
        default: return "🎁";
    }
}

// ================= ADD TRANSACTION =================
form.addEventListener("submit", async function(e){
    e.preventDefault();

    const transaction = {
        amount: Number(document.getElementById("amount").value),
        type: document.getElementById("type").value,
        description: document.getElementById("description").value,
        category: document.getElementById("category").value
    };

    await fetch(`${API}/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(transaction)
    });

    loadTransactions();
    form.reset();
});

async function loadTransactions() {
    const res = await fetch(`${API}/all`, {
        headers: {
            "Authorization": token
        }
    });

    transactions = await res.json();

    displayTransactions();
}
// ================= DASHBOARD =================
function updateDashboard(){

    incomeDisplay.textContent = "₹" + income;
    expenseDisplay.textContent = "₹" + expense;
    balanceDisplay.textContent = "₹" + (income - expense);

    updateCategoryChart();
}

// ================= SEARCH =================
function searchTransactions() {

    const search = document.getElementById("search")
        .value.toLowerCase();

    const filtered = transactions.filter(t =>
        t.category.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.type.toLowerCase().includes(search) ||
        t.amount.toString().includes(search)
    );

    displayTransactions(filtered);
}

// ================= BUDGET =================
let budget = Number(localStorage.getItem("budget")) || 0;

function setBudget(){

    budget = Number(document.getElementById("budgetInput").value);

    localStorage.setItem("budget", budget);

    updateBudget();
}

// ================= UPDATE BUDGET =================
function updateBudget() {

    document.getElementById("budgetAmount").textContent =
    "₹" + budget;

    let spent = 0;

    transactions.forEach(t => {
        if (t.type === "expense") {
            spent += Number(t.amount);
        }
    });

    let percent = budget > 0 ? (spent / budget) * 100 : 0;

    if (percent > 100) percent = 100;

    const bar = document.getElementById("budgetBar");

    bar.style.width = percent + "%";
    bar.textContent = Math.round(percent) + "%";

    if (percent < 70) {
        bar.className = "progress-bar bg-success";
    } 
    else if (percent < 100) {
        bar.className = "progress-bar bg-warning";
    } 
    else {
        bar.className = "progress-bar bg-danger";
    }
}

// ================= CHART =================
function updateCategoryChart() {

    let categoryTotals = {};

    transactions.forEach(t => {

        if (t.type === "expense") {

            if (!categoryTotals[t.category]) {
                categoryTotals[t.category] = 0;
            }

            categoryTotals[t.category] += Number(t.amount);
        }
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(document.getElementById("categoryChart"), {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#C46DD8","#5fb6e9","#F2C94C","#27AE60",
                    "#EB5757","#1d5c70","#3b2444","#ff43a7"
                ],
                borderColor: "#fff",
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            cutout: "65%",
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        color: "white",
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// ================= THEME =================
const btn = document.getElementById("modeBtn");

function setTheme(theme) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);

    localStorage.setItem("theme", theme);
    btn.innerText = theme === "dark" ? "☀️" : "🌙";
}

btn.onclick = () => {
    const current = document.body.classList.contains("dark") ? "dark" : "light";
    setTheme(current === "dark" ? "light" : "dark");
};

// ================= LOAD =================
window.onload = () => {

    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    loadTransactions();
    updateBudget();
};



document.getElementById("signupForm")?.addEventListener("submit", function(e) {
    e.preventDefault();

    alert("Account created successfully!");

    window.location.href = "login.html";
});




function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}