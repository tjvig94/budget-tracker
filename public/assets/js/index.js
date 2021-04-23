import { getTransactions, sendTransaction } from './api';
import { populateChart, populateTable, populateTotal } from './domMethods';
import { checkDatabase } from './indexedDb';

let transactions = [];
let myChart;
let db;
let budgetVersion;
const request = indexedDB.open('BudgetDB', budgetVersion || 1);

request.onupgradeneeded = function (e) {
  db = e.target.result;
  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetStore', { autoIncrement: true });
  }
};

request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};

request.onsuccess = function (e) {
  console.log('success');
  db = e.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')  
  }

  document.querySelector("#add-btn").onclick = function() {
    sendTransaction(true);
  };
  
  document.querySelector("#sub-btn").onclick = function() {
    sendTransaction(false);
  };

  window.addEventListener('online', checkDatabase);

  // If we are not online, add transactions
  getTransactions().then(data => {
    transactions = data;
    if (!navigator.onLine) {
      getIdbTransactions().then(data => {
        if (data.length > 0) {
          data.forEach(transaction => {
            transactions.ushift(transaction)
          })
        }
        populateTotal(transactions);
        populateTable(transactions);
        populateChart(transactions);
      });
    } else {
      postIdbTransactions();
      populateTotal(transactions);
      populateTable(transactions);
      populateChart(transactions, myChart);
    } 
  });
})


