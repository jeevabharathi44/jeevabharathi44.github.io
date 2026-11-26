// Spotlight mouse-tracking glow on bento cards
document.querySelectorAll('.bento.spotlight').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
});

// Copy email
const copyBtn = document.getElementById('copyBtn');
const toast = document.getElementById('toast');
copyBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('jeevabharathi443@gmail.com'); } catch (_) {}
  toast.hidden = false;
  setTimeout(() => (toast.hidden = true), 2000);
});

// Lab tabs
document.querySelectorAll('.lab-tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lab-tab').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.lab-pane').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`pane-${btn.dataset.tab}`).classList.add('active');
  });
});

const fmtINR = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

// EBM Simulator
const inIncome = document.getElementById('inIncome');
const inLoan = document.getElementById('inLoan');
const inCibil = document.getElementById('inCibil');
const inTenure = document.getElementById('inTenure');

function updateEBM() {
  const income = Number(inIncome.value);
  const loan = Number(inLoan.value);
  const cibil = Number(inCibil.value);
  const months = Number(inTenure.value);

  document.getElementById('valIncome').textContent = fmtINR(income);
  document.getElementById('valLoan').textContent = fmtINR(loan);
  document.getElementById('valCibil').textContent = cibil;
  document.getElementById('valTenure').textContent = `${months} mo`;

  const r = 0.12 / 12;
  const emi = (loan * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const dti = (emi / income) * 100;

  const cibilL = cibil >= 750 ? 1.35 : cibil >= 650 ? 0.45 : cibil >= 550 ? -0.45 : -1.8;
  const dtiL = dti <= 35 ? 0.95 : dti <= 50 ? 0.1 : -1.25;
  const incL = income >= 50000 ? 0.55 : income >= 30000 ? 0.15 : -0.4;
  const total = cibilL + dtiL + incL;

  let dec = 'REVIEW_REQUIRED';
  let col = 'var(--amber)';
  if (cibil < 550 || dti > 65) { dec = 'DECLINED'; col = 'var(--red)'; }
  else if (total >= 1.1 && dti <= 45 && cibil >= 700) { dec = 'PRELIMINARY_ELIGIBLE'; col = 'var(--emerald)'; }

  const decEl = document.getElementById('ebmDecision');
  decEl.textContent = dec;
  decEl.style.color = col;
  document.getElementById('ebmEmi').textContent = fmtINR(emi);
  document.getElementById('ebmDti').textContent = `${dti.toFixed(1)}%`;

  const rows = [
    { name: 'CIBIL Score', val: cibilL },
    { name: 'EMI / Income', val: dtiL },
    { name: 'Income Tier', val: incL },
  ];
  document.getElementById('ebmWaterfall').innerHTML = rows
    .map((x) => {
      const pct = Math.min(100, Math.abs(x.val) * 52);
      const cls = x.val >= 0 ? 'pos' : 'neg';
      return `<div class="wf-row"><span>${x.name}</span><div class="wf-track"><div class="wf-bar ${cls}" style="width:${pct}%"></div></div><span class="mono-dim">${x.val >= 0 ? '+' : ''}${x.val.toFixed(2)}</span></div>`;
    })
    .join('');
}
[inIncome, inLoan, inCibil, inTenure].forEach((el) => el.addEventListener('input', updateEBM));
updateEBM();

// Regex Parser
const emailInput = document.getElementById('emailInput');
const regexTableBody = document.getElementById('regexTableBody');
const regexTotal = document.getElementById('regexTotal');
const samples = [
  `Hi Team,\nPlease process the following order:\n- 2x Mechanical Keyboard @ Rs. 3499\n- 1x USB-C Hub @ Rs. 1250\n- 3x Braided HDMI Cable @ Rs. 450\nThanks, Jeeva`,
  `Order Confirmation #409:\nItem: Wireless Mouse | Qty: 4 | Price: ₹899\nItem: Laptop Stand | Qty: 2 | Price: ₹1499\nItem: Desk Mat | Qty: 1 | Price: ₹650`,
];
let sIdx = 0;

function parseEmail() {
  const txt = emailInput.value;
  const rows = [];
  for (const m of txt.matchAll(/(\d+)\s*x\s+([^@\n]+?)\s*@\s*(?:Rs\.?|₹|INR)?\s*([\d,]+(?:\.\d{1,2})?)/gi)) {
    rows.push({ item: m[2].trim(), qty: Number(m[1]), price: Number(m[3].replace(/,/g, '')) });
  }
  for (const m of txt.matchAll(/Item:\s*([^|\n]+?)\s*\|\s*Qty:\s*(\d+)\s*\|\s*Price:\s*(?:Rs\.?|₹|INR)?\s*([\d,]+(?:\.\d{1,2})?)/gi)) {
    rows.push({ item: m[1].trim(), qty: Number(m[2]), price: Number(m[3].replace(/,/g, '')) });
  }
  let total = 0;
  regexTableBody.innerHTML = rows.length
    ? rows.map((r) => {
        const sub = r.qty * r.price;
        total += sub;
        return `<tr><td>${r.item}</td><td class="mono-dim">${r.qty}</td><td class="mono-dim">${fmtINR(r.price)}</td><td class="mono-dim">${fmtINR(sub)}</td></tr>`;
      }).join('')
    : '<tr><td colspan="4">No matching lines found.</td></tr>';
  regexTotal.textContent = fmtINR(total);
}
emailInput.addEventListener('input', parseEmail);
document.getElementById('loadSampleEmail').addEventListener('click', () => {
  sIdx = (sIdx + 1) % samples.length;
  emailInput.value = samples[sIdx];
  parseEmail();
});
parseEmail();

// Driving Scenario JSON
const scenarios = [
  {
    text: 'Ego vehicle cruising at 95 km/h on a wet highway at night in heavy rain while a truck cuts into the lane ahead, triggering hard braking.',
    risk: 0.82, level: 'HIGH',
    json: { road_type: 'highway', weather: 'rain', time_of_day: 'night', ego_speed_kmh: 95, ego_maneuver: 'hard_braking', actors: ['truck'], schema_valid: true },
  },
  {
    text: 'Driving at 28 km/h through an urban school zone in light fog during morning rush hour with pedestrians near the crosswalk.',
    risk: 0.56, level: 'MEDIUM',
    json: { road_type: 'urban', weather: 'fog', time_of_day: 'morning', ego_speed_kmh: 28, ego_maneuver: 'slowing', actors: ['pedestrian'], schema_valid: true },
  },
  {
    text: 'Clear afternoon highway merge at 60 km/h with light traffic and no sudden maneuvers.',
    risk: 0.21, level: 'LOW',
    json: { road_type: 'highway', weather: 'clear', time_of_day: 'afternoon', ego_speed_kmh: 60, ego_maneuver: 'lane_merge', actors: ['car'], schema_valid: true },
  },
];
function setScenario(i) {
  const s = scenarios[i];
  document.getElementById('scText').textContent = s.text;
  document.getElementById('scRiskLabel').textContent = `${s.risk.toFixed(2)} (${s.level})`;
  document.getElementById('scRiskBar').style.width = `${Math.round(s.risk * 100)}%`;
  document.getElementById('scJson').textContent = JSON.stringify(s.json, null, 2);
}
document.querySelectorAll('.sc-btn').forEach((b) =>
  b.addEventListener('click', () => {
    document.querySelectorAll('.sc-btn').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    setScenario(Number(b.dataset.sc));
  })
);
setScenario(0);
