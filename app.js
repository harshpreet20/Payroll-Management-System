'use strict';

/* ===== CONSTANTS ===== */
const STORAGE_KEYS = {
  employees: 'payrollpro_employees',
  attendance: 'payrollpro_attendance',
  payrolls: 'payrollpro_payrolls',
  settings: 'payrollpro_settings',
  session:  'payrollpro_session',
};

const AVATAR_COLORS = [
  '#6366F1','#8B5CF6','#EC4899','#F43F5E','#EF4444',
  '#F97316','#EAB308','#22C55E','#14B8A6','#06B6D4','#3B82F6',
];

const STATUS_CONFIG = {
  'Present':    { badge: 'badge-success', label: 'Present' },
  'Absent':     { badge: 'badge-danger',  label: 'Absent'  },
  'Half Day':   { badge: 'badge-warning', label: 'Half Day'},
  'Leave':      { badge: 'badge-info',    label: 'Leave'   },
  'Holiday':    { badge: 'badge-purple',  label: 'Holiday' },
  'Weekly Off': { badge: 'badge-gray',    label: 'Weekly Off' },
};

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

/* ===== DEMO DATA ===== */
const DEMO_EMPLOYEES = [
  { employeeId:'E001', employeeName:'Rahul Sharma',    department:'Engineering', role:'Senior Developer',   joiningDate:'2021-03-15', monthlySalary:85000, status:'Active',   paymentMethod:'Bank Transfer', paymentDetails:'HDFC XXXX1234' },
  { employeeId:'E002', employeeName:'Priya Patel',     department:'Engineering', role:'UI/UX Designer',     joiningDate:'2022-01-10', monthlySalary:65000, status:'Active',   paymentMethod:'Bank Transfer', paymentDetails:'ICICI XXXX5678' },
  { employeeId:'E003', employeeName:'Amit Kumar',      department:'HR',          role:'HR Manager',         joiningDate:'2020-07-01', monthlySalary:75000, status:'Active',   paymentMethod:'Bank Transfer', paymentDetails:'SBI XXXX9012' },
  { employeeId:'E004', employeeName:'Sneha Reddy',     department:'Sales',       role:'Sales Executive',    joiningDate:'2023-02-20', monthlySalary:45000, status:'Active',   paymentMethod:'UPI',           paymentDetails:'sneha@okaxis' },
  { employeeId:'E005', employeeName:'Raj Mehta',       department:'Finance',     role:'Accountant',         joiningDate:'2021-09-12', monthlySalary:55000, status:'Active',   paymentMethod:'Bank Transfer', paymentDetails:'Axis XXXX3456' },
  { employeeId:'E006', employeeName:'Kavya Singh',     department:'Engineering', role:'Backend Developer',  joiningDate:'2022-06-08', monthlySalary:70000, status:'Active',   paymentMethod:'Bank Transfer', paymentDetails:'HDFC XXXX7890' },
  { employeeId:'E007', employeeName:'Vikram Nair',     department:'Sales',       role:'Sales Manager',      joiningDate:'2019-11-25', monthlySalary:80000, status:'Active',   paymentMethod:'Bank Transfer', paymentDetails:'Kotak XXXX2345' },
  { employeeId:'E008', employeeName:'Ananya Iyer',     department:'Marketing',   role:'Marketing Lead',     joiningDate:'2022-04-18', monthlySalary:60000, status:'Inactive', paymentMethod:'Bank Transfer', paymentDetails:'ICICI XXXX6789' },
  { employeeId:'E009', employeeName:'Deepak Verma',    department:'Finance',     role:'Finance Manager',    joiningDate:'2020-12-01', monthlySalary:90000, status:'Active',   paymentMethod:'Bank Transfer', paymentDetails:'SBI XXXX4567' },
  { employeeId:'E010', employeeName:'Meera Krishnan',  department:'Marketing',   role:'Content Strategist', joiningDate:'2023-07-15', monthlySalary:48000, status:'Active',   paymentMethod:'UPI',           paymentDetails:'meera@okicici' },
];

function generateDemoAttendance(employees) {
  const records = [];
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const today = now.getDate();
  let id = 1;

  employees.filter(e => e.status === 'Active').forEach(emp => {
    for (let d = 1; d <= today; d++) {
      const date = new Date(year, month, d);
      const dow = date.getDay();
      if (dow === 0) {
        records.push({ id: String(id++), employeeId: emp.employeeId, date: toDateStr(date), status: 'Weekly Off', hoursWorked: 0, overtimeHours: 0, lateMinutes: 0, remarks: '' });
        continue;
      }
      const rand = Math.random();
      let status, hoursWorked = 8, lateMinutes = 0, overtime = 0;
      if (rand < 0.75) {
        status = 'Present';
        hoursWorked = Math.random() < 0.2 ? 9 + Math.floor(Math.random() * 2) : 8;
        overtime = Math.max(0, hoursWorked - 8);
        lateMinutes = Math.random() < 0.15 ? Math.floor(Math.random() * 30) : 0;
      } else if (rand < 0.85) {
        status = 'Leave'; hoursWorked = 0;
      } else if (rand < 0.92) {
        status = 'Half Day'; hoursWorked = 4;
      } else {
        status = 'Absent'; hoursWorked = 0;
      }
      records.push({ id: String(id++), employeeId: emp.employeeId, date: toDateStr(date), status, hoursWorked, overtimeHours: overtime, lateMinutes, remarks: '' });
    }
  });
  return records;
}

/* ===== UTILITIES ===== */
function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(d) {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function fmtCurrency(amount, currency = 'INR') {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[currency] || '₹';
  if (amount >= 100000) return `${sym}${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)   return `${sym}${(amount / 1000).toFixed(1)}K`;
  return `${sym}${amount.toLocaleString('en-IN')}`;
}

function fmtDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d} ${MONTHS[+m - 1].slice(0, 3)} ${y}`;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ===== MAIN APP CLASS ===== */
class PayrollApp {
  constructor() {
    this.state = {
      employees: [],
      attendance: [],
      payrolls: [],
      currentPage: 'dashboard',
      attendanceMonth: new Date(),
      payrollMonth: new Date(),
      charts: {},
      editingEmployeeId: null,
      editingAttendanceId: null,
    };

    this.settings = {
      companyName: 'My Company',
      currency: 'INR',
      payrollDay: 31,
      workingDays: 26,
      shiftHours: 8,
      otMultiplier: 1.5,
      pfRate: 12,
      webhookUrl: '',
    };

    this.init();
  }

  /* ===== INIT ===== */
  init() {
    this.loadSettings();
    const session = this.getSession();
    if (session) {
      this.showApp(session);
    } else {
      this.showLoginScreen();
    }
  }

  showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    if (this.settings.webhookUrl) {
      this.showLoginPanel();
    } else {
      this.showSetupPanel();
    }
  }

  showSetupPanel() {
    document.getElementById('setupPanel').style.display = 'block';
    document.getElementById('loginPanel').style.display = 'none';
    const el = document.getElementById('setupWebhookUrl');
    if (el) el.value = this.settings.webhookUrl || '';
  }

  showLoginPanel() {
    document.getElementById('setupPanel').style.display = 'none';
    document.getElementById('loginPanel').style.display = 'block';
    setTimeout(() => document.getElementById('loginEmail')?.focus(), 100);
  }

  setupContinue() {
    const url = document.getElementById('setupWebhookUrl').value.trim();
    if (!url || !url.startsWith('http')) {
      this.shakeInput('setupWebhookUrl');
      return;
    }
    this.settings.webhookUrl = url;
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(this.settings));
    this.showLoginPanel();
  }

  shakeInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.animation = 'none';
    el.style.borderColor = 'rgba(239,68,68,0.6)';
    el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
    setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 1800);
    el.focus();
  }

  async login(event) {
    event.preventDefault();
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn      = document.getElementById('loginBtn');
    const spinner  = document.getElementById('loginSpinner');
    const btnText  = document.getElementById('loginBtnText');
    const errEl    = document.getElementById('loginError');

    errEl.style.display = 'none';
    btn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';

    try {
      const res = await fetch(this.settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          source: 'payrollpro',
          timestamp: new Date().toISOString(),
          data: { email, password },
        }),
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json?.success && json?.data) {
        const session = {
          ...json.data,
          webhookUrl: this.settings.webhookUrl,
        };
        localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
        if (json.data.companyName) {
          this.settings.companyName = json.data.companyName;
          localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(this.settings));
        }
        this.showApp(session);
      } else {
        const msg = json?.message || 'Invalid email or password. Please try again.';
        errEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${msg}`;
        errEl.style.display = 'flex';
      }
    } catch {
      errEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Could not reach N8N. Check your webhook URL and try again.`;
      errEl.style.display = 'flex';
    } finally {
      btn.disabled = false;
      btnText.style.display = 'inline';
      spinner.style.display = 'none';
    }
  }

  showApp(session) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    this.session = session;
    if (session.webhookUrl) this.settings.webhookUrl = session.webhookUrl;

    this.updateUserChip(session);
    this.loadData();
    this.setupNavigation();
    this.updateHeaderInfo();
    this.renderCurrentPage();
    setTimeout(() => {
      this.initDashboardCharts();
      this.renderDashboard();
    }, 80);
  }

  updateUserChip(session) {
    const name = session.name || session.email || 'User';
    const role = session.role || 'user';
    document.getElementById('headerUserName').textContent = name.split(' ')[0];
    document.getElementById('headerUserRole').textContent = role;
    document.getElementById('headerUserAvatar').textContent = name[0].toUpperCase();
  }

  getSession() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || 'null');
      if (!s) return null;
      if (s.expiresAt && Date.now() > s.expiresAt) {
        localStorage.removeItem(STORAGE_KEYS.session);
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.session);
    this.session = null;
    if (this.state.charts) {
      Object.values(this.state.charts).forEach(c => c?.destroy?.());
      this.state.charts = {};
    }
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    this.showLoginPanel();
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
  }

  togglePasswordVisibility() {
    const input = document.getElementById('loginPassword');
    const icon  = document.getElementById('eyeIcon');
    if (input.type === 'password') {
      input.type = 'text';
      icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`;
    } else {
      input.type = 'password';
      icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
    }
  }

  loadData() {
    try {
      this.state.employees  = JSON.parse(localStorage.getItem(STORAGE_KEYS.employees)  || 'null') || DEMO_EMPLOYEES;
      this.state.attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.attendance) || 'null') || generateDemoAttendance(this.state.employees);
      this.state.payrolls   = JSON.parse(localStorage.getItem(STORAGE_KEYS.payrolls)   || '[]');
    } catch {
      this.state.employees  = DEMO_EMPLOYEES;
      this.state.attendance = generateDemoAttendance(this.state.employees);
      this.state.payrolls   = [];
    }
    this.saveData();
  }

  saveData() {
    try {
      localStorage.setItem(STORAGE_KEYS.employees,  JSON.stringify(this.state.employees));
      localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(this.state.attendance));
      localStorage.setItem(STORAGE_KEYS.payrolls,   JSON.stringify(this.state.payrolls));
    } catch { /* storage full */ }
  }

  loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || 'null');
      if (saved) this.settings = { ...this.settings, ...saved };
    } catch { /* use defaults */ }
  }

  saveSettings() {
    const companyName  = document.getElementById('settingCompanyName').value.trim() || 'My Company';
    const currency     = document.getElementById('settingCurrency').value;
    const payrollDay   = parseInt(document.getElementById('settingPayrollDay').value) || 31;
    const workingDays  = parseInt(document.getElementById('settingWorkingDays').value) || 26;
    const shiftHours   = parseInt(document.getElementById('settingShiftHours').value) || 8;
    const otMultiplier = parseFloat(document.getElementById('settingOTMultiplier').value) || 1.5;
    const pfRate       = parseFloat(document.getElementById('settingPFRate').value) || 12;
    const webhookUrl   = document.getElementById('settingWebhookUrl').value.trim();

    this.settings = { companyName, currency, payrollDay, workingDays, shiftHours, otMultiplier, pfRate, webhookUrl };
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(this.settings));
    this.updateHeaderInfo();
    this.updateN8NStatus();
    this.toast('Settings saved successfully', 'success');
  }

  resetSettings() {
    this.settings = { companyName:'My Company', currency:'INR', payrollDay:31, workingDays:26, shiftHours:8, otMultiplier:1.5, pfRate:12, webhookUrl:'' };
    this.populateSettingsForm();
    this.toast('Settings reset to defaults', 'info');
  }

  populateSettingsForm() {
    document.getElementById('settingCompanyName').value  = this.settings.companyName;
    document.getElementById('settingCurrency').value     = this.settings.currency;
    document.getElementById('settingPayrollDay').value   = this.settings.payrollDay;
    document.getElementById('settingWorkingDays').value  = this.settings.workingDays;
    document.getElementById('settingShiftHours').value   = this.settings.shiftHours;
    document.getElementById('settingOTMultiplier').value = this.settings.otMultiplier;
    document.getElementById('settingPFRate').value       = this.settings.pfRate;
    document.getElementById('settingWebhookUrl').value   = this.settings.webhookUrl;
  }

  updateHeaderInfo() {
    const name = this.settings.companyName || 'My Company';
    document.getElementById('companyNameText').textContent = name;
    document.getElementById('companyAvatar').textContent = name[0].toUpperCase();

    const now = new Date();
    document.getElementById('headerDate').textContent =
      now.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' });

    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning! 👋' : hour < 17 ? 'Good afternoon! 👋' : 'Good evening! 👋';
    const el = document.getElementById('dashGreeting');
    if (el) el.textContent = greeting;

    this.updateN8NStatus();
  }

  updateN8NStatus() {
    const connected = !!this.settings.webhookUrl;
    const dot = document.getElementById('statusIndicator');
    const txt = document.getElementById('statusText');
    const sdot = document.getElementById('n8nStatusDot');
    const stxt = document.getElementById('n8nStatusText');

    if (dot) {
      dot.className = `status-indicator ${connected ? 'connected' : 'disconnected'}`;
      txt.textContent = connected ? 'Connected' : 'Not Connected';
    }
    if (sdot) {
      sdot.className = `status-dot ${connected ? 'connected' : 'disconnected'}`;
      stxt.textContent = connected ? 'Connected' : 'Not Connected';
    }
  }

  /* ===== NAVIGATION ===== */
  setupNavigation() {
    document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
      btn.addEventListener('click', () => this.navigateTo(btn.dataset.page));
    });

    document.getElementById('modalOverlay').addEventListener('click', e => {
      if (e.target.id === 'modalOverlay') this.closeModal();
    });
    document.getElementById('payslipOverlay').addEventListener('click', e => {
      if (e.target.id === 'payslipOverlay') this.closePayslip();
    });
  }

  navigateTo(page) {
    this.state.currentPage = page;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(`page-${page}`)?.classList.add('active');
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

    const titles = { dashboard:'Dashboard', employees:'Employees', attendance:'Attendance',
                     payroll:'Payroll', reports:'Reports', settings:'Settings' };
    document.getElementById('pageTitle').textContent = titles[page] || 'PayrollPro';

    this.renderCurrentPage();
  }

  renderCurrentPage() {
    switch (this.state.currentPage) {
      case 'dashboard':  this.renderDashboard(); break;
      case 'employees':  this.renderEmployees(); break;
      case 'attendance': this.renderAttendance(); break;
      case 'payroll':    this.renderPayroll(); break;
      case 'reports':    this.renderReports(); break;
      case 'settings':   this.populateSettingsForm(); this.updateN8NStatus(); break;
    }
  }

  /* ===== DASHBOARD ===== */
  renderDashboard() {
    const employees   = this.state.employees;
    const active      = employees.filter(e => e.status === 'Active');
    const today       = toDateStr(new Date());
    const mk          = monthKey(new Date());
    const monthAtt    = this.state.attendance.filter(a => a.date.startsWith(mk));
    const todayAtt    = this.state.attendance.filter(a => a.date === today);

    // Metrics
    document.getElementById('metricEmployees').textContent = employees.length;
    document.getElementById('empTrend').textContent = `${active.length} active`;

    const monthPayrolls = this.state.payrolls.filter(p => p.month === mk);
    const totalNet = monthPayrolls.reduce((s, p) => s + (p.netPay || 0), 0);
    document.getElementById('metricPayroll').textContent = fmtCurrency(totalNet, this.settings.currency);

    const todayPresent = todayAtt.filter(a => ['Present','Half Day'].includes(a.status)).length;
    const attRate = active.length > 0 ? Math.round((todayPresent / active.length) * 100) : 0;
    document.getElementById('metricAttendance').textContent = `${attRate}%`;
    const attTrend = document.getElementById('attTrendLabel');
    if (attTrend) attTrend.textContent = `${todayPresent}/${active.length} today`;

    const nextPayroll = this.getNextPayrollDate();
    document.getElementById('metricNextPayroll').textContent = nextPayroll;
    document.getElementById('nextPayrollLabel').textContent = 'Upcoming';

    // Recent activity
    const recent = [...this.state.attendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    const actList = document.getElementById('recentActivity');
    if (recent.length === 0) {
      actList.innerHTML = '<div class="empty-state">No recent activity</div>';
    } else {
      actList.innerHTML = recent.map(a => {
        const emp = employees.find(e => e.employeeId === a.employeeId);
        const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG['Present'];
        const color = emp ? avatarColor(emp.employeeName) : '#6366F1';
        const init  = emp ? initials(emp.employeeName) : '?';
        return `
          <div class="activity-item">
            <div class="activity-dot" style="background:${color}">${init}</div>
            <div class="activity-text">
              <strong>${emp ? emp.employeeName : a.employeeId}</strong>
              <span><span class="badge ${cfg.badge}" style="font-size:11px">${a.status}</span> &nbsp;${a.hoursWorked}h worked</span>
            </div>
            <div class="activity-time">${fmtDate(a.date)}</div>
          </div>`;
      }).join('');
    }

    // Top earners
    const earnerList = document.getElementById('topEarners');
    const sorted = [...active].sort((a, b) => b.monthlySalary - a.monthlySalary).slice(0, 5);
    earnerList.innerHTML = sorted.map((emp, i) => `
      <div class="earner-item">
        <div class="earner-rank">${i + 1}</div>
        <div class="earner-avatar" style="background:${avatarColor(emp.employeeName)}">${initials(emp.employeeName)}</div>
        <div class="earner-info">
          <div class="earner-name">${emp.employeeName}</div>
          <div class="earner-dept">${emp.department}</div>
        </div>
        <div class="earner-salary">${fmtCurrency(emp.monthlySalary, this.settings.currency)}</div>
      </div>`).join('');

    // Dept chart legend
    this.updateDeptChart();
    this.updatePayrollChart();
  }

  getNextPayrollDate() {
    const now = new Date();
    const day = this.settings.payrollDay || 31;
    let target = new Date(now.getFullYear(), now.getMonth(), day);
    if (target <= now) target = new Date(now.getFullYear(), now.getMonth() + 1, day);
    const daysLeft = Math.ceil((target - now) / 86400000);
    if (daysLeft === 0) return 'Today';
    if (daysLeft === 1) return 'Tomorrow';
    if (daysLeft <= 7)  return `In ${daysLeft} days`;
    return target.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
  }

  /* ===== CHARTS ===== */
  initDashboardCharts() {
    const payrollCtx = document.getElementById('payrollChart');
    const deptCtx = document.getElementById('deptChart');
    if (!payrollCtx || !deptCtx) return;

    if (this.state.charts.payroll) { this.state.charts.payroll.destroy(); }
    if (this.state.charts.dept)    { this.state.charts.dept.destroy(); }

    this.state.charts.payroll = new Chart(payrollCtx, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'Net Payroll', data: [], backgroundColor: 'rgba(99,102,241,0.85)', borderRadius: 6, borderSkipped: false }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          callbacks: { label: ctx => ` ${fmtCurrency(ctx.parsed.y, this.settings.currency)}` }
        }},
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11, family: 'Inter' }, color: '#9CA3AF' }},
          y: { grid: { color: '#F3F4F6' }, border: { display: false }, ticks: { font: { size: 11, family: 'Inter' }, color: '#9CA3AF', callback: v => fmtCurrency(v, this.settings.currency) }},
        },
      }
    });

    this.state.charts.dept = new Chart(deptCtx, {
      type: 'doughnut',
      data: { labels: [], datasets: [{ data: [], backgroundColor: AVATAR_COLORS, borderWidth: 2, borderColor: '#fff', hoverOffset: 4 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` }}},
      }
    });

    this.updatePayrollChart();
    this.updateDeptChart();
  }

  updatePayrollChart() {
    const chart = this.state.charts.payroll;
    if (!chart) return;

    const period = parseInt(document.getElementById('chartPeriod')?.value || '6');
    const labels = [];
    const data = [];
    const now = new Date();

    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mk = monthKey(d);
      labels.push(MONTHS[d.getMonth()].slice(0, 3));
      const payrolls = this.state.payrolls.filter(p => p.month === mk);
      const total = payrolls.reduce((s, p) => s + (p.netPay || 0), 0);

      if (total === 0 && i > 0) {
        const active = this.state.employees.filter(e => e.status === 'Active');
        data.push(active.reduce((s, e) => s + e.monthlySalary * 0.88, 0));
      } else {
        data.push(total);
      }
    }

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update('none');
  }

  updateDeptChart() {
    const chart = this.state.charts.dept;
    if (!chart) return;

    const deptMap = {};
    this.state.employees.filter(e => e.status === 'Active').forEach(e => {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });

    const labels = Object.keys(deptMap);
    const data = labels.map(d => deptMap[d]);
    const colors = labels.map((_, i) => AVATAR_COLORS[i % AVATAR_COLORS.length]);

    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = colors;
    chart.update('none');

    const legend = document.getElementById('deptLegend');
    if (legend) {
      legend.innerHTML = labels.map((l, i) => `
        <div class="dept-legend-item">
          <div class="dept-name">
            <div class="dept-color-dot" style="background:${colors[i]}"></div>
            ${l}
          </div>
          <div class="dept-count">${data[i]}</div>
        </div>`).join('');
    }
  }

  /* ===== EMPLOYEES ===== */
  renderEmployees() {
    this.updateDeptFilter();
    this.filterEmployees();
  }

  updateDeptFilter() {
    const depts = [...new Set(this.state.employees.map(e => e.department))].sort();
    const sel = document.getElementById('empDeptFilter');
    const cur = sel.value;
    sel.innerHTML = '<option value="">All Departments</option>' +
      depts.map(d => `<option value="${d}" ${d === cur ? 'selected' : ''}>${d}</option>`).join('');
  }

  filterEmployees() {
    const q      = document.getElementById('empSearch')?.value.toLowerCase() || '';
    const dept   = document.getElementById('empDeptFilter')?.value || '';
    const status = document.getElementById('empStatusFilter')?.value || '';

    const filtered = this.state.employees.filter(e =>
      (!q    || e.employeeName.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)) &&
      (!dept || e.department === dept) &&
      (!status || e.status === status)
    );

    document.getElementById('empCountLabel').textContent =
      `${filtered.length} of ${this.state.employees.length} employees`;

    const tbody = document.getElementById('employeesTbody');
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="table-empty">No employees found</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(e => {
      const color = avatarColor(e.employeeName);
      const init  = initials(e.employeeName);
      return `
        <tr>
          <td>
            <div class="emp-cell">
              <div class="emp-avatar" style="background:${color}">${init}</div>
              <div class="emp-info">
                <div class="emp-name">${e.employeeName}</div>
                <div class="emp-id">${e.employeeId}</div>
              </div>
            </div>
          </td>
          <td>${e.department}</td>
          <td>${e.role}</td>
          <td>${fmtDate(e.joiningDate)}</td>
          <td><strong>${fmtCurrency(e.monthlySalary, this.settings.currency)}</strong></td>
          <td><span class="badge ${e.status === 'Active' ? 'badge-success' : 'badge-gray'}">${e.status}</span></td>
          <td>
            <div class="row-actions">
              <button class="btn btn-xs btn-secondary" onclick="app.openEmployeeModal('${e.employeeId}')">Edit</button>
              <button class="btn btn-xs btn-danger" onclick="app.deleteEmployee('${e.employeeId}')">Delete</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  openEmployeeModal(employeeId = null) {
    this.state.editingEmployeeId = employeeId;
    const emp = employeeId ? this.state.employees.find(e => e.employeeId === employeeId) : null;

    document.getElementById('modalTitle').textContent = emp ? 'Edit Employee' : 'Add Employee';
    document.getElementById('modalBody').innerHTML = `
      <form id="employeeForm" onsubmit="app.saveEmployee(event)">
        <div class="form-grid-2">
          <div class="form-group">
            <label>Employee ID *</label>
            <input type="text" class="form-input" name="employeeId" required placeholder="E001" value="${emp?.employeeId || ''}" ${emp ? 'readonly style="background:#f9fafb"' : ''}>
          </div>
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" class="form-input" name="employeeName" required placeholder="John Doe" value="${emp?.employeeName || ''}">
          </div>
          <div class="form-group">
            <label>Department *</label>
            <input type="text" class="form-input" name="department" required placeholder="Engineering" value="${emp?.department || ''}" list="deptList">
            <datalist id="deptList">
              ${[...new Set(this.state.employees.map(e => e.department))].map(d => `<option value="${d}">`).join('')}
            </datalist>
          </div>
          <div class="form-group">
            <label>Role / Designation *</label>
            <input type="text" class="form-input" name="role" required placeholder="Software Engineer" value="${emp?.role || ''}">
          </div>
          <div class="form-group">
            <label>Joining Date *</label>
            <input type="date" class="form-input" name="joiningDate" required value="${emp?.joiningDate || ''}">
          </div>
          <div class="form-group">
            <label>Monthly CTC (${this.settings.currency}) *</label>
            <input type="number" class="form-input" name="monthlySalary" required placeholder="50000" min="0" value="${emp?.monthlySalary || ''}">
          </div>
          <div class="form-group">
            <label>Status</label>
            <select class="form-input" name="status">
              <option value="Active" ${!emp || emp.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${emp?.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
          </div>
          <div class="form-group">
            <label>Payment Method</label>
            <select class="form-input" name="paymentMethod">
              <option value="Bank Transfer" ${!emp || emp.paymentMethod === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
              <option value="UPI" ${emp?.paymentMethod === 'UPI' ? 'selected' : ''}>UPI</option>
              <option value="Cash" ${emp?.paymentMethod === 'Cash' ? 'selected' : ''}>Cash</option>
            </select>
          </div>
          <div class="form-group col-span-2">
            <label>Bank / UPI Details</label>
            <input type="text" class="form-input" name="paymentDetails" placeholder="Account No / UPI ID" value="${emp?.paymentDetails || ''}">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${emp ? 'Update Employee' : 'Add Employee'}</button>
        </div>
      </form>`;

    document.getElementById('modalOverlay').classList.add('active');
  }

  saveEmployee(event) {
    event.preventDefault();
    const form = event.target;
    const fd = new FormData(form);

    const emp = {
      employeeId:     fd.get('employeeId').trim(),
      employeeName:   fd.get('employeeName').trim(),
      department:     fd.get('department').trim(),
      role:           fd.get('role').trim(),
      joiningDate:    fd.get('joiningDate'),
      monthlySalary:  parseFloat(fd.get('monthlySalary')),
      status:         fd.get('status'),
      paymentMethod:  fd.get('paymentMethod'),
      paymentDetails: fd.get('paymentDetails').trim(),
    };

    if (!emp.employeeId || !emp.employeeName || !emp.department || !emp.role || !emp.joiningDate || isNaN(emp.monthlySalary)) {
      this.toast('Please fill in all required fields', 'error');
      return;
    }

    const idx = this.state.employees.findIndex(e => e.employeeId === emp.employeeId);
    if (idx >= 0) {
      this.state.employees[idx] = emp;
    } else {
      const dup = this.state.employees.find(e => e.employeeId === emp.employeeId);
      if (dup && !this.state.editingEmployeeId) {
        this.toast('Employee ID already exists', 'error');
        return;
      }
      this.state.employees.push(emp);
    }

    this.saveData();
    this.closeModal();
    this.renderEmployees();
    this.sendToN8N('employee_upsert', emp);
    this.toast(`Employee ${idx >= 0 ? 'updated' : 'added'} successfully`, 'success');
  }

  deleteEmployee(employeeId) {
    const emp = this.state.employees.find(e => e.employeeId === employeeId);
    if (!emp) return;

    this.openConfirmDialog(
      `Delete ${emp.employeeName}?`,
      'This will remove the employee and all their attendance records. This action cannot be undone.',
      () => {
        this.state.employees = this.state.employees.filter(e => e.employeeId !== employeeId);
        this.state.attendance = this.state.attendance.filter(a => a.employeeId !== employeeId);
        this.saveData();
        this.renderEmployees();
        this.sendToN8N('employee_delete', { employeeId });
        this.toast('Employee deleted', 'success');
      }
    );
  }

  /* ===== ATTENDANCE ===== */
  renderAttendance() {
    document.getElementById('attendanceMonthLabel').textContent = monthLabel(this.state.attendanceMonth);
    this.renderAttendanceStats();
    this.filterAttendance();
  }

  renderAttendanceStats() {
    const mk = monthKey(this.state.attendanceMonth);
    const records = this.state.attendance.filter(a => a.date.startsWith(mk));

    const stats = { Present: 0, Absent: 0, 'Half Day': 0, Leave: 0, Holiday: 0, 'Weekly Off': 0 };
    records.forEach(a => { if (a.status in stats) stats[a.status]++; });

    document.getElementById('attendanceStats').innerHTML = Object.entries(stats).map(([label, count]) => `
      <div class="att-stat-card">
        <div class="att-stat-label">${label}</div>
        <div class="att-stat-value">${count}</div>
      </div>`).join('');
  }

  filterAttendance() {
    const q      = document.getElementById('attSearch')?.value.toLowerCase() || '';
    const status = document.getElementById('attStatusFilter')?.value || '';
    const mk     = monthKey(this.state.attendanceMonth);

    const filtered = this.state.attendance
      .filter(a => a.date.startsWith(mk))
      .filter(a => {
        const emp = this.state.employees.find(e => e.employeeId === a.employeeId);
        const name = emp ? emp.employeeName.toLowerCase() : a.employeeId.toLowerCase();
        return (!q || name.includes(q) || a.employeeId.toLowerCase().includes(q)) &&
               (!status || a.status === status);
      })
      .sort((a, b) => b.date.localeCompare(a.date) || a.employeeId.localeCompare(b.employeeId));

    const tbody = document.getElementById('attendanceTbody');
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="table-empty">No attendance records found</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(a => {
      const emp = this.state.employees.find(e => e.employeeId === a.employeeId);
      const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG['Present'];
      const color = emp ? avatarColor(emp.employeeName) : '#6366F1';
      const init  = emp ? initials(emp.employeeName) : '?';
      return `
        <tr>
          <td>${fmtDate(a.date)}</td>
          <td>
            <div class="emp-cell">
              <div class="emp-avatar" style="background:${color};width:28px;height:28px;font-size:11px">${init}</div>
              <div class="emp-info">
                <div class="emp-name" style="font-size:13px">${emp ? emp.employeeName : a.employeeId}</div>
                <div class="emp-id">${a.employeeId}</div>
              </div>
            </div>
          </td>
          <td><span class="badge ${cfg.badge}">${a.status}</span></td>
          <td>${a.hoursWorked || 0}h</td>
          <td>${a.overtimeHours > 0 ? `<span style="color:var(--color-warning-text);font-weight:600">+${a.overtimeHours}h</span>` : '—'}</td>
          <td>${a.lateMinutes > 0 ? `<span style="color:var(--color-danger-text)">${a.lateMinutes}m</span>` : '—'}</td>
          <td style="color:var(--color-text-secondary);font-size:12.5px">${a.remarks || '—'}</td>
          <td>
            <div class="row-actions">
              <button class="btn btn-xs btn-secondary" onclick="app.openAttendanceModal('${a.id}')">Edit</button>
              <button class="btn btn-xs btn-danger" onclick="app.deleteAttendance('${a.id}')">Del</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  changeAttendanceMonth(delta) {
    const d = this.state.attendanceMonth;
    this.state.attendanceMonth = new Date(d.getFullYear(), d.getMonth() + delta, 1);
    this.renderAttendance();
  }

  openAttendanceModal(attendanceId = null) {
    const rec = attendanceId ? this.state.attendance.find(a => a.id === attendanceId) : null;
    this.state.editingAttendanceId = attendanceId;

    const empOptions = this.state.employees
      .filter(e => e.status === 'Active')
      .map(e => `<option value="${e.employeeId}" ${rec?.employeeId === e.employeeId ? 'selected' : ''}>${e.employeeName} (${e.employeeId})</option>`)
      .join('');

    const statuses = ['Present','Absent','Half Day','Leave','Holiday','Weekly Off'];
    const statusOptions = statuses.map(s =>
      `<option value="${s}" ${(rec?.status || 'Present') === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    document.getElementById('modalTitle').textContent = rec ? 'Edit Attendance' : 'Record Attendance';
    document.getElementById('modalBody').innerHTML = `
      <form id="attendanceForm" onsubmit="app.saveAttendance(event)">
        <div class="form-grid-2">
          <div class="form-group">
            <label>Date *</label>
            <input type="date" class="form-input" name="date" required value="${rec?.date || toDateStr(new Date())}">
          </div>
          <div class="form-group">
            <label>Employee *</label>
            <select class="form-input" name="employeeId" required>
              <option value="">Select Employee</option>
              ${empOptions}
            </select>
          </div>
          <div class="form-group col-span-2">
            <label>Status *</label>
            <select class="form-input" name="status" required onchange="app.onAttendanceStatusChange(this)">
              ${statusOptions}
            </select>
          </div>
          <div class="form-group" id="hoursWorkedGroup">
            <label>Hours Worked</label>
            <input type="number" class="form-input" name="hoursWorked" placeholder="${this.settings.shiftHours}" min="0" max="24" step="0.5" value="${rec?.hoursWorked ?? this.settings.shiftHours}">
          </div>
          <div class="form-group" id="lateMinutesGroup">
            <label>Late Minutes</label>
            <input type="number" class="form-input" name="lateMinutes" placeholder="0" min="0" max="480" value="${rec?.lateMinutes || 0}">
          </div>
          <div class="form-group col-span-2">
            <label>Remarks</label>
            <input type="text" class="form-input" name="remarks" placeholder="Optional notes" value="${rec?.remarks || ''}">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">${rec ? 'Update Record' : 'Save Record'}</button>
        </div>
      </form>`;

    document.getElementById('modalOverlay').classList.add('active');
  }

  onAttendanceStatusChange(sel) {
    const hide = ['Absent','Holiday','Weekly Off'].includes(sel.value);
    const hw = document.getElementById('hoursWorkedGroup');
    const lm = document.getElementById('lateMinutesGroup');
    if (hw) hw.style.display = hide ? 'none' : '';
    if (lm) lm.style.display = hide ? 'none' : '';
  }

  saveAttendance(event) {
    event.preventDefault();
    const form = event.target;
    const fd = new FormData(form);
    const status = fd.get('status');

    const hoursWorked = ['Absent','Holiday','Weekly Off'].includes(status) ? 0 :
      parseFloat(fd.get('hoursWorked')) || this.settings.shiftHours;
    const overtimeHours = Math.max(0, hoursWorked - this.settings.shiftHours);

    const rec = {
      id: this.state.editingAttendanceId || uid(),
      employeeId:   fd.get('employeeId'),
      date:         fd.get('date'),
      status,
      hoursWorked,
      overtimeHours,
      lateMinutes:  parseInt(fd.get('lateMinutes')) || 0,
      remarks:      fd.get('remarks').trim(),
    };

    if (!rec.employeeId || !rec.date || !rec.status) {
      this.toast('Please fill in all required fields', 'error');
      return;
    }

    const idx = this.state.attendance.findIndex(a => a.id === rec.id);
    if (idx >= 0) {
      this.state.attendance[idx] = rec;
    } else {
      this.state.attendance.push(rec);
    }

    this.saveData();
    this.closeModal();
    this.renderAttendance();
    this.sendToN8N('attendance_record', rec);
    this.toast('Attendance record saved', 'success');
  }

  deleteAttendance(id) {
    this.openConfirmDialog('Delete record?', 'This attendance record will be permanently removed.', () => {
      this.state.attendance = this.state.attendance.filter(a => a.id !== id);
      this.saveData();
      this.renderAttendance();
      this.sendToN8N('attendance_delete', { id });
      this.toast('Attendance record deleted', 'success');
    });
  }

  /* ===== PAYROLL ===== */
  renderPayroll() {
    document.getElementById('payrollMonthLabel').textContent = monthLabel(this.state.payrollMonth);
    const mk = monthKey(this.state.payrollMonth);
    const payrolls = this.state.payrolls.filter(p => p.month === mk);
    this.renderPayrollSummary(payrolls);
    this.renderPayrollTable(payrolls);
  }

  renderPayrollSummary(payrolls) {
    const totalGross = payrolls.reduce((s, p) => s + p.grossPay, 0);
    const totalDed   = payrolls.reduce((s, p) => s + p.totalDeductions, 0);
    const totalNet   = payrolls.reduce((s, p) => s + p.netPay, 0);
    const totalOT    = payrolls.reduce((s, p) => s + p.overtimePay, 0);

    document.getElementById('payrollSummaryGrid').innerHTML = `
      <div class="payroll-sum-card">
        <div class="payroll-sum-label">Employees Processed</div>
        <div class="payroll-sum-value">${payrolls.length}</div>
      </div>
      <div class="payroll-sum-card">
        <div class="payroll-sum-label">Total Gross Payroll</div>
        <div class="payroll-sum-value">${fmtCurrency(totalGross, this.settings.currency)}</div>
      </div>
      <div class="payroll-sum-card">
        <div class="payroll-sum-label">Total Deductions</div>
        <div class="payroll-sum-value">${fmtCurrency(totalDed, this.settings.currency)}</div>
      </div>
      <div class="payroll-sum-card">
        <div class="payroll-sum-label">Net Payable</div>
        <div class="payroll-sum-value" style="color:var(--color-primary)">${fmtCurrency(totalNet, this.settings.currency)}</div>
      </div>`;
  }

  renderPayrollTable(payrolls) {
    const tbody = document.getElementById('payrollTbody');
    if (payrolls.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="table-empty">Run payroll for this month to see results</td></tr>';
      return;
    }

    tbody.innerHTML = payrolls.map(p => {
      const emp = this.state.employees.find(e => e.employeeId === p.employeeId);
      const color = emp ? avatarColor(emp.employeeName) : '#6366F1';
      const init  = emp ? initials(emp.employeeName) : '?';
      return `
        <tr>
          <td>
            <div class="emp-cell">
              <div class="emp-avatar" style="background:${color}">${init}</div>
              <div class="emp-info">
                <div class="emp-name">${p.employeeName}</div>
                <div class="emp-id">${p.employeeId}</div>
              </div>
            </div>
          </td>
          <td>${p.paidDays} / ${this.settings.workingDays}</td>
          <td>${fmtCurrency(p.basicPay, this.settings.currency)}</td>
          <td>${p.overtimePay > 0 ? `<span style="color:var(--color-warning-text);font-weight:600">+${fmtCurrency(p.overtimePay, this.settings.currency)}</span>` : '—'}</td>
          <td><strong>${fmtCurrency(p.grossPay, this.settings.currency)}</strong></td>
          <td><span style="color:var(--color-danger-text)">${fmtCurrency(p.totalDeductions, this.settings.currency)}</span></td>
          <td><strong style="color:var(--color-primary)">${fmtCurrency(p.netPay, this.settings.currency)}</strong></td>
          <td><span class="badge badge-success">${p.status}</span></td>
          <td>
            <div class="row-actions">
              <button class="btn btn-xs btn-secondary" onclick="app.openPayslip('${p.employeeId}','${p.month}')">Payslip</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  }

  changePayrollMonth(delta) {
    const d = this.state.payrollMonth;
    this.state.payrollMonth = new Date(d.getFullYear(), d.getMonth() + delta, 1);
    this.renderPayroll();
  }

  generatePayroll() {
    const mk = monthKey(this.state.payrollMonth);
    const activeEmps = this.state.employees.filter(e => e.status === 'Active');

    if (activeEmps.length === 0) {
      this.toast('No active employees to process', 'error');
      return;
    }

    const btn = document.getElementById('runPayrollBtn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Processing...';

    setTimeout(() => {
      const newPayrolls = activeEmps.map(emp => this.calcPayroll(emp, mk));

      this.state.payrolls = this.state.payrolls.filter(p => p.month !== mk);
      this.state.payrolls.push(...newPayrolls);
      this.saveData();

      this.renderPayroll();
      this.sendToN8N('payroll_generate', { month: mk, payrolls: newPayrolls });
      this.toast(`Payroll processed for ${activeEmps.length} employees`, 'success');

      btn.disabled = false;
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run Payroll`;
    }, 600);
  }

  calcPayroll(emp, mk) {
    const { workingDays, shiftHours, otMultiplier, pfRate, currency } = this.settings;
    const records = this.state.attendance.filter(a => a.employeeId === emp.employeeId && a.date.startsWith(mk));

    let paidDays = 0, absentDays = 0, regHours = 0, otHours = 0;

    records.forEach(r => {
      switch (r.status) {
        case 'Present':
          paidDays += 1;
          regHours += Math.min(r.hoursWorked || shiftHours, shiftHours);
          otHours  += Math.max((r.hoursWorked || shiftHours) - shiftHours, 0);
          break;
        case 'Half Day':
          paidDays += 0.5;
          regHours += shiftHours / 2;
          break;
        case 'Leave':
          paidDays += 1;
          break;
        case 'Absent':
          absentDays += 1;
          break;
      }
    });

    const dailyRate  = emp.monthlySalary / workingDays;
    const hourlyRate = emp.monthlySalary / (workingDays * shiftHours);
    const otRate     = hourlyRate * otMultiplier;

    const basicPay    = Math.round(dailyRate * paidDays);
    const overtimePay = Math.round(otRate * otHours);
    const grossPay    = basicPay + overtimePay;

    const pfDeduction  = emp.monthlySalary <= 15000 ? Math.min(Math.round(basicPay * (pfRate / 100)), 1800) : 0;
    const esiDeduction = emp.monthlySalary <= 21000  ? Math.round(grossPay * 0.0075) : 0;
    const totalDeductions = pfDeduction + esiDeduction;
    const netPay = grossPay - totalDeductions;

    return {
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      department: emp.department,
      month: mk,
      paidDays: Math.round(paidDays * 10) / 10,
      absentDays,
      regularHours: Math.round(regHours * 10) / 10,
      overtimeHours: Math.round(otHours * 10) / 10,
      dailyRate: Math.round(dailyRate),
      hourlyRate: Math.round(hourlyRate * 100) / 100,
      otRate: Math.round(otRate * 100) / 100,
      basicPay,
      overtimePay,
      grossPay,
      pfDeduction,
      esiDeduction,
      totalDeductions,
      netPay,
      status: 'Processed',
      currency,
    };
  }

  exportPayrollCSV() {
    const mk = monthKey(this.state.payrollMonth);
    const payrolls = this.state.payrolls.filter(p => p.month === mk);

    if (payrolls.length === 0) {
      this.toast('No payroll data to export. Run payroll first.', 'error');
      return;
    }

    const headers = ['Employee ID','Employee Name','Department','Paid Days','Absent Days',
                     'Regular Hours','Overtime Hours','Basic Pay','Overtime Pay','Gross Pay',
                     'PF Deduction','ESI Deduction','Total Deductions','Net Pay','Status'];

    const rows = payrolls.map(p => [
      p.employeeId, p.employeeName, p.department, p.paidDays, p.absentDays,
      p.regularHours, p.overtimeHours, p.basicPay, p.overtimePay, p.grossPay,
      p.pfDeduction, p.esiDeduction, p.totalDeductions, p.netPay, p.status,
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `payroll_${mk}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast('CSV exported successfully', 'success');
  }

  /* ===== PAYSLIP ===== */
  openPayslip(employeeId, month) {
    const p   = this.state.payrolls.find(x => x.employeeId === employeeId && x.month === month);
    const emp = this.state.employees.find(e => e.employeeId === employeeId);
    if (!p || !emp) { this.toast('Payslip not found', 'error'); return; }

    const [y, m] = month.split('-');
    const monthName = `${MONTHS[+m - 1]} ${y}`;
    const sym = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[this.settings.currency] || '₹';

    document.getElementById('payslipBody').innerHTML = `
      <div class="payslip">
        <div class="payslip-header">
          <div class="payslip-company">
            <h2>${this.settings.companyName}</h2>
            <p>Payroll Department &bull; ${monthName}</p>
          </div>
          <div class="payslip-meta">
            <h3>Pay Slip</h3>
            <p>Payment Period: ${monthName}</p>
            <p>Payment Day: ${this.settings.payrollDay}</p>
          </div>
        </div>

        <div class="payslip-employee">
          <div class="payslip-field">
            <span>Employee ID</span>
            <span>${emp.employeeId}</span>
          </div>
          <div class="payslip-field">
            <span>Employee Name</span>
            <span>${emp.employeeName}</span>
          </div>
          <div class="payslip-field">
            <span>Department</span>
            <span>${emp.department}</span>
          </div>
          <div class="payslip-field">
            <span>Designation</span>
            <span>${emp.role}</span>
          </div>
          <div class="payslip-field">
            <span>Date of Joining</span>
            <span>${fmtDate(emp.joiningDate)}</span>
          </div>
          <div class="payslip-field">
            <span>Payment Method</span>
            <span>${emp.paymentMethod}</span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;padding:14px;background:var(--color-bg);border-radius:var(--radius-md)">
          <div class="payslip-field"><span>Working Days</span><span>${this.settings.workingDays}</span></div>
          <div class="payslip-field"><span>Paid Days</span><span>${p.paidDays}</span></div>
          <div class="payslip-field"><span>Absent Days</span><span>${p.absentDays}</span></div>
          <div class="payslip-field"><span>Regular Hours</span><span>${p.regularHours}h</span></div>
          <div class="payslip-field"><span>Overtime Hours</span><span>${p.overtimeHours}h</span></div>
          <div class="payslip-field"><span>OT Rate</span><span>${sym}${p.otRate}/hr</span></div>
        </div>

        <div class="payslip-earnings">
          <div class="payslip-section">
            <h4>Earnings</h4>
            <div class="payslip-row"><span>Basic Pay (${p.paidDays} days)</span><span>${sym}${p.basicPay.toLocaleString('en-IN')}</span></div>
            <div class="payslip-row"><span>Overtime Pay (${p.overtimeHours}h)</span><span>${sym}${p.overtimePay.toLocaleString('en-IN')}</span></div>
            <div class="payslip-row"><span>Gross Earnings</span><span>${sym}${p.grossPay.toLocaleString('en-IN')}</span></div>
          </div>
          <div class="payslip-section">
            <h4>Deductions</h4>
            <div class="payslip-row"><span>Provident Fund (PF)</span><span>${sym}${p.pfDeduction.toLocaleString('en-IN')}</span></div>
            <div class="payslip-row"><span>ESI</span><span>${sym}${p.esiDeduction.toLocaleString('en-IN')}</span></div>
            <div class="payslip-row"><span>Total Deductions</span><span>${sym}${p.totalDeductions.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <div class="payslip-net">
          <div class="payslip-net-label">Net Pay &bull; ${monthName}</div>
          <div class="payslip-net-amount">${sym}${p.netPay.toLocaleString('en-IN')}</div>
        </div>

        <p style="text-align:center;font-size:11.5px;color:var(--color-text-muted);margin-top:16px">
          This is a computer-generated pay slip and does not require a signature.
        </p>
      </div>`;

    document.getElementById('payslipOverlay').classList.add('active');
  }

  closePayslip() {
    document.getElementById('payslipOverlay').classList.remove('active');
  }

  /* ===== REPORTS ===== */
  renderReports() {
    this.initReportCharts();
    this.renderDeptSalaryTable();
  }

  initReportCharts() {
    const payrollCtx = document.getElementById('reportPayrollChart');
    const attCtx     = document.getElementById('reportAttChart');
    if (!payrollCtx || !attCtx) return;

    if (this.state.charts.reportPayroll) this.state.charts.reportPayroll.destroy();
    if (this.state.charts.reportAtt)     this.state.charts.reportAtt.destroy();

    const now = new Date();
    const labels = [];
    const payrollData = [];
    const attData = [];

    for (let i = 11; i >= 0; i--) {
      const d  = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mk = monthKey(d);
      labels.push(MONTHS[d.getMonth()].slice(0, 3));

      const monthPayrolls = this.state.payrolls.filter(p => p.month === mk);
      const totalNet = monthPayrolls.reduce((s, p) => s + p.netPay, 0);

      if (totalNet === 0) {
        const active = this.state.employees.filter(e => e.status === 'Active');
        payrollData.push(active.reduce((s, e) => s + e.monthlySalary * 0.88, 0));
      } else {
        payrollData.push(totalNet);
      }

      const attRecords = this.state.attendance.filter(a => a.date.startsWith(mk));
      const present = attRecords.filter(a => ['Present','Half Day'].includes(a.status)).length;
      const total   = attRecords.filter(a => !['Holiday','Weekly Off'].includes(a.status)).length;
      attData.push(total > 0 ? Math.round((present / total) * 100) : 0);
    }

    this.state.charts.reportPayroll = new Chart(payrollCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Net Payroll',
          data: payrollData,
          borderColor: '#6366F1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366F1',
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${fmtCurrency(ctx.parsed.y, this.settings.currency)}` }}
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 }, color: '#9CA3AF' }},
          y: { grid: { color: '#F3F4F6' }, border: { display: false }, ticks: { font: { size: 11 }, color: '#9CA3AF', callback: v => fmtCurrency(v, this.settings.currency) }},
        }
      }
    });

    this.state.charts.reportAtt = new Chart(attCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Attendance Rate %',
          data: attData,
          backgroundColor: attData.map(v => v >= 90 ? 'rgba(16,185,129,0.8)' : v >= 75 ? 'rgba(245,158,11,0.8)' : 'rgba(239,68,68,0.8)'),
          borderRadius: 5,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y}%` }}
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 }, color: '#9CA3AF' }},
          y: { grid: { color: '#F3F4F6' }, border: { display: false }, min: 0, max: 100,
               ticks: { font: { size: 11 }, color: '#9CA3AF', callback: v => `${v}%` }},
        }
      }
    });
  }

  renderDeptSalaryTable() {
    const deptMap = {};
    this.state.employees.filter(e => e.status === 'Active').forEach(e => {
      if (!deptMap[e.department]) deptMap[e.department] = { count: 0, total: 0 };
      deptMap[e.department].count++;
      deptMap[e.department].total += e.monthlySalary;
    });

    const maxTotal = Math.max(...Object.values(deptMap).map(d => d.total), 1);
    const sorted = Object.entries(deptMap).sort((a, b) => b[1].total - a[1].total);

    document.getElementById('deptSalaryTable').innerHTML = sorted.map(([dept, info], i) => `
      <div class="dept-table-row">
        <div style="min-width:120px;font-weight:600;font-size:13px">${dept}</div>
        <div class="dept-bar-wrap">
          <div class="dept-bar" style="width:${(info.total / maxTotal * 100).toFixed(1)}%;background:${AVATAR_COLORS[i % AVATAR_COLORS.length]}"></div>
        </div>
        <div style="min-width:80px;text-align:right;font-size:12.5px;color:var(--color-text-secondary)">${info.count} emp</div>
        <div style="min-width:100px;text-align:right;font-weight:700">${fmtCurrency(info.total, this.settings.currency)}</div>
      </div>`).join('');
  }

  /* ===== N8N WEBHOOK ===== */
  async sendToN8N(action, data) {
    if (!this.settings.webhookUrl) return;

    const payload = {
      action,
      source: 'payrollpro',
      businessName: this.settings.companyName,
      timestamp: new Date().toISOString(),
      data,
    };

    try {
      const res = await fetch(this.settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.data) this.handleN8NResponse(action, json.data);
      }
    } catch {
      /* silent fail — local data already saved */
    }
  }

  handleN8NResponse(action, data) {
    if (action === 'employee_list' && Array.isArray(data)) {
      this.state.employees = data;
      this.saveData();
      if (this.state.currentPage === 'employees') this.renderEmployees();
    }
    if (action === 'attendance_list' && Array.isArray(data)) {
      this.state.attendance = data;
      this.saveData();
      if (this.state.currentPage === 'attendance') this.renderAttendance();
    }
  }

  async testWebhook() {
    const url = document.getElementById('settingWebhookUrl').value.trim();
    if (!url) { this.toast('Please enter a webhook URL first', 'error'); return; }

    this.toast('Testing connection...', 'info');

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'webhook_test', source: 'payrollpro', timestamp: new Date().toISOString() }),
      });

      if (res.ok) {
        this.settings.webhookUrl = url;
        this.updateN8NStatus();
        this.toast('N8N connected successfully!', 'success');
      } else {
        this.toast(`Connection failed: HTTP ${res.status}`, 'error');
      }
    } catch (err) {
      this.toast('Connection failed. Check the URL and try again.', 'error');
    }
  }

  /* ===== MODAL HELPERS ===== */
  closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    this.state.editingEmployeeId = null;
    this.state.editingAttendanceId = null;
  }

  openConfirmDialog(title, message, onConfirm) {
    document.getElementById('modalTitle').textContent = 'Confirm';
    document.getElementById('modalBody').innerHTML = `
      <div class="confirm-dialog">
        <div class="confirm-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <h4>${title}</h4>
        <p>${message}</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
          <button class="btn btn-danger" id="confirmBtn">Delete</button>
        </div>
      </div>`;

    document.getElementById('confirmBtn').onclick = () => { this.closeModal(); onConfirm(); };
    document.getElementById('modalOverlay').classList.add('active');
  }

  /* ===== TOAST ===== */
  toast(message, type = 'info') {
    const icons = {
      success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
      error:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    };

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span>${message}</span>
      <span class="toast-dismiss" onclick="this.parentElement.remove()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </span>`;

    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }
}

/* ===== BOOT ===== */
const app = new PayrollApp();
