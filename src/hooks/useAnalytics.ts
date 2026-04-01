import { useQuery } from "@tanstack/react-query";
import { getSellerAnalyticsSummary, getMonthlyRevenue } from "@/lib/analyticsService";

export const analyticsKeys = {
  all: ["analytics"] as const,
  summary: (profileId: string) => [...analyticsKeys.all, "summary", profileId] as const,
  monthly: (profileId: string, months: number) => [...analyticsKeys.all, "monthly", profileId, months] as const,
};

export function useSellerAnalytics(profileId: string | undefined) {
  return useQuery({
    queryKey: analyticsKeys.summary(profileId ?? ""),
    queryFn: () => getSellerAnalyticsSummary(profileId!),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useMonthlyRevenue(profileId: string | undefined, months = 7) {
  return useQuery({
    queryKey: analyticsKeys.monthly(profileId ?? "", months),
    queryFn: () => getMonthlyRevenue(profileId!, months),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000,
  });
}
