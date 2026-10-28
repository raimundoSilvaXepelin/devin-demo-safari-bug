const $ = (id) => document.getElementById(id);
const state = { store: null, day: null, time: null };

function todayPlus(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function updateButton() {
  $('book').disabled = !(state.store && state.day && state.time && $('name').value.trim());
}

function renderSlots(slots) {
  $('slots').innerHTML = slots.length
    ? slots.map((t) => `<button class="slot${t === state.time ? ' selected' : ''}" data-time="${t}">${t}</button>`).join('')
    : '<span class="muted">No times left this day.</span>';
}

async function loadSlots() {
  state.time = null;
  $('slots').innerHTML = '<span class="muted">Loading times…</span>';
  const res = await fetch(`/api/slots?store=${state.store}&day=${state.day}`);
  const { slots } = await res.json();
  // Render off the critical path so the date picker stays snappy on low-end phones.
  requestIdleCallback(() => renderSlots(slots), { timeout: 500 });
  updateButton();
}

$('slots').addEventListener('click', (e) => {
  const t = e.target.dataset.time;
  if (!t) return;
  state.time = t;
  [...document.querySelectorAll('.slot')].forEach((b) => b.classList.toggle('selected', b.dataset.time === t));
  updateButton();
});

$('store').addEventListener('change', (e) => { state.store = e.target.value; loadSlots(); });
$('day').addEventListener('change', (e) => { state.day = e.target.value; loadSlots(); });
$('name').addEventListener('input', updateButton);

$('book').addEventListener('click', async () => {
  const res = await fetch('/api/bookings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...state, name: $('name').value.trim() }) });
  const b = await res.json();
  $('result').textContent = res.ok ? `Booked! ${b.day} at ${b.time} (${b.id})` : b.error;
});

(async () => {
  const stores = await (await fetch('/api/stores')).json();
  $('store').innerHTML = stores.map((s) => `<option value="${s.id}">${s.name}</option>`).join('');
  state.store = stores[0].id;
  state.day = todayPlus(1);
  $('day').value = state.day;
  $('day').min = todayPlus(0);
  loadSlots();
})();
