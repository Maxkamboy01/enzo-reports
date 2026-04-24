import ExcelJS from 'exceljs';

export async function buildExcel(title, columns, rows) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ENZO Reports';
  wb.created = new Date();

  const ws = wb.addWorksheet(title.slice(0, 31));

  // Title row
  ws.mergeCells(1, 1, 1, columns.length);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { bold: true, size: 13, color: { argb: 'FF1B3A8C' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  // Date row
  ws.mergeCells(2, 1, 2, columns.length);
  const dateCell = ws.getCell(2, 1);
  dateCell.value = `Юкланди: ${new Date().toLocaleString('ru-RU')}`;
  dateCell.font = { size: 9, color: { argb: 'FF9CA3AF' } };
  dateCell.alignment = { horizontal: 'center' };
  ws.getRow(2).height = 16;

  // Header
  const headerRow = ws.getRow(4);
  columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.label;
    cell.font = { bold: true, size: 10, color: { argb: 'FF374151' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
    };
    cell.alignment = { horizontal: col.right ? 'right' : 'left', vertical: 'middle', wrapText: false };
    ws.getColumn(i + 1).width = Math.max(col.label.length + 4, 12);
  });
  headerRow.height = 22;

  // Data rows
  rows.forEach((row, ri) => {
    const dataRow = ws.getRow(ri + 5);
    columns.forEach((col, ci) => {
      const cell = dataRow.getCell(ci + 1);
      const val = row[col.key];
      cell.value = val ?? null;
      cell.font = { size: 10 };
      cell.alignment = { horizontal: col.right ? 'right' : 'left', vertical: 'middle' };
      if (ri % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } };
      }
    });
    dataRow.height = 18;
  });

  // Freeze header
  ws.views = [{ state: 'frozen', ySplit: 4 }];

  const buf = await wb.xlsx.writeBuffer();
  return buf;
}
