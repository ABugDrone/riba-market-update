import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatNaira } from "@/data/mock";
import { useMonthlyRevenue } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";

interface GainAndLossesProps {
  timeframe?: "daily" | "weekly" | "monthly";
}

export function GainAndLosses({ timeframe = "monthly" }: GainAndLossesProps) {
  const { state } = useAuth();
  const { data: raw = [], isLoading } = useMonthlyRevenue(state.currentUser?.id);

  // Derive gains/losses from revenue and profit
  const data = raw.map((r) => ({
    ...r,
    gains: r.profit,
    losses: r.revenue - r.profit,
  }));

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gains & Losses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data yet.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatNaira(v)} />
                <Legend />
                <Bar dataKey="gains" fill="#22c55e" radius={[4,4,0,0]} name="Gains" />
                <Bar dataKey="losses" fill="#ef4444" radius={[4,4,0,0]} name="Losses" />
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" strokeWidth={2} name="Net Profit" />
              </ComposedChart>
            </ResponsiveContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Gains</TableHead>
                  <TableHead>Losses</TableHead>
                  <TableHead>Net Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell className="text-green-600">{formatNaira(row.gains)}</TableCell>
                    <TableCell className="text-red-500">{formatNaira(row.losses)}</TableCell>
                    <TableCell className="font-medium">{formatNaira(row.profit)}</TableCell>
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
