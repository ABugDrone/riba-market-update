import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerStores } from "@/hooks/useStores";
import { useStoreReviews } from "@/hooks/useReviews";

interface ReviewsAnalyticsProps {
  reviewType?: "positive" | "negative" | "neutral" | "all";
}

const COLORS = ["#22c55e", "#ef4444", "#6b7280"];

export function ReviewsAnalytics({ reviewType = "all" }: ReviewsAnalyticsProps) {
  const { state } = useAuth();
  const { data: stores = [] } = useSellerStores(state.currentUser?.id);
  // Use first store's reviews for analytics
  const { data: reviews = [], isLoading } = useStoreReviews(stores[0]?.id);

  const stats = useMemo(() => {
    const total = reviews.length;
    const positive = reviews.filter((r) => r.rating >= 4).length;
    const negative = reviews.filter((r) => r.rating <= 2).length;
    const neutral = reviews.filter((r) => r.rating === 3).length;
    const avg = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    return { total, positive, negative, neutral, avg };
  }, [reviews]);

  const pieData = [
    { name: "Positive", value: stats.positive },
    { name: "Negative", value: stats.negative },
    { name: "Neutral", value: stats.neutral },
  ];

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Reviews Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No reviews yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total", value: stats.total, icon: Star, color: "text-primary" },
                { label: "Positive", value: stats.positive, icon: ThumbsUp, color: "text-green-500" },
                { label: "Negative", value: stats.negative, icon: ThumbsDown, color: "text-red-500" },
                { label: "Avg Rating", value: stats.avg.toFixed(1), icon: Star, color: "text-yellow-500" },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-lg bg-muted/30 text-center">
                  <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
