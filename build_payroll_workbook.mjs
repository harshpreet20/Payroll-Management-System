import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const workbook = Workbook.create();

const setup = workbook.worksheets.add("Setup");
const dashboard = workbook.worksheets.add("Dashboard");
const employees = workbook.worksheets.add("Employees");
const attendance = workbook.worksheets.add("Attendance");
const payroll = workbook.worksheets.add("Payroll");
const payslip = workbook.worksheets.add("Payslip");

const colors = {
  navy: "#1F3A5F",
  blue: "#2563EB",
  lightBlue: "#DBEAFE",
  green: "#16A34A",
  lightGreen: "#DCFCE7",
  amber: "#F59E0B",
  lightAmber: "#FEF3C7",
  red: "#DC2626",
  lightRed: "#FEE2E2",
  gray: "#F3F4F6",
  text: "#111827",
  muted: "#6B7280",
  border: "#D1D5DB",
};

function title(sheet, range, text) {
  const r = sheet.getRange(range);
  r.merge();
  r.values = [[text]];
  r.format.fill = colors.navy;
  r.format.font = { color: "#FFFFFF", bold: true, size: 18 };
  r.format.horizontalAlignment = "center";
  r.format.rowHeightPx = 36;
}

function header(sheet, range) {
  const r = sheet.getRange(range);
  r.format.fill = colors.blue;
  r.format.font = { color: "#FFFFFF", bold: true };
  r.format.horizontalAlignment = "center";
  r.format.wrapText = true;
  r.format.borders = { preset: "all", style: "thin", color: "#FFFFFF" };
}

function body(sheet, range) {
  const r = sheet.getRange(range);
  r.format.borders = { preset: "all", style: "thin", color: colors.border };
  r.format.font = { color: colors.text };
}

function widths(sheet, specs) {
  for (const [col, px] of Object.entries(specs)) {
    sheet.getRange(`${col}:${col}`).format.columnWidthPx = px;
  }
}

// Setup
title(setup, "A1:E1", "Attendance & Monthly Salary Setup");
setup.getRange("A3:B10").values = [
  ["Payroll month", new Date(2026, 4, 1)],
  ["Regular shift hours", 8],
  ["Standard paid days/month", 26],
  ["Overtime multiplier", 1.5],
  ["Salary payment date", null],
  ["Currency", "INR"],
  ["Attendance capacity", "Up to 50 staff / 1,996 entries"],
  ["Instruction", "Update payroll month, employee salaries, then enter daily attendance."],
];
setup.getRange("B7").formulas = [["=EOMONTH(B3,0)+1"]];
setup.getRange("A3:A10").format.fill = colors.gray;
setup.getRange("A3:A10").format.font = { bold: true };
setup.getRange("A3:B10").format.borders = { preset: "all", style: "thin", color: colors.border };
setup.getRange("B3:B3").format.numberFormat = "mmm yyyy";
setup.getRange("B7:B7").format.numberFormat = "yyyy-mm-dd";
setup.getRange("B5:B6").format.numberFormat = "0.00";
widths(setup, { A: 230, B: 190, C: 40, D: 40, E: 40 });

// Employees
title(employees, "A1:K1", "Employee Master");
employees.getRange("A3:K3").values = [[
  "Emp ID", "Employee Name", "Role", "Department", "Joining Date", "Status",
  "Monthly Base Salary", "Hourly Rate", "OT Rate", "Bank / UPI", "Notes",
]];
header(employees, "A3:K3");
const sampleEmployees = [];
for (let i = 1; i <= 50; i++) {
  const id = `EMP${String(i).padStart(3, "0")}`;
  sampleEmployees.push([
    id,
    i <= 25 ? `Staff ${i}` : "",
    "",
    "",
    "",
    i <= 25 ? "Active" : "",
    i <= 25 ? 20000 : "",
    null,
    null,
    "",
    "",
  ]);
}
employees.getRange("A4:K53").values = sampleEmployees;
employees.getRange("H4:H53").formulas = Array.from({ length: 50 }, (_, idx) => {
  const row = idx + 4;
  return [`=IF(G${row}="","",G${row}/(Setup!$B$5*Setup!$B$4))`];
});
employees.getRange("I4:I53").formulas = Array.from({ length: 50 }, (_, idx) => {
  const row = idx + 4;
  return [`=IF(H${row}="","",H${row}*Setup!$B$6)`];
});
employees.getRange("F4:F53").dataValidation = {
  allowBlank: true,
  list: { inCellDropDown: true, source: ["Active", "Inactive"] },
};
employees.getRange("G4:I53").format.numberFormat = "#,##0.00";
employees.getRange("E4:E53").format.numberFormat = "yyyy-mm-dd";
body(employees, "A3:K53");
employees.freezePanes.freezeRows(3);
widths(employees, { A: 85, B: 160, C: 130, D: 130, E: 110, F: 95, G: 145, H: 105, I: 95, J: 150, K: 180 });

// Attendance
title(attendance, "A1:K1", "Daily Attendance Entry");
attendance.getRange("A3:K3").values = [[
  "Date", "Emp ID", "Employee Name", "Status", "Shift Hours", "Hours Worked",
  "Regular Hours", "Overtime Hours", "Late Minutes", "Remarks", "Month Key",
]];
header(attendance, "A3:K3");
attendance.getRange("A4:K1999").format.borders = { preset: "all", style: "thin", color: colors.border };
attendance.getRange("A4:A1999").format.numberFormat = "yyyy-mm-dd";
attendance.getRange("E4:H1999").format.numberFormat = "0.00";
attendance.getRange("I4:I1999").format.numberFormat = "0";
attendance.getRange("K4:K1999").format.numberFormat = "mmm yyyy";
attendance.getRange("D4:D1999").dataValidation = {
  allowBlank: true,
  list: {
    inCellDropDown: true,
    source: ["Present", "Absent", "Half Day", "Paid Leave", "Unpaid Leave", "Weekly Off", "Holiday"],
  },
};
attendance.getRange("B4:B1999").dataValidation = {
  allowBlank: true,
  list: { inCellDropDown: true, source: "=Employees!$A$4:$A$53" },
};
attendance.getRange("F4:F1999").dataValidation = {
  allowBlank: true,
  rule: { type: "decimal", operator: "between", formula1: 0, formula2: 24 },
  errorAlert: {
    style: "stop",
    title: "Invalid hours",
    message: "Enter hours worked between 0 and 24.",
  },
};
attendance.getRange("E4:E1999").values = Array.from({ length: 1996 }, () => [8]);
attendance.getRange("C4:C1999").formulas = Array.from({ length: 1996 }, (_, idx) => {
  const row = idx + 4;
  return [`=IF(B${row}="","",XLOOKUP(B${row},Employees!$A$4:$A$53,Employees!$B$4:$B$53,""))`];
});
attendance.getRange("G4:G1999").formulas = Array.from({ length: 1996 }, (_, idx) => {
  const row = idx + 4;
  return [`=IF(F${row}="","",MIN(F${row},E${row}))`];
});
attendance.getRange("H4:H1999").formulas = Array.from({ length: 1996 }, (_, idx) => {
  const row = idx + 4;
  return [`=IF(F${row}="","",MAX(0,F${row}-E${row}))`];
});
attendance.getRange("K4:K1999").formulas = Array.from({ length: 1996 }, (_, idx) => {
  const row = idx + 4;
  return [`=IF(A${row}="","",DATE(YEAR(A${row}),MONTH(A${row}),1))`];
});
attendance.getRange("D4:D1999").conditionalFormats.addCustom('=$D4="Absent"', { fill: colors.lightRed, font: { color: colors.red, bold: true } });
attendance.getRange("D4:D1999").conditionalFormats.addCustom('=$D4="Present"', { fill: colors.lightGreen, font: { color: colors.green, bold: true } });
attendance.getRange("H4:H1999").conditionalFormats.addCustom("=$H4>0", { fill: colors.lightAmber, font: { color: "#92400E", bold: true } });
attendance.freezePanes.freezeRows(3);
widths(attendance, { A: 110, B: 85, C: 160, D: 120, E: 95, F: 110, G: 110, H: 120, I: 105, J: 190, K: 105 });

// Payroll
title(payroll, "A1:O1", "Monthly Payroll");
payroll.getRange("A3:B3").values = [["Payroll month", null]];
payroll.getRange("B3").formulas = [["=Setup!B3"]];
payroll.getRange("B3").format.numberFormat = "mmm yyyy";
payroll.getRange("A3").format.fill = colors.gray;
payroll.getRange("A3").format.font = { bold: true };
payroll.getRange("A5:O5").values = [[
  "Emp ID", "Employee Name", "Department", "Base Salary", "Paid Days", "Present Days",
  "Paid Leave", "Absences", "Regular Paid Hours", "Overtime Hours", "Regular Pay",
  "Overtime Pay", "Gross Pay", "Manual Deductions", "Net Pay",
]];
header(payroll, "A5:O5");
payroll.getRange("A6:A55").formulas = Array.from({ length: 50 }, (_, idx) => [[`=Employees!A${idx + 4}`]][0]);
payroll.getRange("B6:B55").formulas = Array.from({ length: 50 }, (_, idx) => [[`=Employees!B${idx + 4}`]][0]);
payroll.getRange("C6:C55").formulas = Array.from({ length: 50 }, (_, idx) => {
  const row = idx + 4;
  return [`=IF(Employees!D${row}="","",Employees!D${row})`];
});
payroll.getRange("D6:D55").formulas = Array.from({ length: 50 }, (_, idx) => {
  const row = idx + 4;
  return [`=IF(Employees!G${row}="","",Employees!G${row})`];
});
payroll.getRange("E6:O55").formulas = Array.from({ length: 50 }, (_, idx) => {
  const row = idx + 6;
  return [
    `=IF($A${row}="","",I${row}/Setup!$B$4)`,
    `=IF($A${row}="","",COUNTIFS(Attendance!$B$4:$B$1999,$A${row},Attendance!$K$4:$K$1999,$B$3,Attendance!$D$4:$D$1999,"Present")+0.5*COUNTIFS(Attendance!$B$4:$B$1999,$A${row},Attendance!$K$4:$K$1999,$B$3,Attendance!$D$4:$D$1999,"Half Day"))`,
    `=IF($A${row}="","",COUNTIFS(Attendance!$B$4:$B$1999,$A${row},Attendance!$K$4:$K$1999,$B$3,Attendance!$D$4:$D$1999,"Paid Leave"))`,
    `=IF($A${row}="","",COUNTIFS(Attendance!$B$4:$B$1999,$A${row},Attendance!$K$4:$K$1999,$B$3,Attendance!$D$4:$D$1999,"Absent")+COUNTIFS(Attendance!$B$4:$B$1999,$A${row},Attendance!$K$4:$K$1999,$B$3,Attendance!$D$4:$D$1999,"Unpaid Leave"))`,
    `=IF($A${row}="","",SUMIFS(Attendance!$G$4:$G$1999,Attendance!$B$4:$B$1999,$A${row},Attendance!$K$4:$K$1999,$B$3)+Setup!$B$4*(COUNTIFS(Attendance!$B$4:$B$1999,$A${row},Attendance!$K$4:$K$1999,$B$3,Attendance!$D$4:$D$1999,"Paid Leave")+COUNTIFS(Attendance!$B$4:$B$1999,$A${row},Attendance!$K$4:$K$1999,$B$3,Attendance!$D$4:$D$1999,"Holiday")+COUNTIFS(Attendance!$B$4:$B$1999,$A${row},Attendance!$K$4:$K$1999,$B$3,Attendance!$D$4:$D$1999,"Weekly Off")))`,
    `=IF($A${row}="","",SUMIFS(Attendance!$H$4:$H$1999,Attendance!$B$4:$B$1999,$A${row},Attendance!$K$4:$K$1999,$B$3))`,
    `=IF($A${row}="","",Employees!H${row - 2}*I${row})`,
    `=IF($A${row}="","",Employees!I${row - 2}*J${row})`,
    `=IF($A${row}="","",K${row}+L${row})`,
    "",
    `=IF($A${row}="","",M${row}-N${row})`,
  ];
});
payroll.getRange("D6:D55").format.numberFormat = "#,##0.00";
payroll.getRange("E6:J55").format.numberFormat = "0.00";
payroll.getRange("K6:O55").format.numberFormat = "#,##0.00";
body(payroll, "A5:O55");
payroll.getRange("N6:N55").format.fill = "#FFF7ED";
payroll.freezePanes.freezeRows(5);
widths(payroll, { A: 85, B: 160, C: 125, D: 115, E: 90, F: 95, G: 85, H: 85, I: 130, J: 110, K: 110, L: 110, M: 110, N: 130, O: 110 });

// Dashboard
title(dashboard, "A1:H1", "Payroll Dashboard");
dashboard.getRange("A3:H3").values = [["Month", "Active Staff", "Attendance Entries", "Regular Paid Hours", "Overtime Hours", "Gross Pay", "Deductions", "Net Pay"]];
header(dashboard, "A3:H3");
dashboard.getRange("A4:H4").formulas = [[
  "=Payroll!B3",
  '=COUNTIF(Employees!$F$4:$F$53,"Active")',
  '=COUNTIFS(Attendance!$A$4:$A$1999,">=1",Attendance!$K$4:$K$1999,Payroll!$B$3)',
  "=SUM(Payroll!I6:I55)",
  "=SUM(Payroll!J6:J55)",
  "=SUM(Payroll!M6:M55)",
  "=SUM(Payroll!N6:N55)",
  "=SUM(Payroll!O6:O55)",
]];
dashboard.getRange("A4").format.numberFormat = "mmm yyyy";
dashboard.getRange("B4:E4").format.numberFormat = "0.00";
dashboard.getRange("F4:H4").format.numberFormat = "#,##0.00";
body(dashboard, "A3:H4");
dashboard.getRange("A7:H7").values = [["Top Overtime Staff", "", "", "", "", "", "", ""]];
dashboard.getRange("A7:H7").merge();
dashboard.getRange("A7:H7").format.fill = colors.gray;
dashboard.getRange("A7:H7").format.font = { bold: true };
dashboard.getRange("A8:D8").values = [["Emp ID", "Employee Name", "Overtime Hours", "Overtime Pay"]];
header(dashboard, "A8:D8");
dashboard.getRange("A9:D18").formulas = Array.from({ length: 10 }, (_, idx) => {
  const n = idx + 1;
  return [
    `=IFERROR(INDEX(SORTBY(Payroll!$A$6:$A$55,Payroll!$J$6:$J$55,-1),${n}),"")`,
    `=IF(A${idx + 9}="","",XLOOKUP(A${idx + 9},Payroll!$A$6:$A$55,Payroll!$B$6:$B$55,""))`,
    `=IF(A${idx + 9}="","",XLOOKUP(A${idx + 9},Payroll!$A$6:$A$55,Payroll!$J$6:$J$55,0))`,
    `=IF(A${idx + 9}="","",XLOOKUP(A${idx + 9},Payroll!$A$6:$A$55,Payroll!$L$6:$L$55,0))`,
  ];
});
dashboard.getRange("C9:C18").format.numberFormat = "0.00";
dashboard.getRange("D9:D18").format.numberFormat = "#,##0.00";
body(dashboard, "A8:D18");
widths(dashboard, { A: 125, B: 140, C: 140, D: 130, E: 130, F: 120, G: 120, H: 120 });

// Payslip
title(payslip, "A1:F1", "Monthly Payslip");
payslip.getRange("A3:B8").values = [
  ["Payroll month", null],
  ["Emp ID", "EMP001"],
  ["Employee Name", null],
  ["Department", null],
  ["Payment Date", null],
  ["Base Salary", null],
];
payslip.getRange("B3").formulas = [["=Payroll!B3"]];
payslip.getRange("B5:B8").formulas = [
  ['=XLOOKUP(B4,Payroll!$A$6:$A$55,Payroll!$B$6:$B$55,"")'],
  ['=XLOOKUP(B4,Payroll!$A$6:$A$55,Payroll!$C$6:$C$55,"")'],
  ["=Setup!B7"],
  ['=XLOOKUP(B4,Payroll!$A$6:$A$55,Payroll!$D$6:$D$55,"")'],
];
payslip.getRange("A3:A8").format.fill = colors.gray;
payslip.getRange("A3:A8").format.font = { bold: true };
payslip.getRange("A3:B8").format.borders = { preset: "all", style: "thin", color: colors.border };
payslip.getRange("B3").format.numberFormat = "mmm yyyy";
payslip.getRange("B7").format.numberFormat = "yyyy-mm-dd";
payslip.getRange("B8").format.numberFormat = "#,##0.00";
payslip.getRange("A10:F10").values = [["Paid Days", "Regular Hours", "Overtime Hours", "Regular Pay", "Overtime Pay", "Net Pay"]];
header(payslip, "A10:F10");
payslip.getRange("A11:F11").formulas = [[
  '=XLOOKUP($B$4,Payroll!$A$6:$A$55,Payroll!$E$6:$E$55,"")',
  '=XLOOKUP($B$4,Payroll!$A$6:$A$55,Payroll!$I$6:$I$55,"")',
  '=XLOOKUP($B$4,Payroll!$A$6:$A$55,Payroll!$J$6:$J$55,"")',
  '=XLOOKUP($B$4,Payroll!$A$6:$A$55,Payroll!$K$6:$K$55,"")',
  '=XLOOKUP($B$4,Payroll!$A$6:$A$55,Payroll!$L$6:$L$55,"")',
  '=XLOOKUP($B$4,Payroll!$A$6:$A$55,Payroll!$O$6:$O$55,"")',
]];
payslip.getRange("A11:C11").format.numberFormat = "0.00";
payslip.getRange("D11:F11").format.numberFormat = "#,##0.00";
body(payslip, "A10:F11");
payslip.getRange("B4").dataValidation = {
  allowBlank: false,
  list: { inCellDropDown: true, source: "=Employees!$A$4:$A$53" },
};
widths(payslip, { A: 130, B: 150, C: 130, D: 130, E: 130, F: 130 });

// Sheet-level polish
for (const sheet of [setup, dashboard, employees, attendance, payroll, payslip]) {
  sheet.getRange("A1:O80").format.font = { name: "Calibri" };
}

const check1 = await workbook.inspect({
  kind: "table",
  range: "Payroll!A3:O12",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 15,
});
console.log(check1.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

await workbook.render({ sheetName: "Dashboard", range: "A1:H18", scale: 2 });
await workbook.render({ sheetName: "Employees", range: "A1:K18", scale: 2 });
await workbook.render({ sheetName: "Attendance", range: "A1:K18", scale: 2 });
await workbook.render({ sheetName: "Payroll", range: "A1:O18", scale: 2 });
await workbook.render({ sheetName: "Payslip", range: "A1:F12", scale: 2 });

await fs.mkdir("outputs/payroll_workbook", { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save("outputs/payroll_workbook/attendance_salary_payroll_template.xlsx");
console.log("saved outputs/payroll_workbook/attendance_salary_payroll_template.xlsx");
