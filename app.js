// app.js — Demo only; no external deps

const DATA = {
  tutors: './data/mock_tutors.json',
  events: './data/mock_events.json',
  subjects: './data/mock_subjects.json',
};

const SLOT_MINUTES = 30; // grid slot size
const DAY_MS = 24 * 60 * 60 * 1000;

const el = (sel) => document.querySelector(sel);
const tutorListEl = el('#tutorList');
const subjectFilterEl = el('#subjectFilter');
const subjectListEl = el('#subjectList');
const gridEl = el('#grid');
const legendEl = el('#legend');
const startDateEl = el('#startDate');
const resetBtn = el('#resetFilters');

let state = {
  tutors: [],
  events: [],
  subjects: [],
  selectedTutorIds: new Set(),
  subjectQuery: '',
  weekStartISO: null,
};

async function loadJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeek(d) {
  // Monday-based week; adjust if you want Sunday-based
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = (day === 0 ? -6 : 1 - day); // move to Monday
  const nd = new Date(d);
  nd.setDate(d.getDate() + diff);
  nd.setHours(0,0,0,0);
  return nd;
}

function timeToMinutes(hhmm) {
  const [h,m] = hhmm.split(':').map(Number);
  return h*60 + m;
}
function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function intervalSubtract(avail, bookings) {
  // avail: array of [startMin, endMin], bookings same
  // returns availability minus overlaps with bookings
  let free = [...avail];
  for (const b of bookings) {
    const [bs, be] = b;
    const next = [];
    for (const a of free) {
      const [as, ae] = a;
      if (be <= as || bs >= ae) {
        next.push(a); // no overlap
      } else {
        // overlap cases
        if (bs > as) next.push([as, Math.max(as, Math.min(bs, ae))]);
        if (be < ae) next.push([Math.max(as, Math.min(be, ae)), ae]);
      }
    }
    free = next.filter(([s,e]) => e - s > 0);
  }
  return free;
}

function buildDaySlots(minStart, minEnd) {
  const slots = [];
  for (let m = minStart; m < minEnd; m += SLOT_MINUTES) {
    slots.push([m, m + SLOT_MINUTES]);
  }
  return slots;
}

function segmentsToSlots(segments, minStart, minEnd) {
  const slots = buildDaySlots(minStart, minEnd);
  const result = new Array(slots.length).fill('busy');
  for (let i = 0; i < slots.length; i++) {
    const [ss, ee] = slots[i];
    for (const [as, ae] of segments) {
      if (ee > as && ss < ae) {
        result[i] = 'free';
        break;
      }
    }
  }
  return result;
}

function parseDailyAvail(availObj, weekday) {
  // availObj example: { "mon": ["08:00-12:00", "13:00-17:00"], ... }
  const map = {0:'sun',1:'mon',2:'tue',3:'wed',4:'thu',5:'fri',6:'sat'};
  const key = map[weekday];
  const arr = availObj[key] || [];
  return arr.map(r => {
    const [s,e] = r.split('-');
    return [timeToMinutes(s), timeToMinutes(e)];
  });
}

function collectBookings(events, tutorId, dateISO) {
  // events: [{tutor_id,date:"YYYY-MM-DD",start:"HH:MM",end:"HH:MM"}, ...]
  const day = events.filter(e => e.tutor_id === tutorId && e.date === dateISO);
  return day.map(e => [timeToMinutes(e.start), timeToMinutes(e.end)]);
}

function containsSubject(subjectsStr, query) {
  if (!query) return true;
  return subjectsStr.toLowerCase().includes(query.toLowerCase());
}

function renderTutorList() {
  tutorListEl.innerHTML = '';
  const subjectsQ = state.subjectQuery;
  const items = state.tutors.filter(t =>
    containsSubject(t.subjects || '', subjectsQ)
  );
  for (const t of items) {
    const row = document.createElement('label');
    row.className = 'tutor-pill';
    const sw = document.createElement('span');
    sw.className = 'tutor-swatch';
    sw.style.background = t.color || '#888';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = state.selectedTutorIds.has(t.id);
    cb.addEventListener('change', () => {
      if (cb.checked) state.selectedTutorIds.add(t.id);
      else state.selectedTutorIds.delete(t.id);
      renderLegend();
      renderGrid();
    });
    const name = document.createElement('span');
    name.textContent = `${t.name} — ${t.subjects || 'Subjects N/A'}`;
    row.appendChild(cb);
    row.appendChild(sw);
    row.appendChild(name);
    tutorListEl.appendChild(row);
  }
}

function renderLegend() {
  legendEl.innerHTML = '';
  for (const t of state.tutors) {
    if (!state.selectedTutorIds.has(t.id)) continue;
    const item = document.createElement('div');
    item.className = 'item';
    const sw = document.createElement('span');
    sw.className = 'tutor-swatch';
    sw.style.background = t.color || '#888';
    const nm = document.createElement('span');
    nm.textContent = t.name;
    item.appendChild(sw);
    item.appendChild(nm);
    legendEl.appendChild(item);
  }
}

function renderGrid() {
  gridEl.innerHTML = '';

  const start = new Date(state.weekStartISO);
  const days = Array.from({length: 7}, (_,i) => new Date(start.getTime() + i*DAY_MS));
  const minStart = 8*60;  // 08:00
  const minEnd   = 20*60; // 20:00

  // Header row
  const headerTime = document.createElement('div');
  headerTime.className = 'cell time';
  headerTime.textContent = '';
  gridEl.appendChild(headerTime);

  for (const d of days) {
    const h = document.createElement('div');
    h.className = 'cell';
    h.textContent = d.toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'});
    gridEl.appendChild(h);
  }

  const slots = buildDaySlots(minStart, minEnd);
  for (const [ss, ee] of slots) {
    const timeCell = document.createElement('div');
    timeCell.className = 'cell time';
    timeCell.textContent = `${minutesToTime(ss)}`;
    gridEl.appendChild(timeCell);

    for (const d of days) {
      const dateISO = isoDate(d);
      const cell = document.createElement('div');
      cell.className = 'cell';

      // merge availability across all selected tutors -> classify by availability density
      let anyFree = false;
      let anyBusy = false;

      for (const t of state.tutors) {
        if (!state.selectedTutorIds.has(t.id)) continue;
        if (!containsSubject(t.subjects || '', state.subjectQuery)) continue;

        const dailyAvail = parseDailyAvail(t.availability || {}, d.getDay());
        const bookings = collectBookings(state.events, t.id, dateISO);
        const freeSegs = intervalSubtract(dailyAvail, bookings);
        // slot free?
        for (const [as, ae] of freeSegs) {
          if (ee > as && ss < ae) {
            anyFree = true;
            break;
          }
        }
        // if tutor has any declared avail today, but slot not free, mark potential busy
        const hasDeclared = dailyAvail.some(([as,ae]) => ee > as && ss < ae);
        if (hasDeclared) {
          // now see if explicitly busy
          const overlapBooked = bookings.some(([bs,be]) => ee > bs && ss < be);
          if (overlapBooked) anyBusy = true;
        }
      }

      const slotDiv = document.createElement('div');
      slotDiv.className = 'slot ' + (anyFree ? 'free' : (anyBusy ? 'busy' : 'part'));
      cell.appendChild(slotDiv);
      gridEl.appendChild(cell);
    }
  }
}

function wireEvents() {
  subjectFilterEl.addEventListener('input', () => {
    state.subjectQuery = subjectFilterEl.value || '';
    renderTutorList();
    renderLegend();
    renderGrid();
  });

  resetBtn.addEventListener('click', () => {
    subjectFilterEl.value = '';
    state.subjectQuery = '';
    state.selectedTutorIds = new Set(state.tutors.slice(0, 3).map(t => t.id)); // pick a few by default
    renderTutorList();
    renderLegend();
    renderGrid();
  });

  startDateEl.addEventListener('change', () => {
    state.weekStartISO = startDateEl.value || isoDate(startOfWeek(new Date()));
    renderGrid();
  });
}

async function main() {
  const [tutors, events, subjects] = await Promise.all([
    loadJSON(DATA.tutors),
    loadJSON(DATA.events),
    loadJSON(DATA.subjects),
  ]);
  state.tutors = tutors;
  state.events = events;
  state.subjects = subjects;

  // populate datalist
  subjectListEl.innerHTML = '';
  for (const s of subjects) {
    const opt = document.createElement('option');
    opt.value = s;
    subjectListEl.appendChild(opt);
  }

  // default selection
  state.selectedTutorIds = new Set(tutors.slice(0, 3).map(t => t.id));
  state.subjectQuery = '';
  state.weekStartISO = isoDate(startOfWeek(new Date()));
  startDateEl.value = state.weekStartISO;

  renderTutorList();
  renderLegend();
  renderGrid();
  wireEvents();
}

main().catch(err => {
  console.error(err);
  alert('Failed to start demo. See console for details.');
});
