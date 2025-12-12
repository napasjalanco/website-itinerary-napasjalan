// NapasJalan.co - Smart Travel Planner JavaScript
let isLoggedIn = false, currentUser = null, dayCounter = 0, activityIdCounter = 0, budgetChart = null;
let budgetData = { transport: 0, accommodation: 0, food: 0, activities: 0 };
let collaborators = [], isMusicPlaying = false;

const templates = {
    bali: { name: 'Bali Adventure', destination: 'Bali, Indonesia', duration: 5, budget: 6000000, days: [
        { activities: [{ time: '08:00', endTime: '10:00', name: 'Sarapan di Sanur', category: 'food', cost: 75000, notes: '' },
            { time: '10:30', endTime: '13:00', name: 'Pantai Kuta', category: 'activity', cost: 150000, notes: '' },
            { time: '16:00', endTime: '19:00', name: 'Sunset Tanah Lot', category: 'activity', cost: 60000, notes: '' }]},
        { activities: [{ time: '05:00', endTime: '07:00', name: 'Sunrise Tegallalang', category: 'activity', cost: 35000, notes: '' },
            { time: '10:00', endTime: '13:00', name: 'Ubud Monkey Forest', category: 'activity', cost: 80000, notes: '' }]},
        { activities: [{ time: '09:00', endTime: '12:00', name: 'Snorkeling Nusa Penida', category: 'activity', cost: 350000, notes: '' }]},
        { activities: [{ time: '06:00', endTime: '09:00', name: 'Mount Batur Trek', category: 'activity', cost: 400000, notes: '' }]},
        { activities: [{ time: '10:00', endTime: '12:00', name: 'Shopping oleh-oleh', category: 'activity', cost: 500000, notes: '' }]}
    ]},
    jogja: { name: 'Jogja Cultural', destination: 'Yogyakarta', duration: 3, budget: 3500000, days: [
        { activities: [{ time: '05:00', endTime: '08:00', name: 'Sunrise Borobudur', category: 'activity', cost: 350000, notes: '' },
            { time: '11:00', endTime: '14:00', name: 'Candi Prambanan', category: 'activity', cost: 75000, notes: '' }]},
        { activities: [{ time: '08:00', endTime: '12:00', name: 'Goa Jomblang', category: 'activity', cost: 450000, notes: '' }]},
        { activities: [{ time: '08:00', endTime: '10:00', name: 'Taman Sari', category: 'activity', cost: 20000, notes: '' }]}
    ]},
    rajaampat: { name: 'Raja Ampat Diving', destination: 'Raja Ampat', duration: 7, budget: 20000000, days: [
        { activities: [{ time: '08:00', endTime: '10:00', name: 'Flight ke Sorong', category: 'transport', cost: 2500000, notes: '' }]},
        { activities: [{ time: '06:00', endTime: '12:00', name: 'Diving Manta Point', category: 'activity', cost: 800000, notes: '' }]}
    ]},
    bromo: { name: 'Bromo Sunrise', destination: 'Bromo, Jawa Timur', duration: 3, budget: 3000000, days: [
        { activities: [{ time: '20:00', endTime: '23:00', name: 'Travel dari Surabaya', category: 'transport', cost: 300000, notes: '' }]},
        { activities: [{ time: '03:00', endTime: '06:00', name: 'Sunrise Penanjakan', category: 'activity', cost: 100000, notes: '' }]},
        { activities: [{ time: '04:00', endTime: '10:00', name: 'Kawah Ijen', category: 'activity', cost: 400000, notes: '' }]}
    ]},
    lombok: { name: 'Lombok Gili', destination: 'Lombok', duration: 5, budget: 8000000, days: [
        { activities: [{ time: '10:00', endTime: '11:30', name: 'Flight ke Lombok', category: 'transport', cost: 800000, notes: '' }]},
        { activities: [{ time: '08:00', endTime: '09:00', name: 'Boat ke Gili T', category: 'transport', cost: 150000, notes: '' }]}
    ]},
    bandung: { name: 'Bandung Getaway', destination: 'Bandung', duration: 2, budget: 1500000, days: [
        { activities: [{ time: '06:00', endTime: '09:00', name: 'Drive dari Jakarta', category: 'transport', cost: 200000, notes: '' },
            { time: '10:00', endTime: '13:00', name: 'Kawah Putih', category: 'activity', cost: 75000, notes: '' }]},
        { activities: [{ time: '07:00', endTime: '10:00', name: 'Tangkuban Perahu', category: 'activity', cost: 50000, notes: '' }]}
    ]}
};

document.addEventListener('DOMContentLoaded', init);

function init() {
    setTimeout(() => { const p = document.getElementById('preloader'); if (p) p.classList.add('hidden'); }, 2500);
    checkLoginStatus(); initNavbar(); initCounters(); initTemplateFilters(); initLoginTabs();
    initBudgetChart(); initDateListeners(); initBubbles(); loadSavedData();
    if (dayCounter === 0) addNewDay();
}

function initBubbles() { document.addEventListener('click', createBubble); }

function createBubble(e) {
    const c = document.getElementById('bubblesContainer'); if (!c) return;
    for (let i = 0; i < 5; i++) {
        const b = document.createElement('div'); b.className = 'bubble';
        const s = Math.random() * 30 + 10;
        b.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX + (Math.random() - 0.5) * 50}px;top:${e.clientY + (Math.random() - 0.5) * 50}px`;
        c.appendChild(b); setTimeout(() => b.remove(), 4000);
    }
}

function playClick() { const s = document.getElementById('clickSound'); if (s) { s.currentTime = 0; s.volume = 0.3; s.play().catch(() => {}); } }

function toggleMusic() {
    const m = document.getElementById('bgMusic'), b = document.getElementById('musicToggle'); if (!m) return;
    if (isMusicPlaying) { m.pause(); b.classList.remove('playing'); b.querySelector('.music-icon').textContent = '🔇'; }
    else { m.volume = 0.2; m.play().catch(() => {}); b.classList.add('playing'); b.querySelector('.music-icon').textContent = '🔊'; }
    isMusicPlaying = !isMusicPlaying;
}

function checkLoginStatus() { const s = localStorage.getItem('napasjalanUser'); if (s) { currentUser = JSON.parse(s); isLoggedIn = true; updateUIForLoggedIn(); } }

function showLoginModal() { document.getElementById('loginModal').classList.add('active'); }
function closeLoginModal() { document.getElementById('loginModal').classList.remove('active'); }

function initLoginTabs() {
    document.querySelectorAll('.login-tab').forEach(t => {
        t.addEventListener('click', () => {
            document.querySelectorAll('.login-tab').forEach(x => x.classList.remove('active')); t.classList.add('active');
            const l = t.dataset.tab === 'login';
            document.getElementById('loginForm').style.display = l ? 'flex' : 'none';
            document.getElementById('registerForm').style.display = l ? 'none' : 'flex';
        });
    });
}

function handleLogin(e) {
    e.preventDefault();
    const em = document.getElementById('loginEmail').value, pw = document.getElementById('loginPassword').value;
    if (em && pw.length >= 6) {
        const u = { email: em, name: em.split('@')[0], avatar: em.charAt(0).toUpperCase(), createdAt: new Date().toISOString() };
        localStorage.setItem('napasjalanUser', JSON.stringify(u)); currentUser = u; isLoggedIn = true;
        closeLoginModal(); updateUIForLoggedIn(); showToast('success', 'Login berhasil!');
    } else showToast('error', 'Email/password tidak valid');
}

function handleRegister(e) {
    e.preventDefault();
    const n = document.getElementById('registerName').value, em = document.getElementById('registerEmail').value;
    const pw = document.getElementById('registerPassword').value, cf = document.getElementById('confirmPassword').value;
    if (pw !== cf) { showToast('error', 'Password tidak cocok'); return; }
    if (n && em && pw.length >= 6) {
        const u = { name: n, email: em, avatar: n.charAt(0).toUpperCase(), createdAt: new Date().toISOString() };
        localStorage.setItem('napasjalanUser', JSON.stringify(u)); currentUser = u; isLoggedIn = true;
        closeLoginModal(); updateUIForLoggedIn(); showToast('success', 'Registrasi berhasil!');
    } else showToast('error', 'Lengkapi semua field');
}

function socialLogin(p) {
    const u = { name: p + ' User', email: 'user@' + p + '.com', avatar: p.charAt(0).toUpperCase(), provider: p };
    localStorage.setItem('napasjalanUser', JSON.stringify(u)); currentUser = u; isLoggedIn = true;
    closeLoginModal(); updateUIForLoggedIn(); showToast('success', 'Login ' + p + ' berhasil!');
}

function logout() { localStorage.removeItem('napasjalanUser'); currentUser = null; isLoggedIn = false; showToast('info', 'Logout berhasil'); setTimeout(() => location.reload(), 1500); }

function updateUIForLoggedIn() {
    const b = document.getElementById('userBtn');
    if (b && currentUser) { b.classList.add('logged-in'); b.innerHTML = `<span class="user-icon">${currentUser.avatar}</span><span class="user-text">${currentUser.name}</span>`; b.onclick = () => { if (confirm('Logout?')) logout(); }; }
    const l = document.getElementById('plannerLock'); if (l) l.classList.add('hidden');
    if (collaborators.length > 0) { const bar = document.getElementById('collaboratorsBar'); if (bar) bar.style.display = 'flex'; }
}

function showCollabModal() { if (!checkAuth()) return; document.getElementById('collabModal').classList.add('active'); updateCollaboratorsList(); }
function closeCollabModal() { document.getElementById('collabModal').classList.remove('active'); }

function inviteCollaborator(e) {
    e.preventDefault(); const em = document.getElementById('collabEmail').value; if (!em) return;
    collaborators.push({ email: em, name: em.split('@')[0], avatar: em.charAt(0).toUpperCase(), color: ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'][Math.floor(Math.random() * 5)] });
    updateCollaboratorsList(); updateCollaboratorsBar();
    document.getElementById('collabEmail').value = ''; document.getElementById('collabMessage').value = '';
    showToast('success', 'Undangan terkirim ke ' + em);
}

function updateCollaboratorsList() {
    const c = document.getElementById('currentCollaborators');
    if (collaborators.length === 0) c.innerHTML = '<p class="no-collab">Belum ada collaborator</p>';
    else c.innerHTML = collaborators.map((x, i) => `<div class="collab-member"><div class="collab-member-avatar" style="background:${x.color}">${x.avatar}</div><div class="collab-member-info"><h5>${x.name}</h5><p>${x.email}</p></div><button class="collab-member-remove" onclick="removeCollaborator(${i})">x</button></div>`).join('');
}

function updateCollaboratorsBar() {
    const b = document.getElementById('collaboratorsBar'), a = document.getElementById('collabAvatars');
    if (collaborators.length > 0) { b.style.display = 'flex'; a.innerHTML = collaborators.map(x => `<div class="collab-avatar" style="background:${x.color}">${x.avatar}</div>`).join(''); }
    else b.style.display = 'none';
}

function removeCollaborator(i) { collaborators.splice(i, 1); updateCollaboratorsList(); updateCollaboratorsBar(); showToast('info', 'Collaborator dihapus'); }

function initNavbar() {
    window.addEventListener('scroll', () => { const n = document.getElementById('navbar'); if (n) n.classList.toggle('scrolled', window.scrollY > 50); });
    document.querySelectorAll('.nav-link').forEach(l => { l.addEventListener('click', e => { e.preventDefault(); const t = document.querySelector(l.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth' }); document.querySelectorAll('.nav-link').forEach(x => x.classList.remove('active')); l.classList.add('active'); }); });
}

function toggleMobileMenu() { document.getElementById('mobileMenu').classList.toggle('active'); }

function initCounters() {
    const o = new IntersectionObserver(e => { e.forEach(x => { if (x.isIntersecting) { animateCounter(x.target, parseFloat(x.target.dataset.count)); o.unobserve(x.target); } }); }, { threshold: 0.5 });
    document.querySelectorAll('.stat-value').forEach(c => o.observe(c));
}

function animateCounter(el, t) { let c = 0; const d = t < 10, i = t / 80, tm = setInterval(() => { c += i; if (c >= t) { c = t; clearInterval(tm); } el.textContent = d ? c.toFixed(1) : Math.floor(c).toLocaleString() + '+'; }, 25); }

function initTemplateFilters() { document.querySelectorAll('.filter-btn').forEach(b => { b.addEventListener('click', () => { document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); filterTemplates(b.dataset.filter); }); }); }

function filterTemplates(f) { document.querySelectorAll('.template-card').forEach(c => { c.style.display = (f === 'all' || c.dataset.category.includes(f)) ? 'block' : 'none'; }); }

function previewTemplate(id) {
    const t = templates[id]; if (!t) return;
    let h = `<h3>${t.name}</h3><p style="color:#6b7280;margin-bottom:1.5rem">Destinasi: ${t.destination} | ${t.duration} Hari | ${formatCurrency(t.budget)}</p><div class="preview-days">`;
    t.days.forEach((d, i) => { h += `<div class="preview-day"><h4>Day ${i + 1}</h4><div class="preview-activities">`; d.activities.forEach(a => { h += `<div class="preview-activity"><span class="time">${a.time}-${a.endTime}</span><span class="name">${a.name}</span><span class="cost">${formatCurrency(a.cost)}</span></div>`; }); h += '</div></div>'; });
    h += `</div><button class="use-template-btn" style="margin-top:2rem" onclick="useTemplate('${id}');closeTemplateModal()"><span>Gunakan Template</span><span>→</span></button>`;
    document.getElementById('templatePreview').innerHTML = h; document.getElementById('templateModal').classList.add('active');
}

function closeTemplateModal() { document.getElementById('templateModal').classList.remove('active'); }

function useTemplate(id) {
    if (!checkAuth()) return; const t = templates[id]; if (!t) return;
    document.getElementById('tripName').value = t.name; document.getElementById('destination').value = t.destination; document.getElementById('totalBudget').value = t.budget;
    const td = new Date(); document.getElementById('startDate').value = formatDateForInput(td); const ed = new Date(td); ed.setDate(ed.getDate() + t.duration - 1); document.getElementById('endDate').value = formatDateForInput(ed);
    document.getElementById('dayTabs').innerHTML = ''; document.getElementById('daysContent').innerHTML = ''; dayCounter = 0;
    t.days.forEach((d, i) => { addNewDay(); const tl = document.getElementById(`timeline-${i + 1}`); if (tl) { tl.innerHTML = ''; d.activities.forEach(a => tl.insertAdjacentHTML('beforeend', createActivityHTML(i + 1, a))); } });
    initDragAndDrop(); updateBudget(); updateDayDates();
    document.getElementById('planner').scrollIntoView({ behavior: 'smooth' }); showToast('success', 'Template "' + t.name + '" dimuat!');
}

function startPlanning() {
    const d = document.getElementById('heroDestination').value, s = document.getElementById('heroStartDate').value, e = document.getElementById('heroEndDate').value;
    if (d) document.getElementById('destination').value = d; if (s) document.getElementById('startDate').value = s; if (e) document.getElementById('endDate').value = e;
    document.getElementById('planner').scrollIntoView({ behavior: 'smooth' }); if (!isLoggedIn) setTimeout(showLoginModal, 500);
}

function addNewDay() {
    if (!checkAuth()) return; dayCounter++;
    const tabs = document.getElementById('dayTabs'), tab = document.createElement('button');
    tab.className = 'day-tab' + (dayCounter === 1 ? ' active' : ''); tab.dataset.day = dayCounter;
    const dn = dayCounter;
    tab.innerHTML = `<span class="day-num">Day ${dn}</span><span class="day-date" id="day${dn}TabDate">-</span><button class="delete-day-btn" onclick="deleteDay(${dn});event.stopPropagation();">×</button>`;
    tab.onclick = e => { if (!e.target.classList.contains('delete-day-btn')) switchDay(parseInt(tab.dataset.day)); }; tabs.appendChild(tab);
    const content = document.getElementById('daysContent'), div = document.createElement('div');
    div.className = 'day-content' + (dayCounter === 1 ? ' active' : ''); div.dataset.day = dayCounter; div.id = `dayContent-${dayCounter}`;
    div.innerHTML = `<div class="day-header"><h3>Day ${dn} - <span class="day-date-text" id="day${dn}DateText">Pilih tanggal</span></h3><div class="day-summary"><span class="summary-item"><span>Aktivitas:</span><span id="day${dn}Activities">0</span></span><span class="summary-item"><span>Biaya:</span><span id="day${dn}Cost">Rp 0</span></span></div></div><div class="timeline-container" id="timeline-${dn}"></div><button class="add-activity-btn" onclick="addActivity(${dn});playClick();"><span class="btn-icon">+</span><span>Tambah Aktivitas</span></button>`;
    content.appendChild(div); initSortableForTimeline(dayCounter); if (dayCounter > 1) switchDay(dayCounter); updateDayDates(); showToast('success', 'Day ' + dayCounter + ' ditambahkan!');
}

function deleteDay(n) {
    if (dayCounter <= 1) { showToast('error', 'Minimal 1 hari!'); return; } if (!confirm('Hapus Day ' + n + '?')) return;
    const tab = document.querySelector(`.day-tab[data-day="${n}"]`), content = document.getElementById(`dayContent-${n}`);
    if (tab) tab.remove(); if (content) content.remove(); renumberDays();
    const first = document.querySelector('.day-tab'); if (first) switchDay(parseInt(first.dataset.day)); updateBudget(); showToast('info', 'Day dihapus');
}

function renumberDays() {
    dayCounter = 0;
    document.querySelectorAll('.day-tab').forEach((t, i) => {
        dayCounter++; const n = i + 1; t.dataset.day = n;
        t.querySelector('.day-num').textContent = `Day ${n}`;
        t.querySelector('.day-date').id = `day${n}TabDate`;
        const delBtn = t.querySelector('.delete-day-btn');
        delBtn.onclick = e => { deleteDay(n); e.stopPropagation(); };
        t.onclick = e => { if (!e.target.classList.contains('delete-day-btn')) switchDay(n); };
    });
    document.querySelectorAll('.day-content').forEach((c, i) => {
        const n = i + 1; c.dataset.day = n; c.id = `dayContent-${n}`;
        c.querySelector('h3').innerHTML = `Day ${n} - <span class="day-date-text" id="day${n}DateText">Pilih tanggal</span>`;
        c.querySelector('.timeline-container').id = `timeline-${n}`;
        const addBtn = c.querySelector('.add-activity-btn');
        addBtn.onclick = () => { addActivity(n); playClick(); };
    });
    updateDayDates();
}

function switchDay(n) { document.querySelectorAll('.day-tab').forEach(t => t.classList.toggle('active', parseInt(t.dataset.day) === n)); document.querySelectorAll('.day-content').forEach(c => c.classList.toggle('active', parseInt(c.dataset.day) === n)); }

function addActivity(n) {
    if (!checkAuth()) return; const tl = document.getElementById(`timeline-${n}`); if (!tl) return;
    tl.insertAdjacentHTML('beforeend', createActivityHTML(n, { time: '09:00', endTime: '10:00', name: '', category: 'activity', cost: 0, notes: '' }));
    initTimeCalc(); updateDaySummary(n); showToast('success', 'Aktivitas ditambahkan!');
}

function createActivityHTML(n, a) {
    activityIdCounter++;
    return `<div class="timeline-item" draggable="true" data-id="${activityIdCounter}"><div class="timeline-marker"><div class="marker-dot"></div><div class="marker-line"></div></div><div class="timeline-card"><div class="time-inputs"><div class="time-group"><label>Mulai</label><input type="time" class="time-start" value="${a.time}" onchange="calcDur(this)"></div><span class="time-separator">→</span><div class="time-group"><label>Selesai</label><input type="time" class="time-end" value="${a.endTime}" onchange="calcDur(this)"></div><span class="duration-badge">1 jam</span></div><div class="activity-content"><input type="text" class="activity-name" placeholder="Nama aktivitas..." value="${a.name||''}"><div class="activity-meta"><select class="category-select" onchange="updateBudget()"><option value="transport" ${a.category==='transport'?'selected':''}>Transport</option><option value="accommodation" ${a.category==='accommodation'?'selected':''}>Penginapan</option><option value="food" ${a.category==='food'?'selected':''}>Makanan</option><option value="activity" ${a.category==='activity'?'selected':''}>Aktivitas</option></select><div class="cost-input-wrapper"><span class="currency">Rp</span><input type="number" class="cost-input" placeholder="0" value="${a.cost||''}" onchange="updateBudget()"></div></div><textarea class="activity-notes" placeholder="Catatan...">${a.notes||''}</textarea></div><button class="delete-activity-btn" onclick="deleteActivity(this);playClick();">×</button></div></div>`;
}

function deleteActivity(btn) { if (!confirm('Hapus?')) return; const it = btn.closest('.timeline-item'), dc = it.closest('.day-content'), n = dc ? dc.dataset.day : 1; it.remove(); updateBudget(); updateDaySummary(n); showToast('info', 'Dihapus'); }

function calcDur(i) { const c = i.closest('.timeline-card'), s = c.querySelector('.time-start').value, e = c.querySelector('.time-end').value, b = c.querySelector('.duration-badge'); if (s && e) { const st = new Date(`2000-01-01 ${s}`), en = new Date(`2000-01-01 ${e}`); let d = (en - st) / 60000; if (d < 0) d += 1440; const h = Math.floor(d / 60), m = d % 60; b.textContent = h > 0 && m > 0 ? `${h}j ${m}m` : h > 0 ? `${h} jam` : `${m} menit`; } }

function initTimeCalc() { document.querySelectorAll('.time-start, .time-end').forEach(i => calcDur(i)); }

function initDragAndDrop() { document.querySelectorAll('.timeline-container').forEach(c => initSortableForTimeline(c.id.split('-')[1])); }

function initSortableForTimeline(n) { const c = document.getElementById(`timeline-${n}`); if (!c || typeof Sortable === 'undefined') return; new Sortable(c, { animation: 150, ghostClass: 'dragging', handle: '.timeline-card', onEnd: () => { saveData(); showToast('success', 'Urutan diperbarui'); } }); }

function initBudgetChart() { const ctx = document.getElementById('budgetChart'); if (!ctx || typeof Chart === 'undefined') return; budgetChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Transport', 'Penginapan', 'Makanan', 'Aktivitas'], datasets: [{ data: [0, 0, 0, 0], backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'], borderWidth: 0, cutout: '70%' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } }); }

function updateBudget() {
    budgetData = { transport: 0, accommodation: 0, food: 0, activities: 0 };
    document.querySelectorAll('.timeline-item').forEach(it => { const cat = it.querySelector('.category-select')?.value, cost = parseFloat(it.querySelector('.cost-input')?.value) || 0; if (cat === 'transport') budgetData.transport += cost; else if (cat === 'accommodation') budgetData.accommodation += cost; else if (cat === 'food') budgetData.food += cost; else if (cat === 'activity') budgetData.activities += cost; });
    document.getElementById('transportTotal').textContent = formatCurrency(budgetData.transport); document.getElementById('accommodationTotal').textContent = formatCurrency(budgetData.accommodation); document.getElementById('foodTotal').textContent = formatCurrency(budgetData.food); document.getElementById('activitiesTotal').textContent = formatCurrency(budgetData.activities);
    const total = budgetData.transport + budgetData.accommodation + budgetData.food + budgetData.activities; document.getElementById('totalSpent').textContent = formatCurrency(total);
    const budget = parseFloat(document.getElementById('totalBudget')?.value) || 0, rem = budget - total, remEl = document.getElementById('remainingBudget'); remEl.textContent = formatCurrency(rem); remEl.style.color = rem >= 0 ? '#10b981' : '#ef4444';
    if (budgetChart) { budgetChart.data.datasets[0].data = [budgetData.transport, budgetData.accommodation, budgetData.food, budgetData.activities]; budgetChart.update(); }
    document.querySelectorAll('.day-content').forEach(c => updateDaySummary(c.dataset.day)); saveData();
}

function updateDaySummary(n) { const tl = document.getElementById(`timeline-${n}`); if (!tl) return; const acts = tl.querySelectorAll('.timeline-item'); let cost = 0; acts.forEach(a => cost += parseFloat(a.querySelector('.cost-input')?.value) || 0); const actEl = document.getElementById(`day${n}Activities`), costEl = document.getElementById(`day${n}Cost`); if (actEl) actEl.textContent = acts.length + ' aktivitas'; if (costEl) costEl.textContent = formatCurrency(cost); }

function initDateListeners() { const s = document.getElementById('startDate'), e = document.getElementById('endDate'); if (s) s.addEventListener('change', updateDayDates); if (e) e.addEventListener('change', updateDayDates); }

function updateDayDates() { const ss = document.getElementById('startDate')?.value; if (!ss) return; const st = new Date(ss); document.querySelectorAll('.day-tab').forEach((t, i) => { const d = new Date(st); d.setDate(d.getDate() + i); const tde = t.querySelector('.day-date'); if (tde) tde.textContent = formatDateShort(d); const n = t.dataset.day, te = document.getElementById(`day${n}DateText`); if (te) te.textContent = formatDateLong(d); }); }

function addPlaceToItinerary(name, cost) { if (!checkAuth()) return; const ac = document.querySelector('.day-content.active'); if (!ac) { showToast('error', 'Tambahkan hari dulu'); return; } const n = ac.dataset.day, tl = document.getElementById(`timeline-${n}`); if (!tl) return; tl.insertAdjacentHTML('beforeend', createActivityHTML(n, { time: '10:00', endTime: '12:00', name, category: 'activity', cost, notes: 'Dari Discover' })); initTimeCalc(); updateBudget(); showToast('success', name + ' ditambahkan!'); }

async function exportPDF() {
    if (!checkAuth()) return; showToast('info', 'Membuat PDF...');
    const { jsPDF } = window.jspdf, doc = new jsPDF('p', 'mm', 'a4'), pw = 210, ph = 297, m = 20; let y = m;
    const tripName = document.getElementById('tripName')?.value || 'My Trip', dest = document.getElementById('destination')?.value || 'Indonesia', startDate = document.getElementById('startDate')?.value || '', endDate = document.getElementById('endDate')?.value || '', travelers = document.getElementById('travelers')?.value || '2', budget = document.getElementById('totalBudget')?.value || '0';
    
    doc.setFillColor(99, 102, 241); doc.rect(0, 0, pw, 55, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.text('NapasJalan.co', m, 15); doc.setFontSize(24); doc.setFont('helvetica', 'bold'); doc.text(tripName.toUpperCase(), m, 32); doc.setFontSize(11); doc.setFont('helvetica', 'normal'); doc.text('Destinasi: ' + dest, m, 45);
    
    y = 65; doc.setFillColor(249, 250, 251); doc.roundedRect(m, y, pw - m * 2, 22, 3, 3, 'F'); doc.setTextColor(107, 114, 128); doc.setFontSize(8); doc.text('TANGGAL', m + 10, y + 8); doc.text('DURASI', m + 50, y + 8); doc.text('TRAVELERS', m + 90, y + 8); doc.text('BUDGET', m + 130, y + 8);
    doc.setTextColor(99, 102, 241); doc.setFontSize(10); doc.setFont('helvetica', 'bold'); const sf = startDate ? new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-', ef = endDate ? new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'; doc.text(sf + ' - ' + ef, m + 10, y + 16); doc.text(dayCounter + ' Hari', m + 50, y + 16); doc.text(travelers + ' Orang', m + 90, y + 16); doc.text(formatCurrencyShort(budget), m + 130, y + 16);
    
    y = 95; doc.setFillColor(255, 255, 255); doc.setDrawColor(229, 231, 235); doc.roundedRect(m, y, pw - m * 2, 40, 3, 3, 'FD'); doc.setTextColor(99, 102, 241); doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.text('RINGKASAN BUDGET', m + 5, y + 10);
    const items = [{ l: 'Transport', v: budgetData.transport, c: [99, 102, 241] }, { l: 'Penginapan', v: budgetData.accommodation, c: [16, 185, 129] }, { l: 'Makanan', v: budgetData.food, c: [245, 158, 11] }, { l: 'Aktivitas', v: budgetData.activities, c: [139, 92, 246] }];
    const total = budgetData.transport + budgetData.accommodation + budgetData.food + budgetData.activities; let by = y + 18;
    items.forEach((item, i) => { const x = m + 5 + (i % 2) * 80, iy = by + Math.floor(i / 2) * 10; doc.setFillColor(...item.c); doc.circle(x + 2, iy - 1, 2, 'F'); doc.setTextColor(107, 114, 128); doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text(item.l, x + 7, iy); doc.setTextColor(31, 41, 55); doc.setFont('helvetica', 'bold'); doc.text(formatCurrencyShort(item.v), x + 40, iy); });
    doc.setFillColor(99, 102, 241); doc.roundedRect(pw - m - 40, y + 10, 35, 18, 2, 2, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.text('TOTAL', pw - m - 35, y + 17); doc.setFontSize(10); doc.text(formatCurrencyShort(total), pw - m - 35, y + 24);
    
    y = 145; doc.setTextColor(99, 102, 241); doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('ITINERARY HARIAN', m, y); y += 8;
    for (let d = 1; d <= dayCounter; d++) { const tl = document.getElementById(`timeline-${d}`); if (!tl) continue; const acts = tl.querySelectorAll('.timeline-item'); if (acts.length === 0) continue; if (y > ph - 50) { doc.addPage(); y = m; }
        doc.setFillColor(99, 102, 241); doc.roundedRect(m, y, pw - m * 2, 8, 2, 2, 'F'); doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont('helvetica', 'bold'); const dt = document.getElementById(`day${d}DateText`)?.textContent || ''; doc.text('DAY ' + d + ' - ' + dt, m + 5, y + 5.5); y += 12;
        acts.forEach(act => { if (y > ph - 25) { doc.addPage(); y = m; } const ts = act.querySelector('.time-start')?.value || '', te = act.querySelector('.time-end')?.value || '', nm = act.querySelector('.activity-name')?.value || 'Aktivitas', cat = act.querySelector('.category-select')?.value || '', cost = act.querySelector('.cost-input')?.value || '0', notes = act.querySelector('.activity-notes')?.value || ''; const hn = notes && notes.trim().length > 0; doc.setFillColor(249, 250, 251); doc.roundedRect(m, y, pw - m * 2, hn ? 16 : 10, 2, 2, 'F'); doc.setTextColor(99, 102, 241); doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.text(ts + ' - ' + te, m + 3, y + 5); const cn = { transport: '[T]', accommodation: '[H]', food: '[F]', activity: '[A]' }; doc.setTextColor(107, 114, 128); doc.text(cn[cat] || '[?]', m + 30, y + 5); doc.setTextColor(31, 41, 55); doc.setFontSize(9); doc.text(nm.substring(0, 45), m + 40, y + 5); doc.setTextColor(245, 158, 11); doc.setFont('helvetica', 'bold'); doc.text(formatCurrencyShort(cost), pw - m - 25, y + 5); if (hn) { doc.setTextColor(107, 114, 128); doc.setFontSize(7); doc.setFont('helvetica', 'italic'); doc.text('Catatan: ' + notes.substring(0, 70), m + 40, y + 11); } y += hn ? 18 : 12; }); y += 5; }
    
    const pages = doc.internal.getNumberOfPages(); for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setDrawColor(229, 231, 235); doc.line(m, ph - 12, pw - m, ph - 12); doc.setTextColor(107, 114, 128); doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.text('Created with NapasJalan.co - Smart Travel Planner', pw / 2, ph - 7, { align: 'center' }); doc.text('Page ' + i + ' of ' + pages, pw - m, ph - 7, { align: 'right' }); }
    doc.save(tripName.replace(/\s+/g, '_') + '_Itinerary.pdf'); showToast('success', 'PDF berhasil didownload!');
}

function saveData() { if (!isLoggedIn || !currentUser) return; localStorage.setItem(`napasjalan_trip_${currentUser.email}`, JSON.stringify({ tripDetails: { name: document.getElementById('tripName')?.value, destination: document.getElementById('destination')?.value, startDate: document.getElementById('startDate')?.value, endDate: document.getElementById('endDate')?.value, budget: document.getElementById('totalBudget')?.value, travelers: document.getElementById('travelers')?.value }, budget: budgetData, dayCounter, collaborators, savedAt: new Date().toISOString() })); }

function loadSavedData() { if (!isLoggedIn || !currentUser) return; const saved = localStorage.getItem(`napasjalan_trip_${currentUser.email}`); if (!saved) return; try { const data = JSON.parse(saved); if (data.tripDetails) { if (data.tripDetails.name) document.getElementById('tripName').value = data.tripDetails.name; if (data.tripDetails.destination) document.getElementById('destination').value = data.tripDetails.destination; if (data.tripDetails.startDate) document.getElementById('startDate').value = data.tripDetails.startDate; if (data.tripDetails.endDate) document.getElementById('endDate').value = data.tripDetails.endDate; if (data.tripDetails.budget) document.getElementById('totalBudget').value = data.tripDetails.budget; if (data.tripDetails.travelers) document.getElementById('travelers').value = data.tripDetails.travelers; } if (data.budget) { budgetData = data.budget; } if (data.collaborators) { collaborators = data.collaborators; updateCollaboratorsBar(); } updateDayDates(); } catch (e) { console.error('Load error:', e); } }

function checkAuth() { if (!isLoggedIn) { showLoginModal(); return false; } return true; }
function formatCurrency(a) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(a || 0); }
function formatCurrencyShort(a) { const n = parseFloat(a) || 0; if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + ' jt'; if (n >= 1000) return 'Rp ' + (n / 1000).toFixed(0) + ' rb'; return 'Rp ' + n.toLocaleString('id-ID'); }
function formatDateForInput(d) { return d.toISOString().split('T')[0]; }
function formatDateShort(d) { return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }); }
function formatDateLong(d) { return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
function showToast(type, msg) { const c = document.getElementById('toastContainer'); if (!c) return; const t = document.createElement('div'); t.className = `toast ${type}`; const icons = { success: '✓', error: '✗', info: 'ℹ' }; t.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span class="toast-message">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>`; c.appendChild(t); setTimeout(() => t.remove(), 4000); }
