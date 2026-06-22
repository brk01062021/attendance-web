declare module 'xlsx' {
  export const utils: {
    json_to_sheet: (data: unknown[]) => unknown;
    book_new: () => unknown;
    book_append_sheet: (workbook: unknown, worksheet: unknown, name: string) => void;
    sheet_to_json: <T = Record<string, unknown>>(worksheet: unknown, options?: Record<string, unknown>) => T[];
  };
  export const read: (data: ArrayBuffer, options?: Record<string, unknown>) => { SheetNames: string[]; Sheets: Record<string, unknown> };
  export const writeFile: (workbook: unknown, filename: string) => void;
}
