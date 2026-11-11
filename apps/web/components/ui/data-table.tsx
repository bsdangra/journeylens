import type { ReactNode } from "react";

export interface Column<Row> {
  header: string;
  cell: (row: Row) => ReactNode;
}

/** Renders as a table, then as stacked cards on phones using data-label. */
export function DataTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
}: {
  caption: string;
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
}) {
  return (
    <div className="table-card">
      <table className="data-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.header} data-label={column.header}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
