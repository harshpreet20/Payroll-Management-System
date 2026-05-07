const STORAGE_KEY = "staff-payroll-ui-settings";

const tabs = document.querySelectorAll(".nav-tab");
const panels = document.querySelectorAll(".tab-panel");
const screenTitle = document.querySelector("#screenTitle");
const connectionStatus = document.querySelector("#connectionStatus");
const payloadPreview = document.querySelector("#payloadPreview");
const toast = document.querySelector("#toast");

const defaultSettings = {
  webhookUrl: "",
  businessName: "",
};

const titles = {
  attendance: "Daily Attendance",
  employees: "Employee Master",
  payroll: "Monthly Payroll",
  settings: "Webhook Settings",
};

let latestPayload = {};

function getSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  updateConnectionStatus();
}

function updateConnectionStatus() {
  const { webhookUrl } = getSettings();
  connectionStatus.textContent = webhookUrl ? "Webhook ready" : "Webhook not set";
  connectionStatus.className = webhookUrl ? "status-pill ready" : "status-pill";
}

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = type === "error" ? "toast show error" : "toast show";
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.className = "toast";
  }, 4200);
}

function setPayload(payload) {
  latestPayload = payload;
  payloadPreview.textContent = JSON.stringify(payload, null, 2);
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function numberValue(value) {
  return value === "" || value === null ? null : Number(value);
}

function createBasePayload(action, data) {
  const settings = getSettings();
  return {
    action,
    source: "custom-payroll-ui",
    businessName: settings.businessName || null,
    submittedAt: new Date().toISOString(),
    data,
  };
}

async function sendToWebhook(payload) {
  const { webhookUrl } = getSettings();
  setPayload(payload);

  if (!webhookUrl) {
    showToast("Add your n8n webhook URL in Settings first.", "error");
    return;
  }

  connectionStatus.textContent = "Sending...";
  connectionStatus.className = "status-pill";

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    connectionStatus.textContent = "Webhook ready";
    connectionStatus.className = "status-pill ready";
    showToast("Sent to n8n successfully.");
  } catch (error) {
    connectionStatus.textContent = "Send failed";
    connectionStatus.className = "status-pill error";
    showToast(error.message || "Webhook request failed.", "error");
  }
}

function activateTab(tabName) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  panels.forEach((panel) => panel.classList.toggle("active", panel.id === tabName));
  screenTitle.textContent = titles[tabName] || "Dashboard";
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function nextPayrollDate() {
  const now = new Date();
  const year = now.getDate() === 1 ? now.getFullYear() : now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  const month = now.getDate() === 1 ? now.getMonth() : now.getMonth() === 11 ? 0 : now.getMonth() + 1;
  const date = new Date(year, month, 1);
  return date.toISOString().slice(0, 10);
}

document.querySelector("#todayLabel").textContent = new Date().toLocaleDateString(undefined, {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));
});

document.querySelector("#attendanceForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = formToObject(form);
  const shiftHours = numberValue(data.shiftHours);
  const hoursWorked = numberValue(data.hoursWorked);

  sendToWebhook(
    createBasePayload("attendance_record", {
      ...data,
      shiftHours,
      hoursWorked,
      lateMinutes: numberValue(data.lateMinutes) || 0,
      regularHours: Math.min(hoursWorked || 0, shiftHours || 0),
      overtimeHours: Math.max(0, (hoursWorked || 0) - (shiftHours || 0)),
    }),
  );
});

document.querySelector("#employeeForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = formToObject(form);

  sendToWebhook(
    createBasePayload("employee_upsert", {
      ...data,
      monthlySalary: numberValue(data.monthlySalary),
    }),
  );
});

document.querySelector("#payrollForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = formToObject(form);

  sendToWebhook(
    createBasePayload("payroll_generate", {
      ...data,
      regularShiftHours: numberValue(data.regularShiftHours),
      overtimeMultiplier: numberValue(data.overtimeMultiplier),
    }),
  );
});

document.querySelector("#settingsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  saveSettings(formToObject(event.currentTarget));
  showToast("Settings saved.");
});

document.querySelector("#testWebhook").addEventListener("click", () => {
  sendToWebhook(createBasePayload("webhook_test", { message: "Connection test from payroll UI" }));
});

document.querySelector("#copyPayload").addEventListener("click", async () => {
  await navigator.clipboard.writeText(JSON.stringify(latestPayload, null, 2));
  showToast("Payload copied.");
});

document.querySelector("#fillSampleAttendance").addEventListener("click", () => {
  const form = document.querySelector("#attendanceForm");
  form.date.value = todayIsoDate();
  form.employeeId.value = "EMP001";
  form.employeeName.value = "Staff 1";
  form.status.value = "Present";
  form.shiftHours.value = 8;
  form.hoursWorked.value = 10;
  form.lateMinutes.value = 0;
  form.remarks.value = "2 hours overtime";
});

document.querySelector("#fillSampleEmployee").addEventListener("click", () => {
  const form = document.querySelector("#employeeForm");
  form.employeeId.value = "EMP001";
  form.employeeName.value = "Staff 1";
  form.role.value = "Operator";
  form.department.value = "Production";
  form.joiningDate.value = todayIsoDate();
  form.monthlySalary.value = 20000;
  form.status.value = "Active";
  form.paymentDetails.value = "UPI or bank details";
});

function hydrateInitialValues() {
  const settings = getSettings();
  const settingsForm = document.querySelector("#settingsForm");
  settingsForm.webhookUrl.value = settings.webhookUrl;
  settingsForm.businessName.value = settings.businessName;

  document.querySelector("#attendanceForm").date.value = todayIsoDate();
  const payrollForm = document.querySelector("#payrollForm");
  payrollForm.payrollMonth.value = currentMonth();
  payrollForm.paymentDate.value = nextPayrollDate();

  setPayload({
    action: "attendance_record",
    source: "custom-payroll-ui",
    data: {
      date: todayIsoDate(),
      employeeId: "EMP001",
      status: "Present",
      shiftHours: 8,
      hoursWorked: 9,
      overtimeHours: 1,
    },
  });
}

hydrateInitialValues();
updateConnectionStatus();
