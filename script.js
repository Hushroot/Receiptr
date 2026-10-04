let receiptsData = JSON.parse(localStorage.getItem("receiptsData")) || [];
function addPurchase() {
    let product = document.getElementById("product").value;
    let store = document.getElementById("store").value;
    let price = document.getElementById("price").value;
    let purchaseDate = document.getElementById("purchaseDate").value;
    let returnDate = document.getElementById("returnDate").value;
    let ImageInput = document.getElementById("receiptImage");
    let ImageFile = ImageInput.files[0];
    let reciptData ={
        product: product, store: store, price: price, purchaseDate: purchaseDate, returnDate: returnDate
    };
    receiptsData.push(reciptData);
    localStorage.setItem("receiptsData", JSON.stringify(receiptsData));
    showReceipts();



    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let returnDay = new Date(returnDate + "T00:00:00");
    let timeDiff = returnDay - today;
    let daysleft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))


    if (ImageFile) {
        let reader = new FileReader();
        reader.onload = function () {
            let image = document.createElement("img");
            image.src = reader.result;
            image.className = "receipt-image";
            receipt.appendChild(image);
            localStorage.setItem(
                "receipts",
                document.getElementById("receipts").innerHTML
            );
        };
        reader.readAsDataURL(ImageFile);
    }
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
        let receipt = document.createElement("div");
        receipt.className = "receipt-card";
        receipt.innerHTML =
            "<h3>" + receiptData.product + "</h3><br>" +
            "Store: " + receiptData.store + "<br>" +
            "Price: $" + receiptData.price + "<br>" +
            "Bought: " + receiptData.purchaseDate + "<br>" +
            "Return by: " + receiptData.returnDate;
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