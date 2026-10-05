let receiptsData = JSON.parse(localStorage.getItem("receiptsData")) || [];
function addPurchase() {
    let product = document.getElementById("product").value;
    let store = document.getElementById("store").value;
    let price = document.getElementById("price").value;
    let purchaseDate = document.getElementById("purchaseDate").value;
    let returnDate = document.getElementById("returnDate").value;
    let warrantyDate = document.getElementById("warrantyDate").value;
    let reciptData ={
        product: product, store: store, price: price, purchaseDate: purchaseDate, returnDate: returnDate, warrantyDate: warrantyDate, returned: false
    };
    receiptsData.push(reciptData);
    localStorage.setItem("receiptsData", JSON.stringify(receiptsData));
    showReceipts();
    updateDashboard();
    updateInsights();
}
function deleteReceipt(index) {
    receiptsData.splice(index, 1);
    localStorage.setItem("receiptsData", JSON.stringify(receiptsData));
    showReceipts();
    updateDashboard();
    updateInsights();
}
function searchReceipts() {
    let search = document.getElementById("search").value.toLowerCase();
    let receipts = document.getElementsByClassName("receipt-card");

    for (let receipt of receipts) {
        let text = receipt.textContent.toLowerCase();
        if (text.includes(search)) { receipt.style.display = "block";}
        else { receipt.style.display = "none";}
    }
}
function showReceipts() {
    let receiptsBox = document.getElementById("receipts");
    receiptsBox.innerHTML = "";

    for (let i = 0; i < receiptsData.length; i++) {
        let receiptData = receiptsData[i];

            let today = new Date();
        today.setHours(0, 0, 0, 0);
        let returnDay = new Date(receiptData.returnDate + "T00:00:00")
        let timeDiff = returnDay - today;
        let daysLeft = Math.ceil(
            timeDiff / (1000 * 60 * 60 * 24)
        );
        let warrantyDay = new Date(receiptData.warrantyDate + "T00:00:00")
        let WtimeDiff = warrantyDay -today;
        let WdaysLeft = Math.ceil(
            WtimeDiff / (1000 * 60 * 60 * 24)
        );
        let returnStat;
        if (daysLeft > 0) {
            returnStat = daysLeft + " days left to be returned";
        }
        else if (daysLeft == 0){
            returnStat = "Return today";
        }
        else {
            returnStat = "Return period expired";
        }
        let warrantyStat;
        if (receiptData.warrantyDate) {
            let warrantyDay = new Date(receiptData.warrantyDate +"T00:00:00");
            let Wtimediff = warrantyDay - today;
            let Wdaysleft = Math.ceil(
                WtimeDiff / (1000 * 60 * 60 * 24)
            );
            if (WdaysLeft > 0) {
                warrantyStat = WdaysLeft + " days left in the warranty";
            }
            else if (WdaysLeft == 0) {
                warrantyStat = "Warranty expires today";
            }
            else {
                warrantyStat = "Warranty expired";
            }
        }
        else {
            warrantyStat = "No warranty date";
        }
        if (receiptData.returned == true) {
            returnStat = "returned";
        }

        let receipt = document.createElement("div");
        receipt.className = "receipt-card";
        receipt.innerHTML =
            "<h3>" + receiptData.product + "</h3><br>" +
            "Store: " + receiptData.store + "<br>" +
            "Price: $" + receiptData.price + "<br>" +
            "Bought: " + receiptData.purchaseDate + "<br>" +
            "Return by: " + receiptData.returnDate + "<br>" +
            warrantyStat + "<br>" +
            returnStat;
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = function () {deleteReceipt(i);};
        receipt.appendChild(deleteButton);
        receiptsBox.appendChild(receipt);

        let editButton = document.createElement("button");
        editButton.textContent = "Edit"
        editButton.onclick = function () {editReceipt(i);};
        receipt.appendChild(editButton);

    if (receiptData.returned != true) {
        let returnedButton = document.createElement("button");
        returnedButton.textContent = "Mark as returned";
        returnedButton.onclick = function () {
            markAsReturned(i);
        };
        receipt.appendChild(returnedButton);
    }

    }
}
function editReceipt(index) {
    let receiptData = receiptsData[index];
    let newProduct = prompt("Product name:", receiptData.product);
    let newStore = prompt("Store:", receiptData.store);
    let newPrice = prompt("Price:", receiptData.price);

    receiptData.product = newProduct;
    receiptData.price = newPrice;
    receiptData.store = newStore;

    localStorage.setItem("receiptsData", JSON.stringify(receiptsData));
    showReceipts();
    updateDashboard();
    updateInsights();
}
function markAsReturned(index) {
    receiptsData[index].returned = true;

    localStorage.setItem("receiptsData", JSON.stringify(receiptsData));
    showReceipts();
    updateDashboard();
    showAllReceipts();
    updateInsights();
}
function updateDashboard() {
    let returnsSoon = 0;
    let returnableMoney = 0;
    let urgentItem = "None";
    let smalledtDays = Infinity;
    let warrantiesSoon = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let receiptData of receiptsData) {
        let returnDay = new Date(receiptData.returnDate + "T00:00:00");
        let timeDiff = returnDay - today
        let daysLeft = Math.ceil(
            timeDiff / (1000 * 60 * 60 * 24)
        );
        if (receiptData.returned != true && daysLeft >= 0 && daysLeft <= 7) {
            returnsSoon++;
        }
        if (receiptData.returned != true && daysLeft >= 0) {
            returnableMoney = returnableMoney + Number(receiptData.price);
        }
        if (receiptData.returned != true && daysLeft >= 0 && daysLeft < smalledtDays) {
            smalledtDays = daysLeft;
            if (daysLeft == 0) {
                urgentItem = receiptData.product + " - Return Today";
            }
            else {
                urgentItem = receiptData.product + " - " + daysLeft + " days left";
            }
        }
        if (receiptData.warrantyDate) {
            let warrantyDay = new Date(receiptData.warrantyDate + "T00:00:00");
            let warrantyDiff = warrantyDay - today;
            let warrantyDaysLeft = Math.ceil (
                warrantyDiff / (1000 * 60 * 60 * 24)
            );
            if (warrantyDaysLeft >= 0 && warrantyDaysLeft <= 30) {
                warrantiesSoon++;
            }
        }
    }
    document.getElementById("returnsSoon").textContent = returnsSoon;
    document.getElementById("returnableMoney").textContent = returnableMoney;
    document.getElementById("urgentItem").textContent = urgentItem;
    document.getElementById("warrantiesSoon").textContent = warrantiesSoon;

    let urgentBox = document.getElementById("urgentBox");
    if (smalledtDays <= 3) {
        urgentBox.style.borderColor = "#ef4444"
    }
    else {
        urgentBox.style.borderColor = "#475569"
    }
}
function updateInsights() {
    let totalSpent = 0;
    let totalPurchases = receiptsData.length;
    let biggestPurchase = "None";
    let biggestPrice = 0;
    for (let receiptData of receiptsData) {
        totalSpent = totalSpent + Number(receiptData.price);

        if (Number(receiptData.price) > biggestPrice) {
            biggestPrice = Number(receiptData.price);
            biggestPurchase = receiptData.product + " - $" + receiptData.price;
        }
    }
    let averagePurchase = 0;

    if (totalPurchases > 0) {
        averagePurchase = totalSpent / totalPurchases;
    }
    document.getElementById("totalSpent").textContent = totalSpent;
    document.getElementById("totalPurchases").textContent = totalPurchases;
    document.getElementById("averagePurchase").textContent = averagePurchase.toFixed(2);
    document.getElementById("biggestPurchase").textContent = biggestPurchase;
}
function showUrgentReturns() {
    let receipts = document.getElementsByClassName("receipt-card");
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < receiptsData.length; i++) {
        let returnDay = new Date(receiptsData[i].returnDate + "T00:00:00");
        let timeDiff = returnDay - today;
        let daysLeft = Math.ceil(
            timeDiff / (1000 * 60 * 60 * 24)
        );
        if (receiptsData[i].returned != true && daysLeft >= 0 && daysLeft <= 7) {
            receipts[i].style.display = "block";
        }
        else {
            receipts[i].style.display = "none";
        }
    }
}
function showAllReceipts() {
    let receipts = document.getElementsByClassName("receipt-card");
    
    for (let receipt of receipts) {
        receipt.style.display = "block"
    }
}
showReceipts();
updateDashboard();
updateInsights();


