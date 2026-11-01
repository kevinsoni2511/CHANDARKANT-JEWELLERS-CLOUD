import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
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
  X,
  RotateCcw,
  Sparkles,
  Check,
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
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [minVal, setMinVal] = useState<string>('');
  const [maxVal, setMaxVal] = useState<string>('');
  const [quickPreset, setQuickPreset] = useState<'all' | 'high_value' | 'has_data'>('all');

  // Compute unique values for the selected filter column
  const uniqueFilterValues = useMemo(() => {
    if (!filterColumn) return [];
    const set = new Set<string>();
    data.forEach((item) => {
      const v = item[filterColumn];
      if (v !== undefined && v !== null && String(v).trim()) {
        set.add(String(v).trim());
      }
    });
    return Array.from(set).slice(0, 30);
  }, [data, filterColumn]);

  // Enhanced Filter data (Search + Column Filter + Range Filter + Quick Presets)
  const filteredData = useMemo(() => {
    let result = data;

    // 1. Quick Presets
    if (quickPreset === 'high_value') {
      result = result.filter((item) => {
        return Object.values(item).some((v) => typeof v === 'number' && v >= 50000);
      });
    } else if (quickPreset === 'has_data') {
      result = result.filter((item) => {
        return Object.values(item).some((v) => v !== null && v !== undefined && String(v).trim() !== '');
      });
    }

    // 2. Specific Column Value Filter
    if (filterColumn && filterValue.trim()) {
      const lower = filterValue.toLowerCase().trim();
      result = result.filter((item) => {
        const val = item[filterColumn];
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(lower);
      });
    }

    // 3. Numeric Min/Max Range Filter
    if (filterColumn && (minVal !== '' || maxVal !== '')) {
      const min = minVal !== '' ? Number(minVal) : -Infinity;
      const max = maxVal !== '' ? Number(maxVal) : Infinity;
      result = result.filter((item) => {
        const num = Number(item[filterColumn]);
        if (isNaN(num)) return true;
        return num >= min && num <= max;
      });
    }

    // 4. Global Search
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter((item) => {
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
    }

    return result;
  }, [data, search, searchKeys, filterColumn, filterValue, minVal, maxVal, quickPreset]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (filterColumn && filterValue.trim()) count++;
    if (minVal !== '' || maxVal !== '') count++;
    if (quickPreset !== 'all') count++;
    return count;
  }, [search, filterColumn, filterValue, minVal, maxVal, quickPreset]);

  const handleResetFilters = () => {
    setSearch('');
    setFilterColumn('');
    setFilterValue('');
    setMinVal('');
    setMaxVal('');
    setQuickPreset('all');
    setCurrentPage(1);
  };

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

  const handleExportExcel = () => {
    const activeCols = columns.filter((col) => visibleColumns[col.key]);
    const titleText = (title || 'REPORT').toUpperCase();
    const generatedDate = new Date().toLocaleString('en-IN');

    // Header metadata block
    const aoa: any[][] = [
      [`CHANDARKANT JEWELLERS - ${titleText}`],
      [`Generated: ${generatedDate} | Firm GSTIN: 24AAACC1234M1Z8 | BIS Lic: HM/SUR/2026/01`],
      [`Total Records: ${sortedData.length} | Export Format: Microsoft Excel Spreadsheet (.xlsx)`],
      [], // blank line
      activeCols.map((col) => col.header), // Row 5 (index 4 in 0-based array)
    ];

    // Rows with typed numbers for Excel formula compatibility
    sortedData.forEach((row) => {
      const rowData = activeCols.map((col) => {
        let val = row[col.key];
        if (typeof val === 'object' && val !== null) {
          val = Object.values(val).join(' ');
        }
        if (val === undefined || val === null) {
          return '';
        }
        const strVal = String(val).trim();
        // If purely numeric without leading zeroes or plus signs, save as Number for Excel sums
        if (
          strVal !== '' &&
          !isNaN(Number(strVal)) &&
          !strVal.startsWith('0') &&
          !strVal.startsWith('+') &&
          strVal.length < 15
        ) {
          return Number(strVal);
        }
        return val;
      });
      aoa.push(rowData);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Auto-Filter enabled across all columns on row 5
    const headerRow = 5;
    const lastRow = aoa.length;
    const lastCol = XLSX.utils.encode_col(activeCols.length - 1);
    worksheet['!autofilter'] = {
      ref: `A${headerRow}:${lastCol}${lastRow}`,
    };

    // Auto Column Widths
    const colWidths = activeCols.map((col) => {
      let maxLen = col.header.length;
      sortedData.forEach((r) => {
        const v = r[col.key];
        if (v !== undefined && v !== null) {
          const l = String(v).length;
          if (l > maxLen) maxLen = l;
        }
      });
      return { wch: Math.min(Math.max(maxLen + 4, 15), 45) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger Data');
    const safeFilename = `${exportFileName}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, safeFilename, { bookType: 'xlsx' });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      window.print();
      return;
    }
    const visibleColDefs = columns.filter((c) => visibleColumns[c.key]);
    const headersHtml = visibleColDefs
      .map(
        (col) =>
          `<th style="padding: 8px 10px; border: 1px solid #d1d5db; background: #f3f4f6; text-align: ${
            col.align || 'left'
          }; font-size: 11px; font-weight: 700;">${col.header}</th>`
      )
      .join('');

    const rowsHtml = sortedData
      .map((item) => {
        const cells = visibleColDefs
          .map((col) => {
            let val = item[col.key];
            if (typeof val === 'object' && val !== null) {
              val = Object.values(val).join(' ');
            }
            return `<td style="padding: 7px 10px; border: 1px solid #e5e7eb; text-align: ${
              col.align || 'left'
            }; font-size: 11px;">${val !== undefined && val !== null ? val : '-'}</td>`;
          })
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>${title || 'Report'} - Chandarkant Jewellers Cloud</title>
          <style>
            @page { size: A4 landscape; margin: 8mm; }
            * { box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
              color: #111318; 
              margin: 0; 
              padding: 0; 
              background: #EAE8E3; 
              font-size: 11px; 
            }

            .screen-toolbar {
              position: sticky;
              top: 0;
              z-index: 100;
              background: #111318;
              color: #F6F5F1;
              padding: 10px 18px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .btn-print {
              background: linear-gradient(135deg, #DFBE6F 0%, #C9A34A 100%);
              color: #111318;
              border: none;
              border-radius: 6px;
              padding: 7px 16px;
              font-weight: 700;
              font-size: 11.5px;
              cursor: pointer;
            }
            .btn-print:hover { opacity: 0.92; }

            .sheet-canvas {
              max-width: 280mm;
              margin: 16px auto;
              background: #FFFFFF;
            }

            .report-outer-frame {
              border: 2px solid #C9A34A;
              border-radius: 8px;
              padding: 4px;
              background: #FFFFFF;
              box-shadow: 0 6px 20px rgba(0,0,0,0.08);
            }

            .report-inner-frame {
              border: 1px solid rgba(201, 163, 74, 0.45);
              border-radius: 6px;
              padding: 16px 20px;
              background: #FFFFFF;
            }

            .header-bar { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              border-bottom: 2px solid #C9A34A; 
              padding-bottom: 10px; 
              margin-bottom: 12px; 
            }
            .brand-badge {
              display: inline-block;
              background: linear-gradient(135deg, #DFBE6F 0%, #C9A34A 100%);
              color: #111318;
              font-weight: 900;
              font-size: 11px;
              padding: 2px 7px;
              border-radius: 4px;
              margin-right: 6px;
            }
            .brand-name { 
              font-size: 18px; 
              font-weight: 800; 
              color: #111318; 
              font-family: serif; 
              letter-spacing: 0.5px; 
            }
            .report-title { 
              font-size: 13px; 
              font-weight: 700; 
              color: #92400e; 
              margin-top: 2px; 
            }
            .meta-text { 
              font-size: 10px; 
              color: #6b7280; 
              line-height: 1.4;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 8px; 
              border: 1px solid #E5E7EB;
            }
            th {
              background: #FAF9F5;
              color: #111318;
              border-bottom: 2px solid #C9A34A;
              border-top: 1px solid #E3DFD7;
              border-right: 1px solid #E5E7EB;
              font-weight: 700;
              font-size: 10.5px;
            }
            td {
              border-bottom: 1px solid #E5E7EB;
              border-right: 1px solid #F3F4F6;
              font-size: 10px;
            }
            tr { page-break-inside: avoid; break-inside: avoid; }

            .footer-bar {
              margin-top: 14px;
              padding-top: 8px;
              border-top: 1px solid #E3DFD7;
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #6b7280;
            }

            @media print {
              body { 
                padding: 0 !important; 
                margin: 0 !important;
                background: #FFFFFF !important; 
              }
              .screen-toolbar { 
                display: none !important; 
              }
              .sheet-canvas {
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .report-outer-frame {
                border: 2px solid #C9A34A !important;
                box-shadow: none !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                page-break-inside: avoid !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="screen-toolbar">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:#C9A34A; font-weight:bold;">&#10022; Chandarkant Jewellers Cloud</span>
              <span style="color:#71717A;">|</span>
              <span style="color:#A1A1AA; font-size:11px;">${title || 'Data Register'}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <button onclick="window.print()" class="btn-print">&#128424; Print / Save PDF</button>
              <button onclick="window.close()" style="background:#27272A; color:#E4E4E7; border:none; border-radius:6px; padding:7px 12px; font-size:11px; cursor:pointer;">Close</button>
            </div>
          </div>

          <div class="sheet-canvas">
            <div class="report-outer-frame">
              <div class="report-inner-frame">
                <div class="header-bar">
                  <div>
                    <div style="display:flex; align-items:center;">
                      <span class="brand-badge">&#10022;</span>
                      <span class="brand-name">CHANDARKANT JEWELLERS CLOUD</span>
                    </div>
                    <div class="report-title">${title || 'Official Data Register'}</div>
                    ${subtitle ? `<div style="font-size: 10px; color: #4b5563; margin-top: 2px;">${subtitle}</div>` : ''}
                    <div style="font-size: 9.5px; color: #6b7280; margin-top: 3px;">
                      Varachha Main Road, Surat, Gujarat &bull; GSTIN: 24AAACC1234M1Z8 &bull; BIS Hallmark Ready
                    </div>
                  </div>
                  <div class="meta-text" style="text-align: right;">
                    <div><strong>Generated Date:</strong> ${new Date().toLocaleString()}</div>
                    <div><strong>Total Records:</strong> ${sortedData.length} active rows</div>
                    <div><strong>Format:</strong> High-Fidelity A4 Landscape Export</div>
                  </div>
                </div>

                <table>
                  <thead><tr>${headersHtml}</tr></thead>
                  <tbody>${rowsHtml}</tbody>
                </table>

                <div class="footer-bar">
                  <div>Statutory Computer-Generated Enterprise Report &bull; Subject to Surat Jurisdiction</div>
                  <div>Certified Official Ledger &bull; Page 1 of 1</div>
                </div>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const activeCols = columns.filter((c) => visibleColumns[c.key]);

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#181A22] rounded-2xl border border-[#E3DFD7] dark:border-white/10 shadow-sm overflow-hidden transition-colors">
      {/* Header & Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-[#E3DFD7] dark:border-white/5 space-y-3.5">
        {(title || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              {title && (
                <h3 className="font-semibold text-[#111318] dark:text-[#F6F5F1] text-sm sm:text-base">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#5A5E6B] dark:text-[#A6AAB6] mt-0.5">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2 self-start sm:self-auto">{actions}</div>}
          </div>
        )}

        {/* Search, Column Toggles, Export Tools */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8E929E] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#ECEAE4]/40 dark:bg-[#111318] border border-[#E3DFD7] dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-[#111318] dark:text-[#F6F5F1] placeholder-[#8E929E] outline-none focus:border-[#C9A34A] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
            {/* Filter & Formatting Drawer Trigger */}
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              title="Filter and format ledger records"
              className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                activeFiltersCount > 0 || showFilterDrawer
                  ? 'border-[#C9A34A] bg-[#C9A34A]/10 text-[#C9A34A] font-semibold'
                  : 'border-[#E3DFD7] dark:border-white/10 text-[#5A5E6B] dark:text-[#A6AAB6] hover:bg-[#111318]/5 dark:hover:bg-white/5'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-[#C9A34A]" />
              <span className="hidden sm:inline">Filter & Format</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#C9A34A] text-[#111318] font-bold rounded-full text-[10px]">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Column Picker Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowColumnPicker(!showColumnPicker)}
                title="Customize table columns"
                className="px-3 py-2 rounded-xl text-xs font-medium border border-[#E3DFD7] dark:border-white/10 text-[#5A5E6B] dark:text-[#A6AAB6] hover:bg-[#111318]/5 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </button>

              {showColumnPicker && (
                <div className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 rounded-xl shadow-xl p-2 z-30 space-y-1">
                  <div className="text-[10px] uppercase font-mono font-semibold text-[#8E929E] px-2 py-1">
                    Toggle Columns
                  </div>
                  {columns
                    .filter((c) => c.hideable !== false)
                    .map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 px-2 py-1 text-xs text-[#5A5E6B] dark:text-[#A6AAB6] hover:bg-[#111318]/5 dark:hover:bg-white/5 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[col.key]}
                          onChange={(e) =>
                            setVisibleColumns({ ...visibleColumns, [col.key]: e.target.checked })
                          }
                          className="rounded border-[#E3DFD7] text-[#C9A34A] focus:ring-[#C9A34A]"
                        />
                        <span className="truncate">{col.header}</span>
                      </label>
                    ))}
                </div>
              )}
            </div>

            {/* Export to Excel (.xlsx) with Autofilter */}
            <button
              onClick={handleExportExcel}
              title="Export formatted dataset to Microsoft Excel (.xlsx)"
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Export Excel (.xlsx)</span>
            </button>

            {/* Print trigger */}
            <button
              onClick={handlePrint}
              title="Print Table View"
              className="px-2.5 py-2 rounded-xl text-xs font-medium border border-[#E3DFD7] dark:border-white/10 text-[#5A5E6B] dark:text-[#A6AAB6] hover:bg-[#111318]/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter & Formatting Drawer Panel */}
        {showFilterDrawer && (
          <div className="mt-3 p-4 bg-[#ECEAE4]/30 dark:bg-[#111318]/60 border border-[#E3DFD7] dark:border-white/10 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3DFD7]/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A34A]" />
                <span className="text-xs font-bold text-[#111318] dark:text-[#F6F5F1]">
                  Filter & Formatting Controls
                </span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-[#C9A34A] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset All Filters
              </button>
            </div>

            {/* Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Column Filter Selector */}
              <div>
                <label className="block text-[11px] text-[#5A5E6B] dark:text-[#A6AAB6] mb-1 font-medium">
                  Filter by Specific Column
                </label>
                <select
                  value={filterColumn}
                  onChange={(e) => {
                    setFilterColumn(e.target.value);
                    setFilterValue('');
                    setMinVal('');
                    setMaxVal('');
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#FFFFFF] dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#111318] dark:text-[#F6F5F1] outline-none focus:border-[#C9A34A]"
                >
                  <option value="">Choose Column...</option>
                  {columns.map((col) => (
                    <option key={col.key} value={col.key}>
                      {col.header}
                    </option>
                  ))}
                </select>
              </div>

              {/* Column Value (Dropdown or Text) */}
              <div>
                <label className="block text-[11px] text-[#5A5E6B] dark:text-[#A6AAB6] mb-1 font-medium">
                  Match Value
                </label>
                {uniqueFilterValues.length > 0 && uniqueFilterValues.length <= 15 ? (
                  <select
                    value={filterValue}
                    onChange={(e) => {
                      setFilterValue(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#FFFFFF] dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#111318] dark:text-[#F6F5F1] outline-none focus:border-[#C9A34A]"
                  >
                    <option value="">All values...</option>
                    {uniqueFilterValues.map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter filter term..."
                    value={filterValue}
                    onChange={(e) => {
                      setFilterValue(e.target.value);
                      setCurrentPage(1);
                    }}
                    disabled={!filterColumn}
                    className="w-full bg-[#FFFFFF] dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#111318] dark:text-[#F6F5F1] outline-none focus:border-[#C9A34A] disabled:opacity-50"
                  />
                )}
              </div>

              {/* Quick Preset Pills */}
              <div>
                <label className="block text-[11px] text-[#5A5E6B] dark:text-[#A6AAB6] mb-1 font-medium">
                  Quick Filter Preset
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setQuickPreset('all');
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                      quickPreset === 'all'
                        ? 'bg-[#C9A34A] text-[#111318] border-[#C9A34A] font-bold'
                        : 'border-[#E3DFD7] dark:border-white/10 text-[#5A5E6B] dark:text-[#A6AAB6]'
                    }`}
                  >
                    All Records
                  </button>
                  <button
                    onClick={() => {
                      setQuickPreset('high_value');
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                      quickPreset === 'high_value'
                        ? 'bg-[#C9A34A] text-[#111318] border-[#C9A34A] font-bold'
                        : 'border-[#E3DFD7] dark:border-white/10 text-[#5A5E6B] dark:text-[#A6AAB6]'
                    }`}
                  >
                    High Value (&ge; ₹50k)
                  </button>
                </div>
              </div>
            </div>

            {/* Numeric Range Filter (if applicable) */}
            {filterColumn && (
              <div className="pt-2 border-t border-[#E3DFD7]/60 dark:border-white/10 flex items-center gap-3">
                <span className="text-[11px] text-[#5A5E6B] dark:text-[#A6AAB6] font-medium">
                  Numeric Range Filter:
                </span>
                <input
                  type="number"
                  placeholder="Min Value"
                  value={minVal}
                  onChange={(e) => {
                    setMinVal(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-24 bg-[#FFFFFF] dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 rounded px-2 py-1 text-xs text-[#111318] dark:text-[#F6F5F1] outline-none focus:border-[#C9A34A]"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="number"
                  placeholder="Max Value"
                  value={maxVal}
                  onChange={(e) => {
                    setMaxVal(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-24 bg-[#FFFFFF] dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 rounded px-2 py-1 text-xs text-[#111318] dark:text-[#F6F5F1] outline-none focus:border-[#C9A34A]"
                />
                {(minVal !== '' || maxVal !== '') && (
                  <button
                    onClick={() => {
                      setMinVal('');
                      setMaxVal('');
                    }}
                    className="text-[10px] text-red-500 hover:underline"
                  >
                    Clear Range
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Active Filter Pills Strip */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
            <span className="text-[#8E929E] font-medium">Active Filters:</span>
            {search.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C9A34A]/10 text-[#C9A34A] border border-[#C9A34A]/20">
                Search: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filterColumn && filterValue.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {filterColumn}: "{filterValue}"
                <button onClick={() => setFilterValue('')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(minVal !== '' || maxVal !== '') && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Range: {minVal || '0'} - {maxVal || '∞'}
                <button
                  onClick={() => {
                    setMinVal('');
                    setMaxVal('');
                  }}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {quickPreset !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Preset: {quickPreset}
                <button onClick={() => setQuickPreset('all')} className="hover:text-red-500 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-[#8E929E] hover:text-[#111318] dark:hover:text-[#F6F5F1] underline ml-1 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#ECEAE4]/50 dark:bg-[#111318]/60 text-[#5A5E6B] dark:text-[#A6AAB6] font-semibold border-b border-[#E3DFD7] dark:border-white/10 select-none">
            <tr>
              {activeCols.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                      col.sortable ? 'cursor-pointer hover:text-[#C9A34A]' : ''
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
                              <ArrowUp className="w-3 h-3 text-[#C9A34A]" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-[#C9A34A]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-[#8E929E] opacity-60" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E3DFD7]/60 dark:divide-white/5">
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {activeCols.map((col, cIdx) => (
                    <td key={cIdx} className="py-3.5 px-4">
                      <div className="h-3.5 bg-[#ECEAE4] dark:bg-zinc-800 rounded w-4/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={activeCols.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Layers className="w-8 h-8 text-[#8E929E]" />
                    <p className="text-xs text-[#5A5E6B] dark:text-[#A6AAB6] font-medium">
                      {emptyMessage}
                    </p>
                    {emptyAction && (
                      <button
                        onClick={emptyAction.onClick}
                        className="mt-2 px-3 py-1.5 rounded-lg text-xs gold-gradient text-[#111318] font-bold"
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
                  className={`hover:bg-[#C9A34A]/10 dark:hover:bg-white/[0.04] transition-colors ${
                    rowIdx % 2 === 1 ? 'bg-[#ECEAE4]/25 dark:bg-white/[0.015]' : 'bg-transparent'
                  }`}
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
      <div className="p-3.5 border-t border-[#E3DFD7] dark:border-white/5 bg-[#ECEAE4]/30 dark:bg-[#111318]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5A5E6B] dark:text-[#A6AAB6]">
        <div className="flex items-center gap-3">
          <span>
            Showing{' '}
            <strong className="text-[#111318] dark:text-[#F6F5F1]">
              {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-[#111318] dark:text-[#F6F5F1]">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </strong>{' '}
            of <strong className="text-[#111318] dark:text-[#F6F5F1]">{sortedData.length}</strong> items
          </span>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            aria-label="Items per page"
            className="bg-[#FFFFFF] dark:bg-[#181A22] border border-[#E3DFD7] dark:border-white/10 rounded-lg px-2 py-1 text-xs text-[#111318] dark:text-[#F6F5F1] focus:outline-none"
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
            className="p-1.5 rounded-lg border border-[#E3DFD7] dark:border-white/10 hover:bg-[#111318]/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 font-mono text-xs">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#E3DFD7] dark:border-white/10 hover:bg-[#111318]/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
