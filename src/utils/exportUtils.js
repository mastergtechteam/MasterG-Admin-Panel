import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import "jspdf-autotable"

/* ---------------- CSV ---------------- */
export const exportToCSV = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  saveAs(blob, `${fileName}.csv`)
}

/* ---------------- EXCEL ---------------- */
export const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

/* ---------------- PDF ---------------- */
export const exportToPDF = (columns, data, fileName) => {
  const doc = new jsPDF("landscape")

  doc.text(fileName, 14, 10)

  doc.autoTable({
    head: [columns],
    body: data.map(row => columns.map(col => row[col] ?? "")),
    startY: 20,
    styles: { fontSize: 8 }
  })

  doc.save(`${fileName}.pdf`)
}
