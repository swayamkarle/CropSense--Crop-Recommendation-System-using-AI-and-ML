const canvas = document.getElementById("dots");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
  canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
}
window.addEventListener("resize", resize);
resize();

const dpr = devicePixelRatio || 1;
const w = () => canvas.width;
const h = () => canvas.height;

const dots = [];
const COUNT = 90;

function init(){
  dots.length = 0;
  for(let i=0;i<COUNT;i++){
    dots.push({
      x: Math.random()*w(),
      y: Math.random()*h(),
      r: (Math.random()*2.0 + 0.7) * dpr,
      vx: (Math.random()*0.4 - 0.2) * dpr,
      vy: (Math.random()*0.35 - 0.17) * dpr
    });
  }
}
init();

function draw(){
  ctx.clearRect(0,0,w(),h());

  // subtle tint
  ctx.fillStyle = "rgba(70,255,106,0.03)";
  ctx.fillRect(0,0,w(),h());

  for (const p of dots){
    p.x += p.vx;
    p.y += p.vy;

    if(p.x < -20) p.x = w()+20;
    if(p.x > w()+20) p.x = -20;
    if(p.y < -20) p.y = h()+20;
    if(p.y > h()+20) p.y = -20;

    // dots
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    const alpha = Math.min(0.55, (p.r/4));
    ctx.fillStyle = `rgba(120,255,190,${alpha})`;
    ctx.fill();
  }

  requestAnimationFrame(draw);
}
draw();

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("href");
    const target = document.querySelector(targetId);

    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

const soilImageInput = document.getElementById("soilImage");
const previewBlock = document.getElementById("imagePreviewBlock");
const previewImage = document.getElementById("previewImage");
const analyzeBtn = document.getElementById("analyzeBtn");
const analysisLoading = document.getElementById("analysisLoading");

function getSoilResultFromImage(imageSrc, callback) {
  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 120;
    canvas.height = 120;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      totalR += r;
      totalG += g;
      totalB += b;
      count++;
    }

    const avgR = totalR / count;
    const avgG = totalG / count;
    const avgB = totalB / count;
    const brightness = (avgR + avgG + avgB) / 3;

    let soilType = "";
    let crops = "";

    if (brightness < 85) {
      soilType = "Black_Soil";
      crops = "Cotton, Wheat, Jowar, Millets, Linseed";
    } else if (avgR > avgG + 18 && avgR > avgB + 28) {
      soilType = "Red_Soil";
      crops = "Cotton, Wheat, Pulses, Potatoes, Millets";
    } else if (
  avgR > 110 &&
  avgG > 90 &&
  avgB < 125 &&
  avgR >= avgG
) {
      soilType = "Alluvial_Soil";
      crops = "Rice, Wheat, Sugarcane, Maize, Cotton, Soyabean, Jute";
    } else {
      soilType = "Clay_Soil";
      crops = "Rice, Lettuce, Broccoli, Cabbage, Beans";
    }

    console.log("Detected values:", {
  avgR: Math.round(avgR),
  avgG: Math.round(avgG),
  avgB: Math.round(avgB),
  brightness: Math.round(brightness),
  soilType
});


    callback({ soilType, crops });
  };

  img.src = imageSrc;
}


if (soilImageInput && previewBlock && previewImage && analyzeBtn) {
  soilImageInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const imageData = e.target.result;
      previewImage.src = imageData;
      previewBlock.classList.add("is-visible");
      analyzeBtn.disabled = false;
      analyzeBtn.classList.add("is-active");
      localStorage.setItem("soilUploadedImage", imageData);
    };
    reader.readAsDataURL(file);
  });

  analyzeBtn.addEventListener("click", () => {
    const storedImage = localStorage.getItem("soilUploadedImage");
    if (!storedImage) return;

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "ANALYZING...";
    if (analysisLoading) analysisLoading.classList.add("is-visible");

    setTimeout(() => {
      getSoilResultFromImage(storedImage, ({ soilType, crops }) => {
        localStorage.setItem("soilDetectedType", soilType);
        localStorage.setItem("soilRecommendedCrops", crops);
        window.location.href = "soil-result.html";
      });
    }, 1800);
  });
}

// performance
const interactivePie = document.getElementById("interactivePie");
const pieTooltip = document.getElementById("pieTooltip");

if (interactivePie && pieTooltip) {
  const hotspots = interactivePie.querySelectorAll(".pie-hotspot");

  hotspots.forEach((spot) => {
    spot.addEventListener("mousemove", (e) => {
      const label = spot.dataset.label;
      const value = spot.dataset.value;

      pieTooltip.innerHTML = `${label}<br>${value}`;
      pieTooltip.classList.add("is-visible");

      const rect = interactivePie.getBoundingClientRect();
      const left = e.clientX - rect.left;
      const top = e.clientY - rect.top;

      pieTooltip.style.left = `${left}px`;
      pieTooltip.style.top = `${top}px`;
    });

    spot.addEventListener("mouseleave", () => {
      pieTooltip.classList.remove("is-visible");
    });
  });
}

// prediciton form
const cropForm = document.getElementById("cropPredictionForm");
const cropResultCard = document.getElementById("cropResultCard");
const predictedCropText = document.getElementById("predictedCropText");
const downloadCropPdfBtn = document.getElementById("downloadCropPdfBtn");

async function loadCropDataset() {
  const response = await fetch("assets/crop.csv");
  if (!response.ok) {
    throw new Error("Could not load CSV file");
  }

  const text = await response.text();
  const lines = text.trim().split(/\r?\n/);
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return {
      N: Number(values[0]),
      P: Number(values[1]),
      K: Number(values[2]),
      temperature: Number(values[3]),
      humidity: Number(values[4]),
      ph: Number(values[5]),
      rainfall: Number(values[6]),
      label: values[7].trim()
    };
  });
}

function getRanges(dataset) {
  const keys = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"];
  const ranges = {};
  keys.forEach((key) => {
    const values = dataset.map((row) => row[key]);
    ranges[key] = { min: Math.min(...values), max: Math.max(...values) };
  });
  return ranges;
}

function normalize(value, min, max) {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

function predictCropKNN(input, dataset, k = 5) {
  const ranges = getRanges(dataset);

  const distances = dataset.map((row) => {
    const keys = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"];
    let sum = 0;

    keys.forEach((key) => {
      const a = normalize(input[key], ranges[key].min, ranges[key].max);
      const b = normalize(row[key], ranges[key].min, ranges[key].max);
      sum += Math.pow(a - b, 2);
    });

    return {
      label: row.label,
      distance: Math.sqrt(sum)
    };
  });

  distances.sort((a, b) => a.distance - b.distance);

  const nearest = distances.slice(0, k);
  const votes = {};

  nearest.forEach((item) => {
    const weight = 1 / (item.distance + 0.0001);
    votes[item.label] = (votes[item.label] || 0) + weight;
  });

  return Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
}

if (cropForm && cropResultCard && predictedCropText) {
  console.log("Crop prediction form found");

  let cropDataset = null;

  cropForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Predict button clicked");

    try {
      if (!cropDataset) {
        cropDataset = await loadCropDataset();
        console.log("CSV loaded", cropDataset.length);
      }

      const input = {
        N: Number(document.getElementById("nitrogenInput").value),
        P: Number(document.getElementById("phosphorusInput").value),
        K: Number(document.getElementById("potassiumInput").value),
        temperature: Number(document.getElementById("temperatureInput").value),
        humidity: Number(document.getElementById("humidityInput").value),
        ph: Number(document.getElementById("phInput").value),
        rainfall: Number(document.getElementById("rainfallInput").value)
      };

      console.log("Input values", input);

      const crop = predictCropKNN(input, cropDataset, 5);
      console.log("Predicted crop", crop);

      predictedCropText.textContent = crop;
      cropResultCard.classList.add("is-visible");

      if (downloadCropPdfBtn) {
        downloadCropPdfBtn.onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // 🎨 HEADER (with color)
  doc.setFillColor(34, 139, 34); // green
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("CropSense AI Report", 20, 20);

  // Reset color
  doc.setTextColor(0, 0, 0);

  // 📅 Date
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleString()}`, 140, 40);

  // 🌾 Prediction Result
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Predicted Crop:", 20, 50);

  doc.setTextColor(0, 128, 0);
  doc.text(crop.toUpperCase(), 20, 60);

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  // 📊 Table Title
  doc.setFontSize(14);
  doc.text("Input Parameters", 20, 80);

  // 📋 Table (manual layout)
  const startY = 90;
  const rowHeight = 10;

  const data = [
    ["Nitrogen (N)", input.N],
    ["Phosphorus (P)", input.P],
    ["Potassium (K)", input.K],
    ["Temperature (°C)", input.temperature],
    ["Humidity (%)", input.humidity],
    ["pH Value", input.ph],
    ["Rainfall (mm)", input.rainfall],
  ];

  data.forEach((row, index) => {
    const y = startY + index * rowHeight;

    // Label
    doc.setFont("helvetica", "bold");
    doc.text(row[0], 20, y);

    // Value
    doc.setFont("helvetica", "normal");
    doc.text(String(row[1]), 120, y);
  });

  // 📌 Footer
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("Generated by CropSense AI", 20, 200);

  // 💾 Save
  doc.save("Crop_Prediction_Report.pdf");
};
      }
    } catch (error) {
      console.error("Crop prediction error:", error);
      alert("Prediction failed. Check console.");
    }
  });
} else {
  console.log("Crop prediction elements not found");
}
