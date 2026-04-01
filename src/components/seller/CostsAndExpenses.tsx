import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { formatNaira } from "@/data/mock";
import { useMonthlyRevenue } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";

interface CostsAndExpensesProps {
  timeframe?: "daily" | "weekly" | "monthly";
}

const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

const costBreakdown = [
  { category: "Payment Processing", percentage: 25 },
  { category: "Logistics & Shipping", percentage: 30 },
  { category: "Platform Fees", percentage: 15 },
  { category: "Packaging", percentage: 15 },
  { category: "Operations", percentage: 15 },
];

export function CostsAndExpenses({ timeframe = "monthly" }: CostsAndExpensesProps) {
  const { state } = useAuth();
  const { data: raw = [], isLoading } = useMonthlyRevenue(state.currentUser?.id);

  const data = raw.map((r) => ({
    ...r,
    costs: r.revenue - r.profit,
  }));

  const totalCosts = data.reduce((s, r) => s + r.costs, 0);
  const pieData = costBreakdown.map((c) => ({
    ...c,
    amount: Math.round(totalCosts * c.percentage / 100),
  }));

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Costs & Expenses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No cost data yet.</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => formatNaira(v)} />
                  <Bar dataKey="costs" fill="#ef4444" radius={[4,4,0,0]} name="Costs" />
                </BarChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={70} label={({ percentage }) => `${percentage}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v: number) => formatNaira(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Costs</TableHead>
                  <TableHead>Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{formatNaira(row.revenue)}</TableCell>
                    <TableCell className="text-red-500">{formatNaira(row.costs)}</TableCell>
                    <TableCell className="text-green-600">{formatNaira(row.profit)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
