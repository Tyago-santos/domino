import { forwardRef, useMemo, useState, useCallback, type HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";

export interface ColumnDef<T> {
  id: string;
  header: string | (() => React.ReactNode);
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface SortState {
  columnId: string;
  direction: "asc" | "desc";
}

interface DataTableProps<T> extends HTMLAttributes<HTMLDivElement> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  enableSearch?: boolean;
}

function DataTableInner<T extends Record<string, unknown>>(
  {
    columns,
    data,
    searchPlaceholder = "Search...",
    searchKey,
    pageSize: initialPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50],
    emptyMessage = "No results found.",
    onRowClick,
    enableSearch = true,
    className,
    ...props
  }: DataTableProps<T>,
  ref: React.Ref<HTMLDivElement>
) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handleSort = useCallback((columnId: string) => {
    setSort((prev) => {
      if (prev?.columnId === columnId) {
        if (prev.direction === "asc") return { columnId, direction: "desc" };
        return null;
      }
      return { columnId, direction: "asc" };
    });
    setCurrentPage(0);
  }, []);

  const filteredData = useMemo(() => {
    if (!search || !searchKey) return data;
    const lower = search.toLowerCase();
    return data.filter((row) => {
      const value = row[searchKey];
      if (value == null) return false;
      return String(value).toLowerCase().includes(lower);
    });
  }, [data, search, searchKey]);

  const sortedData = useMemo(() => {
    if (!sort) return filteredData;
    const col = columns.find((c) => c.id === sort.columnId);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = col.accessorKey ? a[col.accessorKey] : a[sort.columnId as keyof T];
      const bVal = col.accessorKey ? b[col.accessorKey] : b[sort.columnId as keyof T];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sort.direction === "asc" ? -1 : 1;
      if (bVal == null) return sort.direction === "asc" ? 1 : -1;

      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);
  const paginatedData = sortedData.slice(
    safeCurrentPage * pageSize,
    (safeCurrentPage + 1) * pageSize
  );

  const getSortIcon = (columnId: string) => {
    if (sort?.columnId !== columnId) return null;
    return sort.direction === "asc" ? (
      <ChevronUp className="ml-1 h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="ml-1 h-3.5 w-3.5" />
    );
  };

  return (
    <div ref={ref} className={cn("w-full space-y-4", className)} {...props}>
      {enableSearch && searchKey && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
            className={cn(
              "flex h-10 w-full rounded-md border border-surface-border bg-surface pl-10 pr-3 py-2 text-sm text-text",
              "placeholder:text-text-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
              "dark:border-surface-border dark:bg-surface dark:text-text"
            )}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-surface-border dark:border-surface-border md:overflow-visible">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b border-surface-border dark:border-surface-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    "h-12 px-4 text-left align-middle font-medium text-text-muted",
                    "dark:text-text-muted",
                    col.sortable && "cursor-pointer select-none hover:text-text dark:hover:text-text",
                    col.headerClassName
                  )}
                  onClick={() => col.sortable && handleSort(col.id)}
                >
                  <div className="flex items-center">
                    {typeof col.header === "function" ? col.header() : col.header}
                    {col.sortable && getSortIcon(col.id)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    "border-b border-surface-border transition-colors",
                    "hover:bg-surface-muted/50 dark:border-surface-border dark:hover:bg-surface-muted/50",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn("p-4 align-middle text-text dark:text-text", col.className)}
                    >
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                          ? String(row[col.accessorKey] ?? "")
                          : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sortedData.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-sm text-text-muted dark:text-text-muted">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(0);
              }}
              className={cn(
                "h-8 rounded-md border border-surface-border bg-surface px-2 text-sm text-text",
                "dark:border-surface-border dark:bg-surface dark:text-text"
              )}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>
              of {sortedData.length} result{sortedData.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(0)}
              disabled={safeCurrentPage === 0}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md border border-surface-border",
                "text-text transition-colors hover:bg-surface-muted",
                "disabled:pointer-events-none disabled:opacity-50",
                "dark:border-surface-border dark:text-text dark:hover:bg-surface-muted"
              )}
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={safeCurrentPage === 0}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md border border-surface-border",
                "text-text transition-colors hover:bg-surface-muted",
                "disabled:pointer-events-none disabled:opacity-50",
                "dark:border-surface-border dark:text-text dark:hover:bg-surface-muted"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm text-text dark:text-text">
              {safeCurrentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safeCurrentPage >= totalPages - 1}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md border border-surface-border",
                "text-text transition-colors hover:bg-surface-muted",
                "disabled:pointer-events-none disabled:opacity-50",
                "dark:border-surface-border dark:text-text dark:hover:bg-surface-muted"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={safeCurrentPage >= totalPages - 1}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md border border-surface-border",
                "text-text transition-colors hover:bg-surface-muted",
                "disabled:pointer-events-none disabled:opacity-50",
                "dark:border-surface-border dark:text-text dark:hover:bg-surface-muted"
              )}
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const DataTable = forwardRef(DataTableInner) as <T extends Record<string, unknown>>(
  props: DataTableProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

export { DataTable, type DataTableProps };
