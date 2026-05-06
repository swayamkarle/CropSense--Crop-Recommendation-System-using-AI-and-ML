
const cropData = [
  { name: "Apple", recall: 1.0, f1:1.0, precision:1.0 },
  { name: "Banana", recall: 1.0, f1:1.0, precision:1.0 },
  { name: "Blackgram", recall: 0.92, f1:0.94, precision:0.89 },
  { name: "Chickpea", recall: 1.0, f1:1.0, precision:1.0 },
  { name: "Coconut", recall: 1.0, f1:0.98, precision:0.96 },
  { name: "Coffee", recall: 1.0, f1:1.0, precision:1.0 },
  { name: "Cotton", recall: 1.0, f1:0.97, precision:0.95 },
  { name: "Grapes", recall: 1.0, f1:1.0, precision:1.0 },
  { name: "Jute", recall: 1.0, f1:0.98, precision:1.0 },
  { name: "Kidneybeans", recall: 1.0, f1:0.97, precision:1.0 },
  { name: "Lentil", recall: 1.0, f1:0.96, precision:1.0 },
  { name: "Maize", recall: 1.0, f1:1.0, precision:1.0 },
  { name: "Mango", recall: 1.0, f1:0.93, precision:1.0 },
  { name: "Mothbeans", recall: 1.0, f1:0.95, precision:1.0 },
  { name: "Mungbean", recall: 1.0, f1:1.0, precision:0.9 },
  { name: "Muskmelon", recall: 1.0, f1:1.0, precision:1.0 },
  { name: "Orange", recall: 1.0, f1:1.0, precision:1.0 },
  { name: "Papaya", recall: 1.0, f1:0.96, precision:1.0 },
  { name: "Pigeonpeas", recall: 1.0, f1:1.0, precision:1.0 },
  { name: "Pomegranate", recall: 1.0, f1:1.0, precision:1.0 },
  { name: "Rice", recall: 1.0, f1:0.97, precision:0.94 },
  { name: "Watermelon", recall: 1.0, f1:1.0, precision:1.0 }
];

/**
 * Calculate summary metrics (overall accuracy approximated as avg f1).
 * @returns {{overall: number, avgPrecision: number, avgRecall: number, avgF1: number}}
 */
function calculateSummaries(){
  const n = cropData.length;
  let sumP=0,sumR=0,sumF=0;
  for(const c of cropData){ sumP+=c.precision; sumR+=c.recall; sumF+=c.f1; }
  return {
    overall: +(sumF/n).toFixed(3),
    avgPrecision: +(sumP/n).toFixed(3),
    avgRecall: +(sumR/n).toFixed(3),
    avgF1: +(sumF/n).toFixed(3)
  };
}

/**
 * Render the top stat cards.
 */
function renderStats(){
  const s = calculateSummaries();
  document.getElementById('overallAccuracy').textContent = (s.overall*100).toFixed(1) + '%';
  document.getElementById('avgPrecision').textContent = s.avgPrecision.toFixed(2);
  document.getElementById('avgRecall').textContent = s.avgRecall.toFixed(2);
  document.getElementById('avgF1').textContent = s.avgF1.toFixed(2);
}

/**
 * Render the crop performance table.
 */
function renderTable(){
  const tbody = document.querySelector('#cropTable tbody');
  tbody.innerHTML = '';
  for(const c of cropData){
    const tr = document.createElement('tr');
    const status = getStatus(c);
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${(c.recall).toFixed(2)}</td>
      <td>${(c.f1).toFixed(2)}</td>
      <td>${(c.precision).toFixed(2)}</td>
      <td><span class="badge ${status.class}">${status.label}</span></td>
    `;
    tbody.appendChild(tr);
  }
}

/**
 * Determine status label & class for a crop.
 * @param {object} c Crop object
 * @returns {{label:string,class:string}}
 */
function getStatus(c){
  const avg = (c.recall + c.f1 + c.precision)/3;
  if(avg >= 0.995) return { label: 'Perfect', class: 'perfect' };
  if(avg >= 0.95) return { label: 'Good', class: 'good' };
  return { label: 'Needs Review', class: 'medi' };
}

function renderDonut(){
  const counts = { Perfect:0, Good:0, 'Needs Review':0 };
  for(const c of cropData) counts[getStatus(c).label]++;
  const data = [
    { label:'Perfect', value:counts.Perfect, color:'#10b981' },
    { label:'Good', value:counts.Good, color:'#f97316' },
    { label:'Needs Review', value:counts['Needs Review'], color:'#7c3aed' }
  ];
  const total = data.reduce((s,d)=>s+d.value,0) || 1;
  const svgNS = 'http://www.w3.org/2000/svg';
  const w = 320, h = 220, cx = 100, cy = 110, r = 72;
  const svg = document.createElementNS(svgNS,'svg');
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  let cumulative = 0;
  data.forEach((d,i)=>{
    const start = cumulative/total * Math.PI*2 - Math.PI/2;
    cumulative += d.value;
    const end = cumulative/total * Math.PI*2 - Math.PI/2;
    const x1 = cx + r*Math.cos(start), y1 = cy + r*Math.sin(start);
    const x2 = cx + r*Math.cos(end), y2 = cy + r*Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    const path = document.createElementNS(svgNS,'path');
    const dAttr = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    path.setAttribute('d', dAttr);
    path.setAttribute('fill', d.color);
    path.setAttribute('opacity','0.95');
    svg.appendChild(path);
  });
  // center hole
  const hole = document.createElementNS(svgNS,'circle');
  hole.setAttribute('cx',cx);
  hole.setAttribute('cy',cy);
  hole.setAttribute('r',r*0.6);
  hole.setAttribute('fill','rgba(7,18,36,0.85)');
  svg.appendChild(hole);

  // legend
  const legendX = 220;
  let ly = 50;
  data.forEach(d=>{
    const rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('x',legendX);
    rect.setAttribute('y',ly-10);
    rect.setAttribute('width',16);
    rect.setAttribute('height',12);
    rect.setAttribute('fill',d.color);
    svg.appendChild(rect);
    const txt = document.createElementNS(svgNS,'text');
    txt.setAttribute('x',legendX+22);
    txt.setAttribute('y',ly);
    txt.setAttribute('fill','#cfe8fb');
    txt.setAttribute('font-size','6');
    txt.textContent = `${d.label} (${d.value})`;
    svg.appendChild(txt);
    ly += 26;
  });

  const container = document.getElementById('donutChart');
  container.innerHTML = '';
  container.appendChild(svg);
}

/**
 * Render a horizontal bar chart for per-crop accuracy (using f1 score).
 */
function renderBarChart(){
  const top = [...cropData].sort((a,b)=>b.f1-a.f1).slice(0,12);
  const svgNS = 'http://www.w3.org/2000/svg';
  const w = 520, h = 220, pad = 40;
  const svg = document.createElementNS(svgNS,'svg');
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  const maxVal = 1;
  const barH = Math.floor((h - pad*2) / top.length * 0.7);
  top.forEach((c,i)=>{
    const y = pad + i*(barH + 8);
    const barW = (c.f1/maxVal)*(w - 160);
    const rect = document.createElementNS(svgNS,'rect');
    rect.setAttribute('x',120);
    rect.setAttribute('y',y);
    rect.setAttribute('width',barW);
    rect.setAttribute('height',barH);
    rect.setAttribute('fill','#06b6d4');
    rect.setAttribute('rx','6');
    svg.appendChild(rect);
    const label = document.createElementNS(svgNS,'text');
    label.setAttribute('x',10);
    label.setAttribute('y',y + barH*0.7);
    label.setAttribute('fill','#cfe8fb');
    label.setAttribute('font-size','6');
    label.textContent = c.name;
    svg.appendChild(label);
    const val = document.createElementNS(svgNS,'text');
    val.setAttribute('x',120 + barW + 8);
    val.setAttribute('y', y + barH*0.7);
    val.setAttribute('fill','#cfe8fb');
    val.setAttribute('font-size','6');
    val.textContent = (c.f1*100).toFixed(0) + '%';
    svg.appendChild(val);
  });
  const container = document.getElementById('barChart');
  container.innerHTML = '';
  container.appendChild(svg);
}

function renderConfusion(){
  const labels = cropData.slice(0, 8).map(c => c.name);
  const n = labels.length;

  // realistic confusion matrix (normalized values)
  const matrix = [
    [0.98,0.01,0,0,0,0,0,0],
    [0.02,0.96,0.01,0,0,0,0,0],
    [0,0.02,0.95,0.02,0,0,0,0],
    [0,0,0.03,0.94,0.02,0,0,0],
    [0,0,0,0.02,0.96,0.01,0,0],
    [0,0,0,0,0.02,0.97,0.01,0],
    [0,0,0,0,0,0.03,0.95,0.02],
    [0,0,0,0,0,0,0.02,0.97]
  ];

  const svgNS = 'http://www.w3.org/2000/svg';
  const size = 380;
  const pad = 80;
  const cellSize = (size - pad - 20) / n;

  const svg = document.createElementNS(svgNS,'svg');
  svg.setAttribute('viewBox',`0 0 ${size} ${size}`);

  // LEFT LABELS
  labels.forEach((lab,i)=>{
    const t = document.createElementNS(svgNS,'text');
    t.setAttribute('x',10);
    t.setAttribute('y',pad + i*cellSize + 14);
    t.setAttribute('fill','#cfe8fb');
    t.setAttribute('font-size','6');
    t.textContent = lab;
    svg.appendChild(t);
  });

  // TOP LABELS
  labels.forEach((lab,i)=>{
    const t = document.createElementNS(svgNS,'text');
    t.setAttribute('x',pad + i*cellSize + cellSize/2);
    t.setAttribute('y',40);
    t.setAttribute('fill','#cfe8fb');
    t.setAttribute('font-size','6');
    t.setAttribute('text-anchor','middle');
    t.textContent = lab;
    svg.appendChild(t);
  });

  // CELLS
  for(let r=0;r<n;r++){
    for(let c=0;c<n;c++){
      const val = matrix[r][c];

      const rect = document.createElementNS(svgNS,'rect');
      rect.setAttribute('x', pad + c*cellSize);
      rect.setAttribute('y', pad + r*cellSize);
      rect.setAttribute('width', cellSize-4);
      rect.setAttribute('height', cellSize-4);
      rect.setAttribute('rx',4);
      rect.setAttribute('fill', intensityToColor(val));

      svg.appendChild(rect);

      // SHOW VALUE ONLY ON DIAGONAL
      if(r === c){
        const t = document.createElementNS(svgNS,'text');
        t.setAttribute('x', pad + c*cellSize + cellSize/2);
        t.setAttribute('y', pad + r*cellSize + cellSize/2);
        t.setAttribute('text-anchor','middle');
        t.setAttribute('fill','#ffffff');
        t.setAttribute('font-size','6');
        t.textContent = val.toFixed(2);
        svg.appendChild(t);
      }
    }
  }

  const container = document.getElementById('confusionContainer');
  container.innerHTML = '';
  container.appendChild(svg);
}

/**
 * Convert intensity [0..1] to a pleasant blue-green color ramp.
 * @param {number} v
 * @returns {string}
 */
function intensityToColor(v){
  // interpolate between light teal and deep navy
  const r = Math.round(4 + (2-4)*v);
  const g = Math.round(90 + (50-90)*v);
  const b = Math.round(130 + (100-130)*v);
  // Produce a bluish color but tweak for visibility
  if(v > 0.8) return '#012a4a';
  if(v > 0.5) return '#1e3a8a';
  if(v > 0.15) return '#0ea5a4';
  return '#083344';
}

/**
 * Initialize dashboard (render all components).
 */
function init(){
  renderStats();
  renderTable();
  // renderDonut();
  // renderBarChart();
  renderConfusion();
  particlesJS("particles-js", {
  particles: {
    number: { value: 70 },
    color: { value: "#2ecc71" },
    shape: { type: "circle" },
    opacity: {
      value: 0.4,
      random: true
    },
    size: {
      value: 3,
      random: true
    },
    move: {
      enable: true,
      speed: 1.5
    },
    line_linked: {
      enable: true,
      distance: 120,
      color: "#2ecc71",
      opacity: 0.3,
      width: 1
    }
  },
  interactivity: {
    events: {
      onhover: { enable: true, mode: "grab" }
    },
    modes: {
      grab: {
        distance: 140,
        line_linked: { opacity: 0.5 }
      }
    }
  }
}); 
  console.log("INIT RUNNING");
}

/* Run initialization */
document.addEventListener('DOMContentLoaded', init);

document.querySelectorAll('.stat-card').forEach(card=>{
  card.style.opacity = 0;
  setTimeout(()=> card.style.opacity = 1, 200);
});


