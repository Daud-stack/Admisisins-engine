import * as XLSX from "xlsx"

export function exportToExcel(data: any[], fileName: string) {
  // Format data for export
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
  
  // Create safe filename
  const safeName = `${fileName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
  
  XLSX.writeFile(workbook, safeName)
}
