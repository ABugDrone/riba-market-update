import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from "recharts";
import { formatNaira } from "@/data/mock";
import { monthlyAnalyticsData, decemberDailyData, decemberWeeklyData, DailyAnalytics, WeeklyAnalytics, MonthlyAnalytics } from "@/data/analyticsData";
import { downloadAsCSV, generatePDF } from "@/utils/analyticsExport";
import { Download, Printer, TrendingUp, TrendingDown } from "lucide-react";

interface GainAndLossesProps {
  timeframe?: "daily" | "weekly" | "monthly";
}

interface ReportData {
  data: (DailyAnalytics | WeeklyAnalytics | MonthlyAnalytics)[];
  title: string;
  columns: string[];
}

export function GainAndLosses({ timeframe = "monthly" }: GainAndLossesProps) {
  const reportData = useMemo((): ReportData => {
    switch (timeframe) {
      case "daily":
        return {
          data: decemberDailyData,
          title: "Daily Gain & Losses Report - December 2024",
          columns: ["date", "gains", "losses", "profit"],
        };
      case "weekly":
        return {
          data: decemberWeeklyData,
          title: "Weekly Gain & Losses Report - December 2024",
          columns: ["week", "gains", "losses", "profit"],
        };
      default:
        return {
          data: monthlyAnalyticsData,
          title: "Monthly Gain & Losses Report",
          columns: ["month", "gains", "losses", "profit"],
        };
    }
  }, [timeframe]);

  const totalGains = useMemo(
    () => reportData.data.reduce((sum, item) => sum + (item.gains || 0), 0),
    [reportData.data]
  );

  const totalLosses = useMemo(
    () => reportData.data.reduce((sum, item) => sum + (item.losses || 0), 0),
    [reportData.data]
  );

  const netProfit = totalGains - totalLosses;
  const profitMargin = totalGains > 0 ? ((netProfit / totalGains) * 100).toFixed(2) : "0";

  const handlePrint = () => {
    const htmlContent = `
      <div class="header">
        <h1>${reportData.title}</h1>
        <p style="color: #999; font-size: 12px;">Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="summary">
        <h3>Summary</h3>
        <div class="summary-item">
          <div class="summary-label">Total Gains</div>
          <div class="summary-value" style="color: green;">${formatNaira(totalGains)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Losses</div>
          <div class="summary-value" style="color: red;">${formatNaira(totalLosses)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Net Profit</div>
          <div class="summary-value" style="color: ${netProfit >= 0 ? "green" : "red"};">${formatNaira(netProfit)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Profit Margin</div>
          <div class="summary-value">${profitMargin}%</div>
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
              ${reportData.columns.map((col) => `<td>${formatNaira((item as unknown as Record<string, unknown>)[col] as number)}</td>`).join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    generatePDF(htmlContent, `gain-loss-report-${timeframe}.pdf`);
  };

  const handleDownloadCSV = () => {
    downloadAsCSV(reportData.data as unknown as Array<Record<string, unknown>>, `gain-loss-report-${timeframe}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-green-700 dark:text-green-300 font-medium">Total Gains</p>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{formatNaira(totalGains)}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">Total Losses</p>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{formatNaira(totalLosses)}</p>
          </CardContent>
        </Card>
        <Card className={netProfit >= 0 ? "border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20" : "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20"}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatNaira(netProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Profit Margin</p>
            <p className="text-2xl font-bold text-primary">{profitMargin}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {timeframe === "daily" ? "Daily" : timeframe === "weekly" ? "Weekly" : "Monthly"} Gains vs Losses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={reportData.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={reportData.columns[0]} className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatNaira(value)} />
                <Legend />
                <Bar dataKey="gains" fill="hsl(142, 71%, 45%)" />
                <Bar dataKey="losses" fill="hsl(0, 84%, 60%)" />
                <Line type="monotone" dataKey="profit" stroke="hsl(220, 90%, 56%)" strokeWidth={2} />
              </ComposedChart>
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
          <div className="overflow-x-auto">
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
                      : col.charAt(0).toUpperCase() + col.slice(1)}
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
                        {col === "date" || col === "month" || col === "week"
                          ? String(value)
                          : formatNaira(value as number)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
