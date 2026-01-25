import fs from "fs/promises";

export async function parseCsv(filePath: string): Promise<Array<Record<string, string>>> {
  const txt = await fs.readFile(filePath, "utf8");
  if (!txt) return [];

  const rows: string[][] = [];
  let curField = "";
  let curRow: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (ch === '"') {
      if (inQuotes && txt[i + 1] === '"') {
        curField += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      curRow.push(curField);
      curField = "";
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && txt[i + 1] === "\n") continue;
      curRow.push(curField);
      rows.push(curRow);
      curRow = [];
      curField = "";
      continue;
    }
    curField += ch;
  }
  if (curField !== "" || curRow.length) {
    curRow.push(curField);
    rows.push(curRow);
  }

  if (rows.length === 0) return [];
  const headers = rows[0].map(h => (h ?? "").toString().trim());
  const out: Array<Record<string, string>> = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) obj[headers[c]] = (row[c] ?? "").toString().trim();
    out.push(obj);
  }
  return out;
}
