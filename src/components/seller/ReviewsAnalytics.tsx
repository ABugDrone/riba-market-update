import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";
import { reviewAnalyticsData } from "@/data/analyticsData";
import { downloadAsCSV, generatePDF } from "@/utils/analyticsExport";
import { Download, Printer, Star, ThumbsUp, ThumbsDown } from "lucide-react";

interface ReviewsAnalyticsProps {
  reviewType?: "positive" | "negative" | "neutral" | "all";
}

const COLORS = ["#22c55e", "#ef4444", "#6b7280"];

export function ReviewsAnalytics({ reviewType = "all" }: ReviewsAnalyticsProps) {
  const reportData = useMemo(() => {
    switch (reviewType) {
      case "positive":
        return {
          data: reviewAnalyticsData,
          title: "Positive Reviews Analytics",
          key: "positive",
          color: "#22c55e",
          icon: ThumbsUp,
        };
      case "negative":
        return {
          data: reviewAnalyticsData,
          title: "Negative Reviews Analytics",
          key: "negative",
          color: "#ef4444",
          icon: ThumbsDown,
        };
      case "neutral":
        return {
          data: reviewAnalyticsData,
          title: "Neutral Reviews Analytics",
          key: "neutral",
          color: "#6b7280",
          icon: Star,
        };
      default:
        return {
          data: reviewAnalyticsData,
          title: "All Reviews Analytics",
          key: "all",
          color: "#3b82f6",
          icon: Star,
        };
    }
  }, [reviewType]);

  // Calculate totals
  const totals = useMemo(() => {
    return reportData.data.reduce(
      (acc, item) => ({
        positive: acc.positive + item.positive,
        negative: acc.negative + item.negative,
        neutral: acc.neutral + item.neutral,
        totalReviews: acc.totalReviews + item.totalReviews,
      }),
      { positive: 0, negative: 0, neutral: 0, totalReviews: 0 }
    );
  }, [reportData.data]);

  const positivePercentage =
    totals.totalReviews > 0
      ? ((totals.positive / totals.totalReviews) * 100).toFixed(2)
      : "0";
  const negativePercentage =
    totals.totalReviews > 0
      ? ((totals.negative / totals.totalReviews) * 100).toFixed(2)
      : "0";
  const neutralPercentage =
    totals.totalReviews > 0
      ? ((totals.neutral / totals.totalReviews) * 100).toFixed(2)
      : "0";

  const averageRating = useMemo(() => {
    const avgSum = reportData.data.reduce((sum, item) => sum + item.averageRating, 0);
    return (avgSum / reportData.data.length).toFixed(2);
  }, [reportData.data]);

  const pieData = [
    { name: "Positive", value: totals.positive, color: "#22c55e" },
    { name: "Negative", value: totals.negative, color: "#ef4444" },
    { name: "Neutral", value: totals.neutral, color: "#6b7280" },
  ].filter((item) => item.value > 0);

  const handlePrint = () => {
    const htmlContent = `
      <div class="header">
        <h1>${reportData.title}</h1>
        <p style="color: #999; font-size: 12px;">Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="summary">
        <h3>Summary</h3>
        <div class="summary-item">
          <div class="summary-label">Total Reviews</div>
          <div class="summary-value">${totals.totalReviews}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Average Rating</div>
          <div class="summary-value">${averageRating} ⭐</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Positive Reviews</div>
          <div class="summary-value" style="color: green;">${totals.positive} (${positivePercentage}%)</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Negative Reviews</div>
          <div class="summary-value" style="color: red;">${totals.negative} (${negativePercentage}%)</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Positive</th>
            <th>Negative</th>
            <th>Neutral</th>
            <th>Total</th>
            <th>Avg Rating</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.data
            .map(
              (item) => `
            <tr>
              <td>${item.month}</td>
              <td>${item.positive}</td>
              <td>${item.negative}</td>
              <td>${item.neutral}</td>
              <td>${item.totalReviews}</td>
              <td>${item.averageRating} ⭐</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    generatePDF(htmlContent, `reviews-report-${reviewType}.pdf`);
  };

  const handleDownloadCSV = () => {
    downloadAsCSV(reportData.data as unknown as Array<Record<string, unknown>>, `reviews-report-${reviewType}.csv`);
  };

  return (
    <div className="max-h-[90vh] md:max-h-auto overflow-y-auto">
      <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-green-700 dark:text-green-300 font-medium">Positive Reviews</p>
              <ThumbsUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{totals.positive}</p>
            <p className="text-xs text-green-600">{positivePercentage}% of total</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">Negative Reviews</p>
              <ThumbsDown className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{totals.negative}</p>
            <p className="text-xs text-red-600">{negativePercentage}% of total</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50/50 dark:border-gray-900/30 dark:bg-gray-950/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Neutral Reviews</p>
            <p className="text-2xl font-bold text-muted-foreground">{totals.neutral}</p>
            <p className="text-xs text-muted-foreground">{neutralPercentage}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground mb-1">Average Rating</p>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-primary">{averageRating}</p>
            <p className="text-xs text-muted-foreground">{totals.totalReviews} reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reviews Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reviews Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="positive" stroke="#22c55e" strokeWidth={2} name="Positive" />
                  <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} name="Negative" />
                  <Line type="monotone" dataKey="neutral" stroke="#6b7280" strokeWidth={2} name="Neutral" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Review Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, color }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" domain={[0, 5]} />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} ⭐`} />
                <Bar dataKey="averageRating" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Detailed Monthly Data</CardTitle>
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
                <TableHead>Month</TableHead>
                <TableHead className="text-center">
                  <Badge variant="default" className="bg-green-600">Positive</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge variant="destructive">Negative</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge variant="secondary">Neutral</Badge>
                </TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Avg Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.data.map((item) => (
                <TableRow key={item.month}>
                  <TableCell className="font-medium">{item.month}</TableCell>
                  <TableCell className="text-center text-green-600 font-medium">{item.positive}</TableCell>
                  <TableCell className="text-center text-red-600 font-medium">{item.negative}</TableCell>
                  <TableCell className="text-center text-gray-600 font-medium">{item.neutral}</TableCell>
                  <TableCell className="text-center font-medium">{item.totalReviews}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span>{item.averageRating}</span>
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 bg-muted/50 font-bold">
                <TableCell>Total</TableCell>
                <TableCell className="text-center text-green-600">{totals.positive}</TableCell>
                <TableCell className="text-center text-red-600">{totals.negative}</TableCell>
                <TableCell className="text-center text-gray-600">{totals.neutral}</TableCell>
                <TableCell className="text-center">{totals.totalReviews}</TableCell>
                <TableCell className="text-center">{averageRating} ⭐</TableCell>
              </TableRow>
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
