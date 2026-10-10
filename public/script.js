let receiptsData = JSON.parse(localStorage.getItem("receiptsData")) || [];
for (let receipt of receiptsData) {
  if (!receipt.id) {
    receipt.id = crypto.randomUUID();
  }
}
localStorage.setItem("receiptsData", JSON.stringify(receiptsData));

function openReceiptDB() {
  return new Promise(function (resolve, reject) {
    let request = indexedDB.open("receiptrVault", 1);
    request.onupgradeneeded = function () {
      let db = request.result;
      if (!db.objectStoreNames.contains("receiptImages")) {
        db.createObjectStore("receiptImages", {
          keyPath: "id",
        });
      }
    };
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function () {
      reject(request.error);
    };
  });
}
async function saveReceiptImage(id, imageFile) {
  let db = await openReceiptDB();
  return new Promise(function (resolve, reject) {
    let transaction = db.transaction("receiptImages", "readwrite");
    let store = transaction.objectStore("receiptImages");
    store.put({
      id: id,
      image: imageFile,
    });
    transaction.oncomplete = function () {
      db.close();
      resolve();
    };
    transaction.onerror = function () {
      db.close();
      reject(transaction.error);
    };
    transaction.onabort = function () {
      db.close();
      reject(transaction.error);
    };
  });
}
async function viewReceipt(id) {
  let db = await openReceiptDB();
  let savedImage = await new Promise(function (resolve, reject) {
    let transaction = db.transaction("receiptImages", "readonly");
    let store = transaction.objectStore("receiptImages");
    let request = store.get(id);

    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function () {
      reject(request.error);
    };
  });
  db.close();
  if (!savedImage) {
    alert("No receipt image saved for this purchase.");
    return;
  }
  let imageURL = URL.createObjectURL(savedImage.image);
  let viewer = document.createElement("dialog");
  let image = document.createElement("img");
  let closeButton = document.createElement("button");

  image.src = imageURL;
  image.alt = "Saved receipt";
  image.style.maxWidth = "90vw";
  image.style.maxHeight = "80vh";
  image.style.display = "block";

  closeButton.textContent = "Close";
  closeButton.onclick = function () {
    viewer.close();
  };
  viewer.appendChild(closeButton);
  viewer.appendChild(image);
  viewer.addEventListener("close", function () {
    URL.revokeObjectURL(imageURL);
    viewer.remove();
  });
  document.body.appendChild(viewer);
  viewer.showModal();
}
async function deleteReceiptImage(id) {
  let db = await openReceiptDB();
  return new Promise(function (resolve, reject) {
    let transaction = db.transaction("receiptImages", "readwrite");
    let store = transaction.objectStore("receiptImages");
    store.delete(id);
    transaction.oncomplete = function () {
      db.close();
      resolve();
    };
    transaction.onerror = function () {
      db.close();
      reject(transaction.error);
    };
    transaction.onabort = function () {
      db.close();
      reject(transaction.error);
    };
  });
}
async function addPurchase() {
  let product = document.getElementById("product").value;
  let store = document.getElementById("store").value;
  let price = document.getElementById("price").value;
  let currency = document.getElementById("currency").value;
  let purchaseDate = document.getElementById("purchaseDate").value;
  let returnDate = document.getElementById("returnDate").value;
  let warrantyDate = document.getElementById("warrantyDate").value;
  let purchasedItems = [];
  let itemRows = document.querySelectorAll("#detectedItems > div");
  for (let row of itemRows) {
    let name = row.querySelector(".detected-item-name").value.trim();
    let priceText = row.querySelector(".detected-item-price").value.trim();
    let quantity = Number(row.querySelector(".detected-item-quantity").value);

    if (name !== "") {
      purchasedItems.push({
        name: name,
        quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : 1,
        price: priceText === "" ? null : Number(priceText),
      });
    }
  }
  let reciptData = {
    id: crypto.randomUUID(),
    product: product,
    store: store,
    price: price,
    purchaseDate: purchaseDate,
    returnDate: returnDate,
    warrantyDate: warrantyDate,
    returned: false,
    items: purchasedItems,
    currency: currency,
  };

  let imageFile = document.getElementById("receiptImage").files[0];
  if (imageFile) {
    try {
      await saveReceiptImage(reciptData.id, imageFile);
    } catch (error) {
      console.error("Failed to save receipt image:", error);
      alert("Could not save the receipt image. Purchase was not saved.");
      return;
    }
  }
  receiptsData.push(reciptData);
  localStorage.setItem("receiptsData", JSON.stringify(receiptsData));
  document.getElementById("detectedItems").innerHTML = "";
  document.getElementById("detectedItemsSection").hidden = true;
  document.getElementById("receiptImage").value = "";

  const fieldsToClear = [
    "product",
    "store",
    "price",
    "purchaseDate",
    "returnDate",
    "warrantyDate",
  ];
  for (let field of fieldsToClear) {
    document.getElementById(field).value = "";
  }
  document.getElementById("ocrStatus").textContent = "";
  document.getElementById("ocrText").textContent = "";
  showReceipts();
  updateDashboard();
  updateInsights();
}
async function deleteReceipt(index) {
  let receipt = receiptsData[index];
  try {
    await deleteReceiptImage(receipt.id);
  } catch (error) {
    console.error("Failed to delete receipt image:", error);
    alert("Could not delete this receipt. Please try again.");
    return;
  }
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
    if (text.includes(search)) {
      receipt.style.display = "block";
    } else {
      receipt.style.display = "none";
    }
  }
}
function showReceipts() {
  let receiptsBox = document.getElementById("receipts");
  receiptsBox.innerHTML = "";

  for (let i = 0; i < receiptsData.length; i++) {
    let receiptData = receiptsData[i];

    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let returnDay = new Date(receiptData.returnDate + "T00:00:00");
    let timeDiff = returnDay - today;
    let daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    let warrantyDay = new Date(receiptData.warrantyDate + "T00:00:00");
    let WtimeDiff = warrantyDay - today;
    let WdaysLeft = Math.ceil(WtimeDiff / (1000 * 60 * 60 * 24));
    let returnStat;
    if (daysLeft > 0) {
      returnStat = daysLeft + " days left to be returned";
    } else if (daysLeft == 0) {
      returnStat = "Return today";
    } else {
      returnStat = "Return period expired";
    }
    let warrantyStat;
    if (receiptData.warrantyDate) {
      let warrantyDay = new Date(receiptData.warrantyDate + "T00:00:00");
      let WtimeDiff = warrantyDay - today;
      let Wdaysleft = Math.ceil(WtimeDiff / (1000 * 60 * 60 * 24));
      if (WdaysLeft > 0) {
        warrantyStat = WdaysLeft + " days left in the warranty";
      } else if (WdaysLeft == 0) {
        warrantyStat = "Warranty expires today";
      } else {
        warrantyStat = "Warranty expired";
      }
    } else {
      warrantyStat = "No warranty date";
    }
    if (receiptData.returned == true) {
      returnStat = "returned";
    }

    let displayPrice = receiptData.currency
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: receiptData.currency,
        }).format(Number(receiptData.price))
      : receiptData.price + " (Currency not set)";

    let receipt = document.createElement("div");
    receipt.className = "receipt-card";
    receipt.innerHTML =
      "<h3>" +
      receiptData.product +
      "</h3><br>" +
      "Store: " +
      receiptData.store +
      "<br>" +
      "Price: " +
      displayPrice +
      "<br>" +
      "Bought: " +
      receiptData.purchaseDate +
      "<br>" +
      "Return by: " +
      receiptData.returnDate +
      "<br>" +
      warrantyStat +
      "<br>" +
      returnStat;
    if (Array.isArray(receiptData.items) && receiptData.items.length > 0) {
      let details = document.createElement("details");
      let summary = document.createElement("summary");
      summary.textContent =
        "Purchased Items (" + receiptData.items.length + ")";
      details.appendChild(summary);

      let itemList = document.createElement("ul");
      for (let item of receiptData.items) {
        let listItem = document.createElement("li");
        let priceText = "Price unknown";
        if (item.price != null) {
          if (receiptData.currency) {
            priceText = new Intl.NumberFormat("en-Us", {
              style: "currency",
              currency: receiptData.currency,
            }).format(Number(item.price));
          } else {
            priceText = Number(item.price).toFixed(2) + " (Currency not set)";
          }
        }
        let quantity =
          Number.isInteger(item.quantity) && item.quantity > 0
            ? item.quantity
            : 1;

        listItem.textContent = quantity + " x " + item.name + " - " + priceText;
        itemList.appendChild(listItem);
      }
      details.appendChild(itemList);
      receipt.appendChild(details);
    }
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function () {
      deleteReceipt(i);
    };
    receipt.appendChild(deleteButton);
    receiptsBox.appendChild(receipt);

    let editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.onclick = function () {
      editReceipt(i);
    };
    receipt.appendChild(editButton);

    let viewButton = document.createElement("button");
    viewButton.textContent = "View receipt";
    viewButton.onclick = function () {
      viewReceipt(receiptData.id);
    };
    receipt.appendChild(viewButton);

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
  let returnableByCurrency = {};
  let urgentItem = "None";
  let smalledtDays = Infinity;
  let warrantiesSoon = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let receiptData of receiptsData) {
    let returnDay = new Date(receiptData.returnDate + "T00:00:00");
    let timeDiff = returnDay - today;
    let daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    if (receiptData.returned != true && daysLeft >= 0 && daysLeft <= 7) {
      returnsSoon++;
    }
    if (receiptData.returned !== true && daysLeft >= 0) {
      let amount = Number(receiptData.price);
      if (receiptData.price !== "" && Number.isFinite(amount)) {
        let currency = receiptData.currency || "Unknown";
        returnableByCurrency[currency] =
          (returnableByCurrency[currency] || 0) + amount;
      }
    }
    if (
      receiptData.returned != true &&
      daysLeft >= 0 &&
      daysLeft < smalledtDays
    ) {
      smalledtDays = daysLeft;
      if (daysLeft == 0) {
        urgentItem = receiptData.product + " - Return Today";
      } else {
        urgentItem = receiptData.product + " - " + daysLeft + " days left";
      }
    }
    if (receiptData.warrantyDate) {
      let warrantyDay = new Date(receiptData.warrantyDate + "T00:00:00");
      let warrantyDiff = warrantyDay - today;
      let warrantyDaysLeft = Math.ceil(warrantyDiff / (1000 * 60 * 60 * 24));
      if (warrantyDaysLeft >= 0 && warrantyDaysLeft <= 30) {
        warrantiesSoon++;
      }
    }
  }
  document.getElementById("returnsSoon").textContent = returnsSoon;
  let formattedReturnable = Object.entries(returnableByCurrency).map(
    ([currency, amount]) => {
      if (currency === "Unknown") {
        return amount.toFixed(2) + " (Currency not set)";
      }
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount);
    },
  );
  document.getElementById("returnableMoney").textContent =
    formattedReturnable.join(" | ") || "0";
  document.getElementById("urgentItem").textContent = urgentItem;
  document.getElementById("warrantiesSoon").textContent = warrantiesSoon;

  let urgentBox = document.getElementById("urgentBox");
  if (smalledtDays <= 3) {
    urgentBox.style.borderColor = "#ef4444";
  } else {
    urgentBox.style.borderColor = "#475569";
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
    } else {
      storeCounts[receiptData.store] = 1;
    }
    if (receiptData.returned == true) {
      returnedCount++;
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
  let spentByCurrency = {};
  for (let receipt of receiptsData) {
    let currency = receipt.currency || "Unknown";
    let amount = Number(receipt.price);
    if (!Number.isFinite(amount)) continue;

    spentByCurrency[currency] = (spentByCurrency[currency] || 0) + amount;
  }
  let formattedTotals = Object.entries(spentByCurrency).map(
    ([currency, amount]) => {
      if (currency === "Unknown") {
        return amount.toFixed(2) + " (Currency not set)";
      }
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount);
    },
  );
  document.getElementById("totalSpent").textContent =
    formattedTotals.join(" + ") || "0";
  document.getElementById("totalPurchases").textContent = totalPurchases;
  let countByCurrency = {};
  for (let receipt of receiptsData) {
    let currency = receipt.currency || "Unknown";
    let amount = Number(receipt.price);

    if (!Number.isFinite(amount)) continue;
    countByCurrency[currency] = (countByCurrency[currency] || 0) + 1;
  }
  let formattedAverages = Object.entries(spentByCurrency).map(
    ([currency, total]) => {
      let average = total / countByCurrency[currency];
      if (currency === "Unknown") {
        return average.toFixed(2) + " (Currency not set)";
      }
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(average);
    },
  );
  document.getElementById("averagePurchase").textContent =
    formattedAverages.join(" | ") || "0";
  let biggestByCurrency = {};
  for (let receipt of receiptsData) {
    let currency = receipt.currency || "Unkown";
    let amount = Number(receipt.price);
    if (receipt.price === "" || !Number.isFinite(amount)) {
      continue;
    }
    if (
      !(currency in biggestByCurrency) ||
      amount > biggestByCurrency[currency].amount
    ) {
      biggestByCurrency[currency] = {
        name: receipt.product || "Unnamed purchase",
        amount: amount,
      };
    }
  }
  let formattedBiggest = Object.entries(biggestByCurrency).map(
    ([currency, purchase]) => {
      let priceText;
      if (currency === "Unkown") {
        priceText = purchase.amount.toFixed(2) + " (currency not set)";
      } else {
        priceText = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
        }).format(purchase.amount);
      }
      return purchase.name + " - " + priceText;
    },
  );
  document.getElementById("biggestPurchase").textContent =
    formattedBiggest.join(" | ") || "None";
  document.getElementById("topStore").textContent = topStore;
  document.getElementById("returnedCount").textContent = returnedCount;

  updateSpendingChart();
}
let spendingChartInstance = null;
function updateSpendingChart() {
  const canvas = document.getElementById("spendingChart");
  const currencySelect = document.getElementById("chartCurrency");
  const summary = document.getElementById("chartSummary");

  if (!canvas || !currencySelect || !summary) return;
  const validReceipts = receiptsData.filter((receipt) => {
    return (
      receipt.currency &&
      /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(receipt.purchaseDate || "") &&
      receipt.price !== "" &&
      receipt.price != null &&
      Number.isFinite(Number(receipt.price))
    );
  });
  const currencies = [
    ...new Set(validReceipts.map((receipt) => receipt.currency))
  ].sort();
  let selectedCurrency = currencySelect.value;
  currencySelect.innerHTML = "";

  for (const currency of currencies) {
    const option = document.createElement("option");
    option.value = currency;
    option.textContent = currency;
    currencySelect.appendChild(option);
  }

  if (currencies.length === 0) {
    summary.textContent =
    "No purchases with valid dates, prices, and currencies yet.";

    if (spendingChartInstance) {
      spendingChartInstance.destroy();
      spendingChartInstance = null;
    }
    return;
  }
  if (!currencies.includes(selectedCurrency)) {
    selectedCurrency = currencies[0];
  }
  currencySelect.value = selectedCurrency;
  currencySelect.onchange = updateSpendingChart;
  const monthlyTotals = {};
  const selectedReceipts = validReceipts.filter(
    (receipt) => receipt.currency === selectedCurrency
  );
  for (const receipt of selectedReceipts) {
    const month = receipt.purchaseDate.slice(0, 7);

    monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(receipt.price);
  }
  const months = Object.keys(monthlyTotals).sort();
  const labels = months.map((month) => {
    const [year, monthNumber] = month.split("-").map(Number);

    return new Date(year, monthNumber - 1, 1)
      .toLocaleDateString("en-US", {
        month: "short",
        year: "numeric"
      });
  });
  const amounts = months.map((month) => monthlyTotals[month]);
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: selectedCurrency
  });
  const total = amounts.reduce((sum, amount) => sum + amount, 0);

  summary.textContent =
    selectedReceipts.length +
    " purchases | Total: " +
    formatter.format(total);

  if (spendingChartInstance) {
    spendingChartInstance.destroy();
  }
  spendingChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Monthly Spending",
        data: amounts,
        backgroundColor: "#818cf8",
        hoverBackgroundColor: "#a5b4fc",
        borderRadius: 8,
        maxBarThickness: 65
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          label: (context) =>
            formatter.format(context.parsed.y)
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#94a3b8"
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#94a3b8",
          callback: (value) => formatter.format(value)
        },
        grid: {
          color: "#293347"
        }
      }
    }
  });
}
function showUrgentReturns() {
  let receipts = document.getElementsByClassName("receipt-card");
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < receiptsData.length; i++) {
    let returnDay = new Date(receiptsData[i].returnDate + "T00:00:00");
    let timeDiff = returnDay - today;
    let daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    if (receiptsData[i].returned != true && daysLeft >= 0 && daysLeft <= 7) {
      receipts[i].style.display = "block";
    } else {
      receipts[i].style.display = "none";
    }
  }
}
function showAllReceipts() {
  let receipts = document.getElementsByClassName("receipt-card");

  for (let receipt of receipts) {
    receipt.style.display = "block";
  }
}
function preprocessImage(imageFile) {
  return new Promise(function (resolve) {
    let image = new Image();

    image.onload = function () {
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
  let worker = await Tesseract.createWorker("eng", Tesseract.OEM.LSTM_ONLY, {
    logger: function (info) {
      console.log(info);

      if (info.status == "recognizing text") {
        let percent = Math.round(info.progress * 100);
        status.textContent = "Scanning receipt... " + percent + "%";
      }
    },
  });
  await worker.setParameters({
    tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
    preserve_interword_spaces: "1",
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
    } else if (first > 12) {
      day = first;
      month = second;
    } else {
      month = first;
      day = second;
    }
    month = String(month).padStart(2, "0");
    day = String(day).padStart(2, "0");
    let formattedDate = year + "-" + month + "-" + day;
    document.getElementById("purchaseDate").value = formattedDate;
  }
  ocrText.textContent = text;
  status.textContent =
    "Receipt scanned - review the detected information before saving";
}
showReceipts();
updateDashboard();
updateInsights();
