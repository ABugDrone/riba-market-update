import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { formatNaira } from "@/data/mock";
import { monthlyAnalyticsData, decemberDailyData, decemberWeeklyData, DailyAnalytics, WeeklyAnalytics, MonthlyAnalytics } from "@/data/analyticsData";
import { downloadAsCSV, generatePDF } from "@/utils/analyticsExport";
import { Download, Printer } from "lucide-react";

interface SalesReportProps {
  timeframe?: "daily" | "weekly" | "monthly";
}

interface ReportData {
  data: (DailyAnalytics | WeeklyAnalytics | MonthlyAnalytics)[];
  title: string;
  columns: string[];
}

export function SalesReport({ timeframe = "monthly" }: SalesReportProps) {
  const reportData = useMemo((): ReportData => {
    switch (timeframe) {
      case "daily":
        return {
          data: decemberDailyData,
          title: "Daily Sales Report - December 2024",
          columns: ["date", "sales", "orders", "revenue"],
        };
      case "weekly":
        return {
          data: decemberWeeklyData,
          title: "Weekly Sales Report - December 2024",
          columns: ["week", "sales", "orders", "revenue"],
        };
      default:
        return {
          data: monthlyAnalyticsData,
          title: "Monthly Sales Report",
          columns: ["month", "sales", "orders", "revenue"],
        };
    }
  }, [timeframe]);

  const totalRevenue = useMemo(
    () => reportData.data.reduce((sum, item) => sum + (item.revenue || 0), 0),
    [reportData.data]
  );

  const totalOrders = useMemo(
    () => reportData.data.reduce((sum, item) => sum + (item.orders || 0), 0),
    [reportData.data]
  );

  const totalSales = useMemo(
    () => reportData.data.reduce((sum, item) => sum + (item.sales || 0), 0),
    [reportData.data]
  );

  const handlePrint = () => {
    const htmlContent = `
      <div class="header">
        <h1>${reportData.title}</h1>
        <p style="color: #999; font-size: 12px;">Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="summary">
        <h3>Summary</h3>
        <div class="summary-item">
          <div class="summary-label">Total Revenue</div>
          <div class="summary-value">${formatNaira(totalRevenue)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Orders</div>
          <div class="summary-value">${totalOrders}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Sales</div>
          <div class="summary-value">${totalSales}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            ${reportData.columns.map((col) => `<th>${col.charAt(0).toUpperCase() + col.slice(1)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${reportData.data
            .map(
              (item) => `
            <tr>
              ${reportData.columns.map((col) => `<td>${(item as unknown as Record<string, unknown>)[col]}</td>`).join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    generatePDF(htmlContent, `sales-report-${timeframe}.pdf`);
  };

  const handleDownloadCSV = () => {
    downloadAsCSV(reportData.data as unknown as Array<Record<string, unknown>>, `sales-report-${timeframe}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">{formatNaira(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-primary">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-primary">{totalSales}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {timeframe === "daily" ? "Daily" : timeframe === "weekly" ? "Weekly" : "Monthly"} Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={reportData.columns[0]} className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatNaira(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(142, 71%, 45%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Detailed {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Data</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {reportData.columns.map((col) => (
                  <TableHead key={col} className="capitalize">
                    {col === "date"
                      ? "Date"
                      : col === "week"
                      ? "Week"
                      : col === "month"
                      ? "Month"
                      : col === "sales"
                      ? "Sales"
                      : col === "orders"
                      ? "Orders"
                      : "Revenue"}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.data.map((item, idx) => (
                <TableRow key={idx}>
                  {reportData.columns.map((col) => {
                    const value = (item as unknown as Record<string, unknown>)[col];
                    return (
                      <TableCell key={`${idx}-${col}`}>
                        {col === "revenue"
                          ? formatNaira(value as number)
                          : col === "date" || col === "month" || col === "week"
                          ? String(value)
                          : String(value)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
