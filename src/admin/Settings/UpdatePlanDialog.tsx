import { useState } from "react";
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
import { updatePlan } from "../../lib/api";
import { Plan } from "../../types";
// import { string } from "zod";



interface UpdatePlanDialogProps {
  plan: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdatePlanDialog({ plan, open, onOpenChange }: UpdatePlanDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Plan>({...plan});
  
  const updatePlanMutation = useMutation({
    mutationFn: (eventData: { event_id?: string, data: Plan }) => updatePlan(String(eventData.event_id), eventData.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-plans'] });
      onOpenChange(false);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
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
    updatePlanMutation.mutate(
      {
        data: formData,
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Subscription Plan</DialogTitle>
          <DialogDescription>
            Make changes to this subscription plan. Click save when you're done.
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
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <Input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="col-span-3"
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={updatePlanMutation.isPending}
            >
              {updatePlanMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}