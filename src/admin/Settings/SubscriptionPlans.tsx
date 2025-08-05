/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlusIcon } from "lucide-react";
import PlanCard from "./PlanCard";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deletePlan, fetchPlans, statusHandling } from "../../lib/api";
import Loader2 from "../../components/Loader2";
import { PlanDialog } from "./PlanDialog";
import { useState } from "react";
// import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { SkeletonCard } from "../components/SkeletonCard";

export default function SubscriptionPlans() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  // const [open , setOpen] = useState(false)

  const queryClient = useQueryClient();

  const {
    data: plans,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["get-plans"],
    queryFn: fetchPlans,
  });

  const { mutate: deletePlanMutate } = useMutation({
    mutationKey: ["delete-plan"],
    mutationFn: deletePlan,
  });

  // Usage
  const handleDelete = (planId: string) => {
    deletePlanMutate(planId, {
      onSuccess: () => {
        toast.success("plan deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["get-plans"] });
      },
      onError: (err) => {
        console.error("Delete failed:", err);
      },
    });
  };

  const { mutate: statusPlanMutate } = useMutation({
    mutationKey: ["status-handling"],
    mutationFn: statusHandling,
  });

  const handlePlanStatus = (planId: string) => {
    statusPlanMutate(planId, {
      onSuccess: () => {
        toast.success("Status Plan successfully Changed");
        queryClient.invalidateQueries({ queryKey: ["get-plans"] });
      },
      onError: (err) => {
        console.error("Status handle failed:", err);
      },
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 />
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-md">
        Error loading plans. Please try again later.
      </div>
    );

  const handleCreatePlan = () => {
    setDialogMode("create");
    setSelectedPlan(null);
    setDialogOpen(true);
  };

  const handleUpdatePlan = (plan: any) => {
    setDialogMode("update");
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 />
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-md">
        Error loading plans. Please try again later.
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <button
          onClick={handleCreatePlan}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Create Plan
        </button>
      </div>

      {plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              {plans.map((plan) => (
                <PlanCard
                  key={plan.smid}
                  sname={plan.sname}
                  amount={plan.amount}
                  duration={plan.duration}
                  status_message={plan.status ? "Active" : "Inactive"}
                  total_active_members={plan.total_active_members}
                  status={plan.status}
                  smid={plan.smid}
                  discount_percent={plan.discount_percent}
                  onUpdate={() => handleUpdatePlan(plan)}
                  onDelete={() => handleDelete(String(plan.smid))}
                  onStatus={() => handlePlanStatus(String(plan.smid))}
                />
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No subscription plans found.</p>
        </div>
      )}

      <PlanDialog
        mode={dialogMode}
        plan={selectedPlan}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
