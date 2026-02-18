import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatNaira } from "@/data/mock";
import { monthlyAnalyticsData, decemberDailyData, decemberWeeklyData, costBreakdownData, DailyAnalytics, WeeklyAnalytics, MonthlyAnalytics } from "@/data/analyticsData";
import { downloadAsCSV, generatePDF } from "@/utils/analyticsExport";
import { Download, Printer } from "lucide-react";

interface CostsAndExpensesProps {
  timeframe?: "daily" | "weekly" | "monthly";
}

interface ReportData {
  data: (DailyAnalytics | WeeklyAnalytics | MonthlyAnalytics)[];
  title: string;
  columns: string[];
}

interface CostBreakdownItem {
  category: string;
  percentage: number;
  amount: number;
}

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

export function CostsAndExpenses({ timeframe = "monthly" }: CostsAndExpensesProps) {
  const reportData = useMemo((): ReportData => {
    switch (timeframe) {
      case "daily":
        return {
          data: decemberDailyData,
          title: "Daily Costs & Expenses Report - December 2024",
          columns: ["date", "costs", "revenue"],
        };
      case "weekly":
        return {
          data: decemberWeeklyData,
          title: "Weekly Costs & Expenses Report - December 2024",
          columns: ["week", "costs", "revenue"],
        };
      default:
        return {
          data: monthlyAnalyticsData,
          title: "Monthly Costs & Expenses Report",
          columns: ["month", "costs", "revenue"],
        };
    }
  }, [timeframe]);

  const totalCosts = useMemo(
    () => reportData.data.reduce((sum, item) => sum + (item.costs || 0), 0),
    [reportData.data]
  );

  const totalRevenue = useMemo(
    () => reportData.data.reduce((sum, item) => sum + (item.revenue || 0), 0),
    [reportData.data]
  );

  const costPercentage = totalRevenue > 0 ? ((totalCosts / totalRevenue) * 100).toFixed(2) : "0";
  const profitMargin = (100 - parseFloat(costPercentage)).toFixed(2);

  // Calculate cost breakdown for selected timeframe
  const costBreakdown = useMemo((): CostBreakdownItem[] => {
    return costBreakdownData.map((item) => ({
      ...item,
      amount: Math.round((totalCosts * item.percentage) / 100),
    }));
  }, [totalCosts]);

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
          <div class="summary-label">Total Costs</div>
          <div class="summary-value">${formatNaira(totalCosts)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Cost to Revenue Ratio</div>
          <div class="summary-value">${costPercentage}%</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Profit Margin</div>
          <div class="summary-value">${profitMargin}%</div>
        </div>
      </div>
      <h3>Cost Breakdown</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Percentage</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${costBreakdown
            .map(
              (item) => `
            <tr>
              <td>${item.category}</td>
              <td>${item.percentage}%</td>
              <td>${formatNaira(item.amount)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <h3>Detailed ${timeframe} Data</h3>
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
              ${reportData.columns.map((col) => `<td>${col === "date" || col === "week" || col === "month" ? (item as unknown as Record<string, unknown>)[col] : formatNaira((item as unknown as Record<string, unknown>)[col] as number)}</td>`).join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    generatePDF(htmlContent, `costs-expenses-report-${timeframe}.pdf`);
  };

  const handleDownloadCSV = () => {
    downloadAsCSV(reportData.data as unknown as Array<Record<string, unknown>>, `costs-expenses-report-${timeframe}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">{formatNaira(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Costs</p>
            <p className="text-2xl font-bold text-red-600">{formatNaira(totalCosts)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Cost Ratio</p>
            <p className="text-2xl font-bold text-orange-600">{costPercentage}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Profit Margin</p>
            <p className="text-2xl font-bold text-green-600">{profitMargin}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue vs Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue vs Costs</CardTitle>
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
                  <Bar dataKey="costs" fill="hsl(0, 84%, 60%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost Breakdown Details</CardTitle>
        </CardHeader>
        <CardContent>
<<<<<<< HEAD
          <div className="overflow-x-auto">
            <Table>
=======
          <Table>
>>>>>>> 4423b1eb7983e464702bc0b9e38a81103f4cec7d
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costBreakdown.map((item) => (
                <TableRow key={item.category}>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.percentage}%</TableCell>
                  <TableCell className="text-right font-medium">{formatNaira(item.amount)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 font-bold">
                <TableCell>Total</TableCell>
                <TableCell>100%</TableCell>
                <TableCell className="text-right">{formatNaira(totalCosts)}</TableCell>
              </TableRow>
            </TableBody>
<<<<<<< HEAD
            </Table>
          </div>
=======
          </Table>
>>>>>>> 4423b1eb7983e464702bc0b9e38a81103f4cec7d
        </CardContent>
      </Card>

      {/* Detailed Table */}
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
<<<<<<< HEAD
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {reportData.columns.map((col) => (
=======
          <Table>
            <TableHeader>
              <TableRow>
                {reportData.columns.map((col) => (
>>>>>>> 4423b1eb7983e464702bc0b9e38a81103f4cec7d
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
<<<<<<< HEAD
            </Table>
          </div>
=======
          </Table>
>>>>>>> 4423b1eb7983e464702bc0b9e38a81103f4cec7d
        </CardContent>
      </Card>
    </div>
  );
}
