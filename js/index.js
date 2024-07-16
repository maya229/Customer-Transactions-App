document.addEventListener('DOMContentLoaded', () => {
    let customers = [];
    let transactions = [];
    const tableBody = document.querySelector("tbody");
    const customerNameFilter = document.getElementById('customerNameFilter');
    const transactionAmountFilter = document.getElementById('transactionAmountFilter');

    async function displayData() {
        try {
            // let response = await fetch(`http://localhost:3001/data`);
            let response = await fetch('data.json');

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            let data = await response.json();
            customers = data.customers;
            transactions = data.transactions;
            renderData(customers, transactions);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    function renderData(customers, transactions) {
        const nameFilterValue = customerNameFilter.value.toLowerCase();
        const amountFilterValue = parseFloat(transactionAmountFilter.value);

        tableBody.innerHTML = '';

        customers.forEach(customer => {
            const customerTransactions = transactions.filter(transaction => transaction.customer_id === customer.id);

            customerTransactions.forEach((transaction, index) => {
                if (nameFilterValue && !customer.name.toLowerCase().includes(nameFilterValue)) {
                    return;
                }
                if (!isNaN(amountFilterValue) && transaction.amount < amountFilterValue) {
                    return;
                }

                const row = document.createElement('tr');
                const nameTd = document.createElement('td');
                if (index === 0) {
                    nameTd.textContent = customer.name;
                }
                row.appendChild(nameTd);

                const dateTd = document.createElement('td');
                dateTd.textContent = transaction.date;
                row.appendChild(dateTd);

                const amountTd = document.createElement('td');
                amountTd.textContent = transaction.amount;
                row.appendChild(amountTd);

                const buttonTd = document.createElement('td');
                if (index === 0) {
                    const button = document.createElement('button');
                    button.id = `${transaction.customer_id}`;
                    button.className = 'btn btn-outline-primary';
                    button.textContent = 'show';
                    buttonTd.appendChild(button);

                    button.addEventListener('click', (e) => {
                        createChart(e.target.getAttribute('id'), customers, transactions);
                    });
                }
                row.appendChild(buttonTd);

                tableBody.appendChild(row);
            });
        });
    }

    let chart = null;

    function createChart(id, customers, transactions) {
        id = parseInt(id);
        const selectedCustomer = customers.find(customer => customer.id === id);
        const customerTransactions = transactions.filter(transaction => transaction.customer_id === id);
        const dailyTransactions = {};
        customerTransactions.forEach(transaction => {
            const date = transaction.date;
            const amount = parseFloat(transaction.amount);
            if (dailyTransactions[date]) {
                dailyTransactions[date] += amount;
            } else {
                dailyTransactions[date] = amount;
            }
        });

        const labels = Object.keys(dailyTransactions);
        const data = Object.values(dailyTransactions);

        const ctx = document.getElementById('myChart').getContext('2d');

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `Total Transactions Amount for ${selectedCustomer.name}`,
                    data: data,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    customerNameFilter.addEventListener('input', () => renderData(customers, transactions));
    transactionAmountFilter.addEventListener('input', () => renderData(customers, transactions));

    displayData();
});
