let receiptsData = JSON.parse(localStorage.getItem("receiptsData")) || [];
function addPurchase() {
    let product = document.getElementById("product").value;
    let store = document.getElementById("store").value;
    let price = document.getElementById("price").value;
    let purchaseDate = document.getElementById("purchaseDate").value;
    let returnDate = document.getElementById("returnDate").value;
    let warrantyDate = document.getElementById("warrantyDate").value;
    let reciptData ={
        product: product, store: store, price: price, purchaseDate: purchaseDate, returnDate: returnDate, warrantyDate: warrantyDate
    };
    receiptsData.push(reciptData);
    localStorage.setItem("receiptsData", JSON.stringify(receiptsData));
    showReceipts();
}
function deleteReceipt(index) {
    receiptsData.splice(index, 1);
    localStorage.setItem("receiptsData", JSON.stringify(receiptsData));
    showReceipts();
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

}
showReceipts();