import type { ReactNode } from 'react';

export interface AdminTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (item: T) => ReactNode;
  mobileLabel?: string;
}

interface AdminTableProps<T> {
  items: T[];
  columns: AdminTableColumn<T>[];
  getRowKey: (item: T) => string;
  caption?: string;
}

export function AdminTable<T>({
  items,
  columns,
  getRowKey,
  caption,
}: AdminTableProps<T>) {
  return (
    <div className="surface-card overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold tracking-wide text-slate-600">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-5 py-3.5 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr
                key={getRowKey(item)}
                className="transition-colors hover:bg-slate-50/70"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-3.5 align-middle ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Card List */}
      <div className="divide-y divide-slate-200 md:hidden">
        {items.map((item) => (
          <div key={getRowKey(item)} className="space-y-3 p-4">
            {columns.map((col) => (
              <div key={col.key} className="flex items-start justify-between gap-3 text-sm">
                <span className="shrink-0 text-xs font-semibold text-slate-500">
                  {col.mobileLabel ?? col.header}
                </span>
                <div className="min-w-0 text-right">{col.render(item)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
