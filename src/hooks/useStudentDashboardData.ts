import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "../lib/api";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false, // avoid refetching on focus
  });
};