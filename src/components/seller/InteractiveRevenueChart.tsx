import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { formatNaira } from "@/data/mock";
import { monthlyAnalyticsData, decemberDailyData, decemberWeeklyData, WeeklyAnalytics, DailyAnalytics } from "@/data/analyticsData";
import { ChevronUp, ChevronDown } from "lucide-react";

interface SelectedMonth {
  month: string;
  revenue: number;
}

interface CustomDotProps {
  cx: number;
  cy: number;
  payload: SelectedMonth;
}

export function InteractiveRevenueChart() {
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<WeeklyAnalytics | null>(null);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);

  const revenueData = [
    { month: "Jul", revenue: 3600000 },
    { month: "Aug", revenue: 5400000 },
    { month: "Sep", revenue: 7500000 },
    { month: "Oct", revenue: 9600000 },
    { month: "Nov", revenue: 8400000 },
    { month: "Dec", revenue: 4205000 },
    { month: "Jan", revenue: 5700000 },
  ];

  const handleMonthClick = (data: SelectedMonth) => {
    setSelectedMonth(data);
    setShowWeeklyModal(true);
  };

  const handleWeekClick = (week: WeeklyAnalytics) => {
    setSelectedWeek(week);
    setShowDailyModal(true);
  };

  const CustomDot = (props: CustomDotProps) => {
    const { cx, cy, payload } = props;
    return (
      <g onClick={() => handleMonthClick(payload)}>
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="hsl(142, 71%, 45%)"
          stroke="white"
          strokeWidth={2}
          style={{
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          className="hover:r-8"
        />
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fill="hsl(142, 71%, 45%)"
          fontSize="12"
          fontWeight="bold"
          style={{
            cursor: "pointer",
            pointerEvents: "none",
          }}
        >
          {payload.month}
        </text>
      </g>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Revenue Overview</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Click on any data point to see weekly breakdown</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatNaira(value)} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={2}
                  dot={(props) => <CustomDot {...(props as CustomDotProps)} />}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Modal */}
      <Dialog open={showWeeklyModal} onOpenChange={setShowWeeklyModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMonth?.month} 2024 - Weekly Breakdown</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-6">
            {/* Weekly Chart */}
            <div>
              <h3 className="font-semibold mb-3">Weekly Revenue Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={decemberWeeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => formatNaira(value)}
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          const data = payload[0].payload;
                          return (
                            <div
                              className="bg-white dark:bg-slate-900 p-3 rounded border border-gray-200 dark:border-slate-700 shadow-lg"
                              onClick={() => handleWeekClick(data)}
                              style={{ cursor: "pointer" }}
                            >
                              <p className="font-medium text-sm">{data.week}</p>
                              <p className="text-xs text-muted-foreground">
                                {data.startDate} - {data.endDate}
                              </p>
                              <p className="text-sm font-bold text-primary mt-1">
                                Revenue: {formatNaira(data.revenue)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Click to see daily breakdown
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(142, 71%, 45%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Table */}
            <div>
              <h3 className="font-semibold mb-3">Weekly Details (Click to view daily data)</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {decemberWeeklyData.map((week) => (
                    <TableRow key={week.week} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{week.week}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {week.startDate} - {week.endDate}
                      </TableCell>
                      <TableCell>{week.sales}</TableCell>
                      <TableCell>{week.orders}</TableCell>
                      <TableCell className="font-medium">{formatNaira(week.revenue)}</TableCell>
                      <TableCell className="font-medium text-green-600">{formatNaira(week.profit)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWeekClick(week)}
                          className="h-7 text-xs gap-1"
                        >
                          <ChevronDown className="h-3 w-3" />
                          View Daily
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Daily Modal */}
      <Dialog open={showDailyModal} onOpenChange={setShowDailyModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedWeek?.week} - Daily Breakdown</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-6">
            {/* Daily Chart */}
            <div>
              <h3 className="font-semibold mb-3">Daily Revenue Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedWeek?.days || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatNaira(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="hsl(142, 71%, 45%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
                  <p className="text-2xl font-bold">
                    {selectedWeek?.days?.reduce((sum: number, day: DailyAnalytics) => sum + day.sales, 0) || 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl font-bold">
                    {selectedWeek?.days?.reduce((sum: number, day: DailyAnalytics) => sum + day.orders, 0) || 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatNaira(selectedWeek?.revenue || 0)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">Total Profit</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNaira(selectedWeek?.profit || 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Details Table */}
            <div>
              <h3 className="font-semibold mb-3">Daily Details</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Costs</TableHead>
                    <TableHead>Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedWeek?.days?.map((day: DailyAnalytics) => (
                    <TableRow key={day.date}>
                      <TableCell className="font-medium">{day.date}</TableCell>
                      <TableCell>{day.sales}</TableCell>
                      <TableCell>{day.orders}</TableCell>
                      <TableCell>{formatNaira(day.revenue)}</TableCell>
                      <TableCell className="text-red-600">{formatNaira(day.costs)}</TableCell>
                      <TableCell className="font-medium text-green-600">{formatNaira(day.profit)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
