/* ==================== GLOBAL SPARK PARTICLES ==================== */
(function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 3;
    p.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${Math.random()*100}%;
      --dur:${7 + Math.random()*10}s;
      --delay:${Math.random()*10}s;
    `;
    container.appendChild(p);
  }
})();

/* ==================== AUTH ==================== */
const ADMIN_CREDS = { user: 'admin', pass: 'admin123' };
const STUDENT_PASS = 'pass1234';
let currentUser = null;
let selectedRole = 'admin';

function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('role-' + role).classList.add('selected');
  const userInput = document.getElementById('login-user');
  if (role === 'admin') userInput.placeholder = 'Enter admin username';
  else userInput.placeholder = 'Enter your roll number (e.g. 2024001)';
}
selectRole('admin');

function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  const err = document.getElementById('login-err');
  err.classList.remove('show');
  
  const btn = document.querySelector('.btn-login');
  btn.style.opacity = '0.7';
  btn.style.transform = 'scale(0.98)';
  
  setTimeout(() => {
    btn.style.opacity = '';
    btn.style.transform = '';
    
    if (selectedRole === 'admin') {
      if (u === ADMIN_CREDS.user && p === ADMIN_CREDS.pass) {
        currentUser = { role: 'admin', name: 'Administrator' };
        enterApp();
      } else {
        err.textContent = '⚠ Incorrect credentials. Try again.';
        err.classList.add('show');
      }
    } else {
      load();
      const student = db.students.find(s => s.roll === u);
      if (student && p === STUDENT_PASS) {
        currentUser = { role: 'student', name: student.name, studentId: student.id };
        enterApp();
      } else {
        err.textContent = '⚠ Invalid Roll Number or Password (pass1234).';
        err.classList.add('show');
      }
    }
  }, 4000);
}

function doLogout() {
  currentUser = null;
  document.getElementById('app').classList.remove('visible');
  document.getElementById('login-page').classList.remove('hide');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

function enterApp() {
  document.getElementById('login-page').classList.add('hide');
  document.getElementById('app').classList.add('visible');
  
  document.getElementById('user-name-el').textContent = currentUser.name;
  const roleEl = document.getElementById('role-tag-el');
  roleEl.className = `role-tag ${currentUser.role}`;
  roleEl.textContent = currentUser.role;
  
  const avatarEl = document.getElementById('user-avatar-el');
  avatarEl.className = `user-avatar ${currentUser.role}`;
  avatarEl.textContent = currentUser.role === 'admin' ? '🛡️' : '🎓';
  
  load();
  buildNavigation();
  showView(currentUser.role === 'admin' ? 'dashboard' : 'myresults');
}

function buildNavigation() {
  const nav = document.getElementById('main-nav');
  if (currentUser.role === 'admin') {
    nav.innerHTML = `
      <button class="nav-btn" onclick="showView('dashboard')">Dashboard</button>
      <button class="nav-btn" onclick="showView('students')">Students</button>
      <button class="nav-btn" onclick="showView('results')">Results Management</button>
      <button class="nav-btn" onclick="showView('analysis')">Structural Analytics</button>
      <button class="nav-btn" onclick="showView('reports')">Report Card</button>
    `;
  } else {
    nav.innerHTML = `
      <button class="nav-btn" onclick="showView('myresults')">My Performance</button>
      <button class="nav-btn" onclick="showView('results')">Class Records</button>
      <button class="nav-btn" onclick="showView('reports')">Report Card</button>
    `;
  }
}

/* ==================== DATA LAYER ==================== */
const SUBJECTS_BY_CLASS = {
  '10-A': ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'],
  '10-B': ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi'],
  '11-Science': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
  '11-Commerce': ['Accountancy', 'Economics', 'Business Studies', 'English', 'Mathematics'],
  '12-Science': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
  '12-Commerce': ['Accountancy', 'Economics', 'Business Studies', 'English', 'Mathematics'],
};
const MAX_MARKS = 100;
const PASS_MARK = 35;

function getGrade(pct) {
  if (pct >= 90) return 'O';
  if (pct >= 75) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 35) return 'D';
  return 'F';
}

function gradeLabel(g) {
  return {O:'Outstanding',A:'Excellent',B:'Good',C:'Average',D:'Pass',F:'Fail'}[g]||g;
}

function gradeColor(pct) {
  if (pct >= 90) return '#059669';
  if (pct >= 75) return '#6366f1';
  if (pct >= 60) return '#2563eb';
  if (pct >= 50) return '#d97706';
  if (pct >= 35) return '#ea580c';
  return '#dc2626';
}

let db = { students: [], results: [], nextStudentId: 1, nextResultId: 1 };

function save() { localStorage.setItem('edutrack_db', JSON.stringify(db)); }
function load() {
  const d = localStorage.getItem('edutrack_db');
  if (d) { db = JSON.parse(d); } else { seedData(); }
}

function seedData() {
  const sampleStudents = [
    { id:1, roll:'2024001', name:'Aarav Sharma', cls:'10-A', gender:'Male' },
    { id:2, roll:'2024002', name:'Ananya Iyer', cls:'10-A', gender:'Female' },
    { id:3, roll:'2024003', name:'Kabir Malhotra', cls:'12-Science', gender:'Male' },
    { id:4, roll:'2024004', name:'Diya Verma', cls:'11-Commerce', gender:'Female' },
    { id:5, roll:'2024005', name:'Rohan Das', cls:'12-Science', gender:'Male' }
  ];
  db.students = sampleStudents;
  db.nextStudentId = 6;
  
  db.results = [
    { id:1, studentId:1, exam:'Mid-Term', year:'2026', marks:{'Mathematics':88,'Science':92,'English':79,'Social Studies':85,'Hindi':90} },
    { id:2, studentId:2, exam:'Mid-Term', year:'2026', marks:{'Mathematics':95,'Science':89,'English':91,'Social Studies':94,'Hindi':88} },
    { id:3, studentId:3, exam:'Final Exam', year:'2026', marks:{'Physics':74,'Chemistry':82,'Mathematics':91,'Biology':68,'English':80} },
    { id:4, studentId:4, exam:'Unit Test 1', year:'2026', marks:{'Accountancy':42,'Economics':55,'Business Studies':61,'English':70,'Mathematics':32} },
    { id:5, studentId:5, exam:'Final Exam', year:'2026', marks:{'Physics':88,'Chemistry':85,'Mathematics':96,'Biology':90,'English':84} }
  ];
  db.nextResultId = 6;
  save();
}

function getStudentResults(studentId, examFilter = '') {
  return db.results.filter(r => r.studentId === studentId && (!examFilter || r.exam === examFilter));
}

function calcResultStats(result, cls) {
  const subjects = SUBJECTS_BY_CLASS[cls] || Object.keys(result.marks);
  const total = subjects.reduce((a, s) => a + (result.marks[s] || 0), 0);
  const pct = Math.round((total / (subjects.length * MAX_MARKS)) * 100);
  const failed = subjects.filter(s => (result.marks[s] || 0) < PASS_MARK);
  return { total, pct, grade: getGrade(pct), failed, subjects };
}

function getStudentAvg(studentId, cls) {
  const results = getStudentResults(studentId);
  if (!results.length) return null;
  return Math.round(results.map(r => calcResultStats(r, cls).pct).reduce((a, b) => a + b, 0) / results.length);
}

function findStudent(id) { return db.students.find(s => s.id === id); }

/* ==================== NAVIGATION ==================== */
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const map = { dashboard: 'dashboard', students: 'students', results: 'results', analysis: 'analysis', reports: 'report', myresults: 'my performance' };
  
  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.textContent.toLowerCase().includes(map[name] || name)) b.classList.add('active');
  });
  
  if (name === 'dashboard') renderDashboard();
  if (name === 'students') renderStudentTable();
  if (name === 'results') renderResultTable();
  if (name === 'analysis') renderAnalysis();
  if (name === 'reports') populateReportDropdowns();
  if (name === 'myresults') renderMyResults();
}

/* ==================== STUDENT: MY RESULTS ==================== */
function renderMyResults() {
  if (currentUser.role !== 'student') return;
  const s = db.students.find(st => st.id === currentUser.studentId);
  if (!s) return;
  
  const results = getStudentResults(s.id);
  const avg = getStudentAvg(s.id, s.cls) || 0;
  const el = document.getElementById('my-results-content');
  
  el.innerHTML = `
    <div class="student-welcome">
      <h2>Welcome back, ${s.name}! 👋</h2>
      <p>Roll No: ${s.roll} &nbsp;·&nbsp; Class: ${s.cls} &nbsp;·&nbsp; Overall Average: <b style="color:${gradeColor(avg)}">${avg}%</b> — Grade <b>${getGrade(avg)}</b></p>
    </div>
    <div class="stat-grid" style="margin-bottom:1.5rem">
      <div class="stat-card"><span class="stat-icon">📝</span><div class="stat-label">Exams Taken</div><div class="stat-value">${results.length}</div></div>
      <div class="stat-card"><span class="stat-icon">📈</span><div class="stat-label">Rank Status</div><div class="stat-value">#${getStudentRankPosition(s.id, s.cls)}</div><div class="stat-sub">In Class ${s.cls}</div></div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">My Recent Examination Transcripts</span></div>
      <div class="card-body">
        ${!results.length ? '<p class="empty">No custom examination tags logged yet.</p>' : `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Exam Term</th><th>Marksheet</th><th>Total Score</th><th>Percentage</th><th>Grade</th></tr></thead>
              <tbody>
                ${results.map(r => {
                  const stats = calcResultStats(r, s.cls);
                  return `<tr>
                    <td><b>${r.exam}</b> <span style="font-size:11px;color:var(--text3)">(${r.year})</span></td>
                    <td>${Object.entries(r.marks).map(([sub,m]) => `<span>${sub}: <b style="color:${m<PASS_MARK?'var(--red)':'var(--text)'}">${m}</b></span>`).join(' · ')}</td>
                    <td><b>${stats.total}</b> / ${stats.subjects.length*100}</td>
                    <td style="font-weight:700;color:${gradeColor(stats.pct)}">${stats.pct}%</td>
                    <td><span class="grade-badge grade-${stats.grade}">${stats.grade}</span></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

function getStudentRankPosition(id, cls) {
  const classStudents = db.students.filter(s => s.cls === cls);
  const arranged = classStudents.map(s => ({ id: s.id, avg: getStudentAvg(s.id, s.cls) || 0 })).sort((a,b)=>b.avg-a.avg);
  return arranged.findIndex(x => x.id === id) + 1;
}

/* ==================== ADMIN: DASHBOARD ==================== */
function renderDashboard() {
  const totalStudents = db.students.length;
  const allPcts = db.results.map(r => {
    const s = findStudent(r.studentId);
    if (!s) return null;
    return calcResultStats(r, s.cls).pct;
  }).filter(p => p !== null);
  
  const avgPct = allPcts.length ? Math.round(allPcts.reduce((a,b)=>a+b,0)/allPcts.length) : 0;
  const passRate = allPcts.length ? Math.round((allPcts.filter(p=>p>=35).length/allPcts.length)*100) : 0;
  
  document.getElementById('dash-stats').innerHTML = `
    <div class="stat-card"><span class="stat-icon">👥</span><div class="stat-label">Total Students</div><div class="stat-value">${totalStudents}</div><div class="stat-sub">Enrolled</div></div>
    <div class="stat-card"><span class="stat-icon">📝</span><div class="stat-label">Exams Recorded</div><div class="stat-value">${db.results.length}</div><div class="stat-sub">Across all students</div></div>
    <div class="stat-card"><span class="stat-icon">📊</span><div class="stat-label">Average Score</div><div class="stat-value">${avgPct}%</div><div class="stat-sub">Overall performance</div></div>
    <div class="stat-card"><span class="stat-icon">✅</span><div class="stat-label">Pass Rate</div><div class="stat-value">${passRate}%</div><div class="stat-sub">${allPcts.filter(p=>p>=35).length} of ${allPcts.length} results</div></div>
  `;
  
  // Grade Distribution Bar Animations
  const grades = {O:0,A:0,B:0,C:0,D:0,F:0};
  allPcts.forEach(p => grades[getGrade(p)]++);
  const gradeColors = {O:'#059669',A:'#6366f1',B:'#2563eb',C:'#d97706',D:'#ea580c',F:'#dc2626'};
  const maxG = Math.max(...Object.values(grades), 1);
  
  document.getElementById('grade-bar-chart').innerHTML = Object.entries(grades).map(([g,c]) => `
    <div class="bar-row">
      <div class="bar-label">${g} – ${gradeLabel(g)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:0%;background:${gradeColors[g]}" data-w="${Math.round((c/maxG)*100)}">${c>0?c:''}</div></div>
      <div class="bar-count">${c}</div>
    </div>`).join('');
    
  // Top Performers List
  const topStudents = db.students.map(s => ({...s, avg: getStudentAvg(s.id, s.cls) || 0})).filter(s=>s.avg>0).sort((a,b)=>b.avg-a.avg).slice(0, 5);
  document.getElementById('top-performers-list').innerHTML = !topStudents.length ? '<p class="empty">No statistics compiled.</p>' : topStudents.map((s,i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border-light)">
      <div><span style="font-weight:700">${s.name}</span> <span class="cls-badge" style="font-size:10px;margin-left:4px">${s.cls}</span></div>
      <div style="font-weight:800;color:${gradeColor(s.avg)}">${s.avg}%</div>
    </div>`).join('');
    
  // Class Averages
  const classMap = {};
  db.students.forEach(s => {
    const a = getStudentAvg(s.id, s.cls);
    if(a !== null) { if(!classMap[s.cls]) classMap[s.cls]=[]; classMap[s.cls].push(a); }
  });
  document.getElementById('class-avg-chart').innerHTML = !Object.keys(classMap).length ? '<p class="empty">No classes evaluated.</p>' : Object.entries(classMap).map(([cls,arr]) => {
    const cAvg = Math.round(arr.reduce((a,b)=>a+b,0)/arr.length);
    return `<div class="bar-row">
      <div class="bar-label">${cls}</div>
      <div class="bar-track"><div class="bar-fill" style="width:0%;background:var(--accent2)" data-w="${cAvg}">${cAvg}%</div></div>
    </div>`;
  }).join('');

  // Subject Performance Chart
  const subjMap = {};
  db.results.forEach(r => {
    Object.entries(r.marks).forEach(([sub,m]) => { if(!subjMap[sub]) subjMap[sub]=[]; subjMap[sub].push(m); });
  });
  document.getElementById('subject-perf-chart').innerHTML = !Object.keys(subjMap).length ? '<p class="empty">No evaluation logs data.</p>' : Object.entries(subjMap).map(([sub,arr]) => {
    const sAvg = Math.round(arr.reduce((a,b)=>a+b,0)/arr.length);
    return `<div class="bar-row">
      <div class="bar-label" style="min-width:90px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden">${sub}</div>
      <div class="bar-track"><div class="bar-fill" style="width:0%;background:var(--blue)" data-w="${sAvg}">${sAvg}%</div></div>
    </div>`;
  }).join('');
  
  // Dynamic CSS Width triggering for accurate animation flow
  setTimeout(() => {
    document.querySelectorAll('.bar-fill').forEach(f => { f.style.width = f.getAttribute('data-w') + '%'; });
  }, 100);
}

/* ==================== ADMIN: STUDENTS MANAGEMENT ==================== */
let editStudentId = null;

function openStudentModal(id = null) {
  editStudentId = id;
  hideAlert('modal-alert');
  const title = document.getElementById('student-modal-title');
  if (id) {
    title.textContent = 'Edit Student Profiles';
    const s = db.students.find(x => x.id === id);
    document.getElementById('stu-roll').value = s.roll;
    document.getElementById('stu-roll').disabled = true;
    document.getElementById('stu-name').value = s.name;
    document.getElementById('stu-class').value = s.cls;
    document.getElementById('stu-gender').value = s.gender;
  } else {
    title.textContent = 'Register New Student Profile';
    document.getElementById('stu-roll').value = '';
    document.getElementById('stu-roll').disabled = false;
    document.getElementById('stu-name').value = '';
    document.getElementById('stu-class').selectedIndex = 0;
    document.getElementById('stu-gender').selectedIndex = 0;
  }
  openModal('modal-student');
}

function submitStudentForm() {
  const roll = document.getElementById('stu-roll').value.trim();
  const name = document.getElementById('stu-name').value.trim();
  const cls = document.getElementById('stu-class').value;
  const gender = document.getElementById('stu-gender').value;
  
  if (!roll || !name) { showAlert('modal-alert', 'error', 'Please fill all fields.'); return; }
  const existing = db.students.find(s => s.roll === roll && s.id !== editStudentId);
  if (existing) { showAlert('modal-alert', 'error', 'Roll number already exists.'); return; }
  
  if (editStudentId) {
    const idx = db.students.findIndex(s => s.id === editStudentId);
    db.students[idx] = { ...db.students[idx], roll, name, cls, gender };
  } else {
    db.students.push({ id: db.nextStudentId++, roll, name, cls, gender });
  }
  
  save();
  closeModal('modal-student');
  renderStudentTable();
  showAlert('student-alert', 'success', `Student ${editStudentId ? 'updated' : 'added'} successfully.`);
}

function deleteStudent(id) {
  if (!confirm('Delete this student and all their results?')) return;
  db.students = db.students.filter(s => s.id !== id);
  db.results = db.results.filter(r => r.studentId !== id);
  save();
  renderStudentTable();
}

function renderStudentTable() {
  if (currentUser && currentUser.role !== 'admin') {
    document.getElementById('student-tbody').innerHTML = `<tr><td colspan="9"><div class="access-denied"><div class="ad-icon">🚫</div><h2>Access Denied</h2><p>Students cannot access this section.</p></div></td></tr>`;
    return;
  }
  
  const search = (document.getElementById('student-search')?.value || '').toLowerCase();
  const clsFilter = document.getElementById('student-class-filter')?.value || '';
  const filtered = db.students.filter(s => 
    (!search || s.name.toLowerCase().includes(search) || s.roll.toLowerCase().includes(search)) &&
    (!clsFilter || s.cls === clsFilter)
  );
  
  const tbody = document.getElementById('student-tbody');
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty"><div class="empty-icon">🔍</div><p>No students found</p></div></td></tr>`;
    return;
  }
  
  tbody.innerHTML = filtered.map((s, i) => {
    const avg = getStudentAvg(s.id, s.cls);
    const exams = getStudentResults(s.id).length;
    const grade = avg !== null ? getGrade(avg) : '-';
    return `<tr style="animation:fade-up 0.35s ${i*0.04}s both ease">
      <td style="color:var(--text3);font-weight:700">${i+1}</td>
      <td style="font-weight:700;color:var(--accent)">${s.roll}</td>
      <td><b>${s.name}</b><div style="font-size:11px;color:var(--text3)">${s.gender}</div></td>
      <td><span class="cls-badge">${s.cls}</span></td>
      <td>${s.gender}</td>
      <td><span style="font-weight:600;background:var(--surface3);padding:2px 7px;border-radius:4px;font-size:11px">${exams} exams</span></td>
      <td style="font-weight:800;color:${avg?gradeColor(avg):'var(--text3)'}">${avg!==null?avg+'%':'-'}</td>
      <td>${avg!==null?`<span class="grade-badge grade-${grade}">${grade}</span>` : '-'}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="openStudentModal(${s.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})">Remove</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* ==================== RESULTS CONFIGS LAYER ==================== */
function openResultModal() {
  hideAlert('result-modal-alert');
  const sel = document.getElementById('res-student-id');
  sel.innerHTML = db.students.map(s => `<option value="${s.id}">${s.name} (${s.cls})</option>`).join('');
  onModalStudentClassChange();
  openModal('modal-result');
}

function onModalStudentClassChange() {
  const studentId = parseInt(document.getElementById('res-student-id').value);
  const student = findStudent(studentId);
  const container = document.getElementById('subject-fields-container');
  if (!student) return;
  
  const subjects = SUBJECTS_BY_CLASS[student.cls] || [];
  container.innerHTML = subjects.map(sub => `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;background:var(--surface2);padding:6px 12px;border-radius:var(--radius)">
      <span style="font-weight:600;font-size:13px">${sub}</span>
      <input type="number" id="subj-${sub.replace(/\s/g,'_')}" min="0" max="100" placeholder="0-100" style="width:90px;text-align:center;padding:6px;background:#fff" />
    </div>`).join('');
}

function submitResultForm() {
  const studentId = parseInt(document.getElementById('res-student-id').value);
  const exam = document.getElementById('res-exam').value;
  const year = document.getElementById('res-year').value.trim();
  const student = findStudent(studentId);
  if (!student || !year) { showAlert('result-modal-alert', 'error', 'Complete initial parameters.'); return; }
  
  const subjects = SUBJECTS_BY_CLASS[student.cls] || [];
  const marks = {};
  let valid = true;
  
  subjects.forEach(sub => {
    const val = parseInt(document.getElementById('subj-' + sub.replace(/\s/g,'_')).value);
    if (isNaN(val) || val < 0 || val > 100) { valid = false; return; }
    marks[sub] = val;
  });
  
  if (!valid) { showAlert('result-modal-alert', 'error', 'Please enter valid marks (0–100) for all subjects.'); return; }
  const dup = db.results.find(r => r.studentId === studentId && r.exam === exam && r.year === year);
  if (dup) { showAlert('result-modal-alert', 'error', 'Result already exists for this student and exam.'); return; }
  
  db.results.push({ id: db.nextResultId++, studentId, exam, year, marks });
  save();
  closeModal('modal-result');
  renderResultTable();
  showAlert('result-alert', 'success', 'Result added successfully.');
}

function deleteResult(id) {
  if (!confirm('Delete this result?')) return;
  db.results = db.results.filter(r => r.id !== id);
  save();
  renderResultTable();
}

function renderResultTable() {
  const isAdmin = currentUser && currentUser.role === 'admin';
  const addBtn = document.getElementById('results-add-btn');
  if (addBtn) addBtn.innerHTML = isAdmin ? `<button class="btn btn-primary" onclick="openResultModal()">+ Add Result</button>` : '';
  
  const thActions = document.getElementById('result-action-th');
  if (thActions) thActions.style.display = isAdmin ? '' : 'none';
  
  const search = (document.getElementById('result-search')?.value || '').toLowerCase();
  const examFilter = document.getElementById('result-exam-filter')?.value || '';
  const tbody = document.getElementById('result-tbody');
  
  let rows = db.results.filter(r => {
    const s = findStudent(r.studentId);
    if (!s) return false;
    if (!isAdmin && s.id !== currentUser.studentId) return false;
    return (!search || s.name.toLowerCase().includes(search) || s.roll.includes(search)) && (!examFilter || r.exam === examFilter);
  });
  
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty"><div class="empty-icon">📭</div><p>No results found</p></div></td></tr>`;
    return;
  }
  
  tbody.innerHTML = rows.map((r, i) => {
    const s = findStudent(r.studentId);
    const stats = calcResultStats(r, s.cls);
    const marksStr = Object.entries(r.marks).map(([sub,m]) => `
      <span title="${sub}" style="color:${m < PASS_MARK ? 'var(--red)' : 'var(--text2)'};font-weight:500">${m}</span>`
    ).join(' · ');
    const passed = stats.failed.length === 0;
    
    return `<tr style="animation:fade-up 0.35s ${i*0.04}s both ease">
      <td><div style="font-weight:700">${s.name}</div></td>
      <td style="color:var(--text3);font-weight:600">${s.roll}</td>
      <td><span style="font-weight:600;color:var(--text)">${r.exam}</span><div style="font-size:10px;color:var(--text3)">Year ${r.year}</div></td>
      <td><span class="cls-badge">${s.cls}</span></td>
      <td><div style="background:var(--surface2);padding:4px 10px;border-radius:6px;width:fit-content;font-size:12px">${marksStr}</div></td>
      <td style="font-weight:700">${stats.total}</td>
      <td style="font-weight:800;color:${gradeColor(stats.pct)}">${stats.pct}%</td>
      <td><span style="font-size:11px;padding:3px 9px;border-radius:6px;font-weight:700;background:${passed?'var(--green-light)':'var(--red-light)'};color:${passed?'var(--green)':'var(--red)'}">${passed?'Pass':'Fail'}</span></td>
      ${isAdmin ? `<td><button class="btn btn-danger btn-sm" onclick="deleteResult(${r.id})">Delete</button></td>` : ''}
    </tr>`;
  }).join('');
}

/* ==================== STRUCTURAL ANALYTICS LAYER ==================== */
function renderAnalysis() {
  renderLeaderboardTab();
  renderSubjectAnalysis();
}

function switchAnalysisTab(t) {
  document.querySelectorAll('.analysis-pane').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('analysis-pane-' + t).style.display = 'block';
  document.getElementById('tab-btn-' + t).classList.add('active');
}

function renderLeaderboardTab() {
  const ranked = db.students.map(s => {
    const results = getStudentResults(s.id);
    if (!results.length) return null;
    const pcts = results.map(r => calcResultStats(r, s.cls).pct);
    const avg = Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length);
    return { ...s, avg, grade: getGrade(avg) };
  }).filter(Boolean).sort((a,b) => b.avg - a.avg);
  
  const el = document.getElementById('rankings-list');
  if (!ranked.length) { el.innerHTML = '<div class="empty"><p>No results analyzed yet.</p></div>'; return; }
  
  el.innerHTML = ranked.map((s, i) => `
    <div style="display:grid;grid-template-columns:40px 1fr auto auto;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--border-light);animation:fade-up 0.4s ${i*0.05}s both ease">
      <div class="rank-num ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${i+1}</div>
      <div><div style="font-weight:700">${s.name}</div><div style="font-size:11px;color:var(--text3)">${s.roll} · ${s.cls}</div></div>
      <div><div class="progress-mini" style="width:120px;margin-bottom:4px"><div class="progress-fill" style="width:${s.avg}%;background:${gradeColor(s.avg)}"></div></div><div style="font-size:12px;color:var(--text2);text-align:right">${s.avg}%</div></div>
      <span class="grade-badge grade-${s.grade}">${s.grade}</span>
    </div>`).join('');
}

function renderSubjectAnalysis() {
  const subMap = {};
  db.results.forEach(r => {
    const s = findStudent(r.studentId);
    if (!s) return;
    Object.entries(r.marks).forEach(([sub,m]) => {
      if (!subMap[sub]) subMap[sub] = { marks: [], fails: 0, total: 0 };
      subMap[sub].marks.push(m);
      subMap[sub].total++;
      if (m < PASS_MARK) subMap[sub].fails++;
    });
  });
  
  const el = document.getElementById('subject-analysis');
  el.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${Object.entries(subMap).map(([sub,data]) => {
    const avg = Math.round(data.marks.reduce((a,b)=>a+b,0)/data.marks.length);
    const failRate = Math.round((data.fails/data.total)*100);
    return `<div class="card" style="padding:1rem;box-shadow:none;background:var(--surface2)">
      <div style="font-weight:700;margin-bottom:10px;font-family:'Playfair Display',serif;font-size:15px;color:var(--accent)">${sub}</div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span>Average Dynamic Score</span><b>${avg}%</b></div>
      <div class="progress-mini" style="margin-bottom:10px"><div class="progress-fill" style="width:${avg}%;background:var(--accent)"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text2)"><span>Fails Ratio</span><b style="color:${failRate>20?'var(--red)':'var(--green)'}">${failRate}%</b></div>
    </div>`;
  }).join('')}</div>`;
}

/* ==================== REPORTS DOCUMENT GENERATION ==================== */
function populateReportDropdowns() {
  const sel = document.getElementById('report-student-sel');
  if (currentUser && currentUser.role === 'student') {
    sel.innerHTML = db.students.filter(s => s.id === currentUser.studentId).map(s => `<option value="${s.id}">${s.roll} — ${s.name}</option>`).join('');
    sel.disabled = true;
  } else {
    sel.disabled = false;
    sel.innerHTML = db.students.map(s => `<option value="${s.id}">${s.roll} — ${s.name}</option>`).join('');
  }
}

function generateReport() {
  const studentId = parseInt(document.getElementById('report-student-sel').value);
  const examFilter = document.getElementById('report-exam-sel').value;
  if (currentUser.role === 'student' && studentId !== currentUser.studentId) return;
  
  const student = findStudent(studentId);
  if (!student) return;
  const results = getStudentResults(studentId, examFilter);
  const el = document.getElementById('report-output');
  
  if (!results.length) {
    el.innerHTML = '<div class="card"><div class="card-body empty"><p>No results found for this selection.</p></div></div>';
    return;
  }
  
  const subjects = SUBJECTS_BY_CLASS[student.cls];
  const overallPct = Math.round(results.reduce((a, r) => a + calcResultStats(r, student.cls).pct, 0) / results.length);
  const finalGrade = getGrade(overallPct);
  
  el.innerHTML = `
    <div class="card" style="border:1px solid var(--accent);animation:view-in 0.5s ease">
      <div class="report-card-header">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <h2>${student.name}</h2>
            <p>Roll Number Identifier: <b>${student.roll}</b> &nbsp;·&nbsp; Standard Class: <b>${student.cls}</b></p>
          </div>
          <div style="text-align:right">
            <div style="font-size:22px;font-weight:800;color:${gradeColor(overallPct)}">${overallPct}%</div>
            <div class="grade-badge grade-${finalGrade}" style="font-size:12px;padding:4px 12px;margin-top:4px">${gradeLabel(finalGrade)}</div>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="subject-row header"><span>Subject Matrix</span><span>Min</span><span>Max</span><span>Scored</span><span>Status</span></div>
        ${subjects.map(sub => {
          let score = 0;
          if (examFilter) {
            score = results[0].marks[sub] || 0;
          } else {
            const sum = results.reduce((a, r) => a + (r.marks[sub] || 0), 0);
            score = Math.round(sum / results.length);
          }
          const passed = score >= PASS_MARK;
          return `
            <div class="subject-row">
              <span style="font-weight:600">${sub}</span>
              <span style="color:var(--text3)">${PASS_MARK}</span>
              <span style="color:var(--text3)">${MAX_MARKS}</span>
              <span style="font-weight:700;color:${passed?'var(--text)':'var(--red)'}">${score}</span>
              <div><span style="font-size:10px;padding:2px 8px;border-radius:4px;font-weight:700;background:${passed?'var(--green-light)':'var(--red-light)'};color:${passed?'var(--green)':'var(--red)'}">${passed?'PASS':'FAIL'}</span></div>
            </div>`;
        }).join('')}
        
        <div style="margin-top:1.5rem;background:var(--surface2);padding:1rem;border-radius:var(--radius)">
          <div style="font-size:11px;text-transform:uppercase;font-weight:700;color:var(--text3);margin-bottom:6px">Cumulative Transcripts Summary</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(14px,1fr));gap:1rem">
            <div><span style="font-size:12px;color:var(--text2)">Exams Aggregated:</span> <b style="margin-left:4px">${results.length} term modules</b></div>
            <div><span style="font-size:12px;color:var(--text2)">Status Determination:</span> <b style="margin-left:4px;color:${finalGrade==='F'?'var(--red)':'var(--green)'}">${finalGrade==='F'?'Needs Revision':'Passed / Approved'}</b></div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ==================== MODAL GLOBAL UTILS ==================== */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function showAlert(id, type, msg) {
  const el = document.getElementById(id);
  el.className = `alert alert-${type} show`;
  el.innerHTML = (type === 'success' ? '✅ ' : '❌ ') + msg;
  setTimeout(() => el.className = 'alert', 4000);
}
function hideAlert(id) { const el = document.getElementById(id); if(el) el.className = 'alert'; }