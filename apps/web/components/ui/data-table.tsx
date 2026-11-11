import type { ReactNode } from "react";

export interface Column<Row> {
  header: string;
  cell: (row: Row) => ReactNode;
  /** The main cell of a row: full width and unlabelled on phones. */
  primary?: boolean;
  align?: "right";
  hideLabel?: boolean;
}

/** A table on desktop; stacked label and value cards on phones. */
export function DataTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
  footer,
}: {
  caption: string;
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  footer?: ReactNode;
}) {
  return (
    <div className="card table-card">
      <div className="table-scroll">
        <table className="data-table">
          <caption className="visually-hidden">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className={column.align === "right" ? "align-right" : undefined}
                >
                  {column.hideLabel ? (
                    <span className="visually-hidden">{column.header}</span>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td
                    key={column.header}
                    data-label={column.header}
                    data-primary={column.primary ? "" : undefined}
                    className={column.align === "right" ? "align-right" : undefined}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && <div className="table-footer">{footer}</div>}
    </div>
  );
}
