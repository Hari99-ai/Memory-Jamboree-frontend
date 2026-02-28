import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/client"

export const useOthersCategory = (classes: string | null) => {
  const token = sessionStorage.getItem("auth_token");
  if (!token) throw new Error("No auth token found");
  const { data, isLoading, refetch  } = useQuery({
    queryKey: ['get-others-category'],
    queryFn: async () => {
      const response = await api.get(`/get-category/${classes}` , {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":"application/json"
        }
      })
      return response.data
    }
  })

  return { data, isLoading, refetch}
}
