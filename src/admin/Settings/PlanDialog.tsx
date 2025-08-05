import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlan, updatePlan } from "../../lib/api";
import { Plan } from "../../types";
import toast from "react-hot-toast";

// interface PlanData {
//   sname: string;
//   amount: number;
//   duration: number;
//   status: boolean;
//   smid?: string | number;

// }

interface PlanDialogProps {
  mode: "create" | "update";
  plan?: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultPlan: Plan = {
  sname: "",
  amount: 0,
  duration: 1,
  status: true,
  discount_percent: 0,
  status_message: "",
  total_active_members: 0
};

export function PlanDialog({ mode, plan, open, onOpenChange }: PlanDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Plan>(plan || defaultPlan);

  useEffect(() => {
    setFormData(mode === "update" && plan ? { ...plan } : defaultPlan);
  }, [open, mode, plan]);

  const createPlanMutation = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      toast.success("Plan created successfully");
      queryClient.invalidateQueries({ queryKey: ['get-plans'] });
      onOpenChange(false);
    },
  });

  const updatePlanMutation = useMutation({
    mutationKey: ['update-plan'],
    mutationFn: ({ planId, data }: { planId: string; data: Plan }) => updatePlan(planId, data),
    onSuccess: () => {
      toast.success("Plan updated successfully");
      queryClient.invalidateQueries({ queryKey: ['get-plans'] });
      onOpenChange(false);
    },
  });

  const isPending = createPlanMutation.isPending || updatePlanMutation.isPending;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" || name === "discount_percent" ? parseFloat(value) : value,
    });
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData({
      ...formData,
      status: checked,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      createPlanMutation.mutate(formData);
    } else if (mode === "update" && formData.smid) {
      updatePlanMutation.mutate({
        planId: String(formData.smid),
        data: {
          sname: formData.sname,
          amount: formData.amount,
          duration: formData.duration,
          sfeatures: "", // optional: update as needed
          stripe_price_id: null,
          stripe_product_id: null,
          status: formData.status,
          status_message: formData.status_message,
          total_active_members: 0,
          discount_percent:formData.discount_percent
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Plan" : "Update Subscription Plan"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to create a new subscription plan."
              : "Make changes to this subscription plan. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sname" className="text-right">
                Plan Name
              </Label>
              <Input
                id="sname"
                name="sname"
                value={formData.sname}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="e.g. Basic Plan"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                className="col-span-3"
                min="0"
                step="1"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount_percent" className="text-right">
                  Discount (%)
                </Label>
                <Input
                  id="discount_percent"
                  name="discount_percent"
                  type="number"
                  value={formData.discount_percent}
                  onChange={handleInputChange}
                  className="col-span-3"
                  min="0"
                  max="100"
                  step="1"
                />
              </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (months)
              </Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                className="col-span-3"
                min={1}
                max={60}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Active Status
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={handleStatusChange}
                />
                <span className={formData.status ? "text-green-600" : "text-red-600"}>
                  {formData.status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : mode === "create" ? "Create Plan" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
