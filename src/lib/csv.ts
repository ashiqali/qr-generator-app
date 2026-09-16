export interface BulkCsvRow {
  name: string;
  url: string;
}

/** Minimal CSV parser for a two-column "name,url" file (supports simple double-quoted fields). */
export function parseBulkCsv(text: string): BulkCsvRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const rows: BulkCsvRow[] = [];
  const startIndex = /name/i.test(lines[0]) && /url/i.test(lines[0]) ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const fields = splitCsvLine(lines[i]);
    if (fields.length < 2) continue;
    const [name, url] = fields;
    if (name.trim() && url.trim()) rows.push({ name: name.trim(), url: url.trim() });
  }

  return rows;
}

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}
