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
            let WtimeDiff = warrantyDay - today;
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
    let storeCounts = {};
    let returnedCount = 0;
    for (let receiptData of receiptsData) {
        totalSpent = totalSpent + Number(receiptData.price);

        if (Number(receiptData.price) > biggestPrice) {
            biggestPrice = Number(receiptData.price);
            biggestPurchase = receiptData.product + " - $" + receiptData.price;
        }

        if (storeCounts[receiptData.store]) {
            storeCounts[receiptData.store]++;
        }
        else {
            storeCounts[receiptData.store] = 1;
        }
        if (receiptData.returned == true) {
            returnedCount++
        }
    }
    let averagePurchase = 0;

    if (totalPurchases > 0) {
        averagePurchase = totalSpent / totalPurchases;
    }

    let topStore = "None";
    let topStoreCount = 0;
    for (let store in storeCounts) {
        if (storeCounts[store] > topStoreCount) {
            topStoreCount = storeCounts[store];
            topStore = store;
        }
    }
    document.getElementById("totalSpent").textContent = totalSpent;
    document.getElementById("totalPurchases").textContent = totalPurchases;
    document.getElementById("averagePurchase").textContent = averagePurchase.toFixed(2);
    document.getElementById("biggestPurchase").textContent = biggestPurchase;
    document.getElementById("topStore").textContent = topStore;
    document.getElementById("returnedCount").textContent = returnedCount;
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
function preprocessImage(imageFile) {
    return new Promise(function(resolve) {
        let image = new Image();

        image.onload = function() {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            canvas.width = image.width * 2;
            canvas.height = image.height * 2;
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let pixels = imageData.data;

            for (let i = 0; i < pixels.length; i += 4) {
                let gray =
                    pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
                
                pixels[i] = gray;
                pixels[i + 1] = gray;
                pixels[i + 2] = gray;
            }
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas);
        };
        image.src = URL.createObjectURL(imageFile);
    });
}
async function scanReceipt() {
    let imageInput = document.getElementById("receiptImage");
    let status = document.getElementById("ocrStatus");
    let ocrText = document.getElementById("ocrText");

    if (imageInput.files.length == 0) {
        status.textContent = "Please choose a receipt image first";
        return;
    }
    let image = imageInput.files[0];
    let processedImage = await preprocessImage(image);
    document.getElementById("store").value = "";
    document.getElementById("price").value = "";
    document.getElementById("purchaseDate").value = "";
    status.textContent = "Scanning receipt...";
    ocrText.textContent = "";
    let worker = await Tesseract.createWorker("eng",
        Tesseract.OEM.LSTM_ONLY,
        {
            logger: function (info) {
                console.log(info);

                if(info.status == "recognizing text") {
                    let percent = Math.round(info.progress * 100);
                    status.textContent = "Scanning receipt... " + percent + "%";
                }
            }
        }
    );
    await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
        preserve_interword_spaces: "1"
    });
    let result = await worker.recognize(image);
    await worker.terminate();
    let text = result.data.text;
    let totalMatch = text.match(/total\s*[:\-]?\s*[a-z]*\s*(\d+[.,]\d{2})/i);

    if (totalMatch) {
        let price = totalMatch[1];
        price = price.replace(",", ".");
        document.getElementById("price").value = price;
    }

    let dateMatch = text.match(/(\d{1,2})[.,\/](\d{1,2})[.,\/](\d{4})/);

    if (dateMatch) {
        let first = Number(dateMatch[1]);
        let second = Number(dateMatch[2]);
        let year = dateMatch[3];
        
        let day;
        let month;

        if (second > 12) {
            month = first;
            day = second;
        }
        else if (first > 12) {
            day = first;
            month = second;
        }
        else {
            month = first;
            day = second;
        }
        month = String(month).padStart(2, "0");
        day = String(day).padStart(2, "0");
        let formattedDate = year + "-" + month + "-" + day;
        document.getElementById("purchaseDate").value = formattedDate;
    }
    ocrText.textContent = text;
    status.textContent = "Receipt scanned - review the detected information before saving";
}
showReceipts();
updateDashboard();
updateInsights();




