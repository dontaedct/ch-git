import Papa from "papaparse";

export function toCSV<T extends object>(rows: T[]): string {
  return Papa.unparse(rows);
}




