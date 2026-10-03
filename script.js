function addPurchase() {
    let product = document.getElementById("product").value;
    let store = document.getElementById("store").value;
    let price = document.getElementById("price").value;
    let purchaseDate = document.getElementById("purchaseDate").value;
    let returnDate = document.getElementById("returnDate").value;
    let receipt = document.createElement("div");
    let deleteButton = document.createElement("button");
    let ImageInput = document.getElementById("receiptImage");
    let ImageFile = ImageInput.files[0];

    receipt.className = "receipt-card";


    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let returnDay = new Date(returnDate);
    let timeDiff = returnDay - today;
    let daysleft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    receipt.textContent = product + " - " + store + " - $" + price + " Bought: " + purchaseDate + " Return by: " + returnDate + "  " + daysleft + " days left  ";

    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("onclick", "deleteReceipt(this)");
    receipt.appendChild(deleteButton);

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

    document.getElementById("receipts").appendChild(receipt);
    localStorage.setItem(
        "receipts",
        document.getElementById("receipts").innerHTML
    );
}
let savedReceipts = localStorage.getItem("receipts");
if (savedReceipts) {
    document.getElementById("receipts").innerHTML = savedReceipts;
}
function deleteReceipt(button) {
    button.parentElement.remove();
    localStorage.setItem(
        "receipts",
        document.getElementById("receipts").innerHTML
    );
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