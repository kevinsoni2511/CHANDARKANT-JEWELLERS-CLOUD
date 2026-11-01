import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  hideable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  exportFileName?: string;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  title,
  subtitle,
  actions,
  exportFileName = 'export-data',
  emptyMessage = 'No matching records found.',
  emptyAction,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    columns.forEach((col) => {
      init[col.key] = true;
    });
    return init;
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  // Filter data
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const lower = search.toLowerCase();

    return data.filter((item) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = item[k as keyof T];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(lower);
        });
      }
      return Object.values(item).some(
        (val) => val !== undefined && val !== null && String(val).toLowerCase().includes(lower)
      );
    });
  }, [data, search, searchKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      const numA = Number(aVal);
      const numB = Number(bVal);

      if (!isNaN(numA) && !isNaN(numB)) {
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleExportCsv = () => {
    const activeCols = columns.filter((col) => visibleColumns[col.key]);
    const headers = activeCols.map((c) => `"${c.header}"`).join(',');

    const rows = sortedData.map((row) =>
      activeCols
        .map((col) => {
          const val = row[col.key];
          const clean = val !== undefined && val !== null ? String(val).replace(/"/g, '""') : '';
          return `"${clean}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const activeCols = columns.filter((c) => visibleColumns[c.key]);

  return (
    <div className="bg-white dark:bg-[#111118] rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm overflow-hidden transition-colors">
      {/* Header & Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-white/5 space-y-3.5">
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {title && (
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2 self-start sm:self-auto">{actions}</div>}
          </div>
        )}

        {/* Search, Column Toggles, Export Tools */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Column Picker Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowColumnPicker(!showColumnPicker)}
                title="Customize table columns"
                className="px-3 py-2 rounded-xl text-xs font-medium border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </button>

              {showColumnPicker && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#181822] border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl p-2 z-30 space-y-1">
                  <div className="text-[10px] uppercase font-mono font-semibold text-zinc-400 px-2 py-1">
                    Toggle Columns
                  </div>
                  {columns
                    .filter((c) => c.hideable !== false)
                    .map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[col.key]}
                          onChange={(e) =>
                            setVisibleColumns({ ...visibleColumns, [col.key]: e.target.checked })
                          }
                          className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="truncate">{col.header}</span>
                      </label>
                    ))}
                </div>
              )}
            </div>

            {/* Export to Excel / CSV */}
            <button
              onClick={handleExportCsv}
              title="Export visible dataset to Excel (.csv)"
              className="px-3 py-2 rounded-xl text-xs font-medium border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Print trigger */}
            <button
              onClick={handlePrint}
              title="Print Table View"
              className="px-2.5 py-2 rounded-xl text-xs font-medium border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50/70 dark:bg-black/30 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-white/10 select-none">
            <tr>
              {activeCols.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                      col.sortable ? 'cursor-pointer hover:text-amber-600 dark:hover:text-amber-400' : ''
                    } ${col.className || ''}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span>
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {activeCols.map((col, cIdx) => (
                    <td key={cIdx} className="py-3.5 px-4">
                      <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={activeCols.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Layers className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {emptyMessage}
                    </p>
                    {emptyAction && (
                      <button
                        onClick={emptyAction.onClick}
                        className="mt-2 px-3 py-1.5 rounded-lg text-xs gold-gradient text-[#200408] font-semibold"
                      >
                        {emptyAction.label}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={item.id || rowIdx}
                  className="hover:bg-amber-500/5 dark:hover:bg-white/[0.03] transition-colors"
                >
                  {activeCols.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.accessor ? col.accessor(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-3.5 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <span>
            Showing{' '}
            <strong className="text-zinc-900 dark:text-zinc-200">
              {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-zinc-900 dark:text-zinc-200">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </strong>{' '}
            of <strong className="text-zinc-900 dark:text-zinc-200">{sortedData.length}</strong> items
          </span>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            aria-label="Items per page"
            className="bg-white dark:bg-[#181822] border border-zinc-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 font-mono text-xs">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
