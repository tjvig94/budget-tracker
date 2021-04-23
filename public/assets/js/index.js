import { getTransactions, sendTransaction } from './api';
import { populateChart, populateTable, populateTotal } from './domMethods';
import { postIdbTransactions, getIdbTransactions } from './indexedDb';

let transactions = [];
let myChart;

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

  window.addEventListener('online', postIdbTransactions);

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


