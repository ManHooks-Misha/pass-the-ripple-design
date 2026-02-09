// hooks/useExportData.ts
import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/config/api";
import { getAuthToken } from "@/lib/auth-token";
import { API_BASE_URL } from "@/config/api";

type ExportFilters = Record<string, string | number | boolean | null | undefined>;

type ExportConfig = {
  exportEndpoint: string; // e.g., "/admin/users/export"
  listEndpoint: string;   // e.g., "/admin/users/list" 👈 NEW
  dataKey: string;        // e.g., "users", "courses", "data" 👈 NEW
  fallbackPagination?: boolean;
  perPage?: number;
  fileNamePrefix: string;
  columns: { key: string; label: string; formatter?: (value: any, row?: any) => string }[];
  transformRow?: (row: any) => Record<string, any>;
  appName?: string;
  filters?: ExportFilters;
};

export const useExportData = () => {
  const [exporting, setExporting] = useState(false);

  const exportData = async (config: ExportConfig) => {
    const {
      exportEndpoint,
      listEndpoint,
      dataKey,
      fallbackPagination = true,
      perPage = 100,
      fileNamePrefix,
      columns,
      transformRow,
      appName = "Admin Dashboard",
      filters = {},
    } = config;

    setExporting(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found.");

      const buildQueryParams = (filters: ExportFilters): string => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value));
          }
        });
        return params.toString();
      };

      let allData: any[] = [];

      // ✅ Try dedicated export endpoint WITH filters
      try {
        const filterQuery = buildQueryParams(filters);
        // Fix URL construction - check if exportEndpoint already has query params
        const separator = exportEndpoint.includes('?') ? '&' : '?';
        const url = `${exportEndpoint}${filterQuery ? `${separator}${filterQuery}` : ""}`;
        const response = await apiFetch<any>(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.success) {
          
          // Handle: response.data is array OR response.data[dataKey] is array
          if (Array.isArray(response.data)) {
            allData = response.data;
          } else if (response.data && Array.isArray(response.data[dataKey])) {
            allData = response.data[dataKey];
          } else {
            throw new Error(`Expected array at 'data' or 'data.${dataKey}'`);
          }
        } else {
          throw new Error(response.message || "Export endpoint failed");
        }
      } catch (exportError) {
        console.warn("Export endpoint unavailable. Falling back to paginated fetch.");
        if (!fallbackPagination) throw exportError;

        // ✅ Generic fallback: paginate using listEndpoint
        let currentPage = 1;
        let hasMore = true;
        while (hasMore) {
          const filterParams = new URLSearchParams({
            page: String(currentPage),
            per_page: String(perPage),
            sort_by: "created_at",
            sort_order: "desc",
            ...Object.fromEntries(
              Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== "")
            ),
          });

          const url = `${listEndpoint}?${filterParams.toString()}`;
          const res = await apiFetch<any>(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.success && res.data && res.data[dataKey]) {
            const pageData = res.data[dataKey];
            const items = Array.isArray(pageData.data) ? pageData.data : (Array.isArray(pageData) ? pageData : []);
            allData.push(...items);
            hasMore = currentPage < (pageData.last_page || 1);
            currentPage++;
          } else {
            hasMore = false;
          }
        }
      }

      // ✅ Generate Excel (same as before)
      const headerRows = [
        [appName],
        // [`Logo URL: ${API_BASE_URL}/static/logo.png`],
        [`Total Records: ${allData.length}`],
        [],
      ];

      const columnLabels = columns.map((col) => col.label);
      const dataRows = allData.map((row) => {
        const transformed = transformRow ? transformRow(row) : row;
        return columns.map((col) => {
          const rawValue = transformed[col.key];
          return col.formatter ? col.formatter(rawValue, row) : rawValue ?? "N/A";
        });
      });

      const aoa = [...headerRows, columnLabels, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } }];

      const headerRow = headerRows.length;
      for (let c = 0; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r: headerRow, c });
        if (!ws[addr]) ws[addr] = { t: "s", v: columnLabels[c] };
        ws[addr].s = {
          font: { bold: true },
          alignment: { horizontal: "center", vertical: "center" },
        } as any;
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`);

      toast({
        title: "Export Successful",
        description: `${allData.length} records exported with current filters.`,
      });
    } catch (err: any) {
      console.error("Export error:", err);
      toast({
        title: "Export Failed",
        description: err.message || "Failed to export filtered data.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return { exporting, exportData };
};