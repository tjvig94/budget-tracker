import { getTransactions, sendTransaction } from './api';

getTransactions();

// function saveRecord(transaction) {
  
// }

document.querySelector("#add-btn").onclick = function() {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function() {
  sendTransaction(false);
};
