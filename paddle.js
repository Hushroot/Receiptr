import { PaddleOCR } from "@paddleocr/paddleocr-js";
let ocr;

async function scanReceiptPaddle() {
    let imageInput = document.getElementById("receiptImage");
    let status = document.getElementById("ocrStatus");
    let ocrText = document.getElementById("ocrText");

    if (imageInput.files.length == 0) {
        status.textContent = "Please choose a receipt image first";
        return;
    }

    document.getElementById("store").value = "";
    document.getElementById("price").value = "";
    document.getElementById("purchaseDate").value = "";
    status.textContent = "Loading PaddleOCR...";
    
    if (!ocr) {
        ocr = await PaddleOCR.create({
            textDetectionModelName: "PP-OCRv5_mobile_det",
            textRecognitionModelName: "PP-OCRv5_mobile_rec",
            ortOptions: {
                backend: "auto"
            } 
        });
    }
    status.textContent = "Scanning receipt..";
    let image = imageInput.files[0];
    let results = await ocr.predict(image);
    let result = results[0];
    let text = "";

    for (let item of result.items) {
        text = text + item.text + "\n";
    }

    let lines = text.split("\n");
    let cleanLines = [];

    for (let line of lines) {
        if (line.trim() != "") {
            cleanLines.push(line.trim());
        }
    }
    if (cleanLines.length > 0) {
        document.getElementById("store").value = cleanLines[0];
    }
    let dateMatch = text.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);

    if (dateMatch) {
        let month = Number(dateMatch[1]);
        let day = Number(dateMatch[2]);
        let year = dateMatch[3];
        if (year.length == 2) {
            year = "20" + year;
        }
        month = String(month).padStart(2, "0");
        day = String(day).padStart(2, "0");

        document.getElementById("purchaseDate").value = year + "-" + month + "-" + day;
    }
    if (!dateMatch) {
        let textDateMatch = text.match(
            /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(\d{1,2})['’,-]?\s*(\d{2,4})/i
        );
        if (textDateMatch) {
            let monthNames = {
                jan: "01",
                feb: "02",
                mar: "03",
                apr: "04",
                may: "05",
                jun: "06",
                jul: "07",
                aug: "08",
                sep: "09",
                oct: "10",
                nov: "11",
                dec: "12"
            };
            let month = monthNames[textDateMatch[1].toLowerCase()];
            let day = textDateMatch[2].padStart(2, "0");
            let year = textDateMatch[3];
            if (year.length == 2) {
                year = "20" + year;
            }
            document.getElementById("purchaseDate").value = year + "-" + month + "-" + day;
        }
    }

    for (let i = 0; i < cleanLines.length; i++) {
        let line = cleanLines[i].toLowerCase();

        if (
            line.includes("total") &&
            !line.includes("sub total") &&
            !line.includes("subtotal")
        ) {
            let amountMatch = cleanLines[i].match(/(\d+[.,]\d{2})/);
            if (!amountMatch && i + 1 < cleanLines.length) {
                amountMatch = cleanLines[i + 1].match(/(\d+[.,]\d{2})/);
            }
            if (amountMatch) {
                let price = amountMatch[1].replace(",", ".");
                document.getElementById("price").value = price;
                break;
            }
        }
    }

    ocrText.textContent = text;
    let missingFields = [];
    if (document.getElementById("store").value == "") {
        missingFields.push("store");
    }

    if (document.getElementById("price").value == "") {
        missingFields.push("total");
    }

    if (document.getElementById("purchaseDate").value == "") {
        missingFields.push("date");
    }

    if ( missingFields.length == 0) {
        status.textContent = "Receipt scanned - check the detected store, date, and total before saving"
    }
    else {
        status.textContent = "Receipt scanned - please enter manually: " + missingFields.join(", ");
    }
    console.log(result);
}
window.scanReceiptPaddle = scanReceiptPaddle;