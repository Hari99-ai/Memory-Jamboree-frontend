import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchPlans } from "../lib/api";
import {  Plan } from "../types";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

async function bookNow(selectedPlan: Plan) {
  const successUrl = `${window.location.origin}/success`;
  const cancelUrl = `${window.location.origin}/cancel`;
  const baseUrl = "https://aidev.gravitinfosystems.com:5000";

  const token = sessionStorage.getItem("auth_token");
  const userId = sessionStorage.getItem('userId');

  try {
    const userInfo = await axios.get(`${baseUrl}/get-user-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const email = userInfo.data.email;

    const finalPlan = {
      ...selectedPlan,
      userId,
      email,
      successUrl,
      cancelUrl,
    };

    // Send buy_subscription request
    const response = await axios.post(`${baseUrl}/buy_subscription`, finalPlan, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.sessionId) {
      const stripe = await loadStripe("pk_test_51PqaYISDZTUs96fk9cAT8aehao09lSxC4m9j5F3dn9mK8de8QWcqNlXiUEnHGP5FcaQFT7crwHt8PWddMnNmPhAq00iQsJk9xE");
      if (stripe) {
        await stripe.redirectToCheckout({
          sessionId: response.data.sessionId,
        });
      } else {
        console.error('Stripe failed to load');
      }
    } else {
      throw new Error('No sessionId returned');
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    throw new Error(error.response?.data?.message || 'Payment failed');
  }
}

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const navigate = useNavigate()

  const {
    data: plans,
    isLoading,
    error,
  } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: fetchPlans,
  });


  const activePlans = plans?.filter(plan => Number(plan.status) === 1) || [];

  const { mutate, isPending } = useMutation({
  mutationKey: ['buy-plan'],
  mutationFn: async (plan: Plan) => {
    return await bookNow(plan);  
  },
  onError: (error: any) => {
    toast.error(error.message || "Payment failed");
  },
});

  const handlePlanSelect = (plan: Plan) => {
    if (plan.smid === 14) {
      navigate('/dashboard');
    } else {
      mutate(plan); // Use mutate instead of bookNow(plan)
    }
};



  // useEffect(() => {
  //   if (plans && !isPending) {
  //     const freePlan = plans.find((plan) => plan.amount <= 0);
  //     if (freePlan) {
  //       mutate({ planId: Number });
  //     }
  //   }
  // }, [plans, mutate]);

  if (error) {
    return <div>Error: {error instanceof Error ? error.message : "Unknown error"}</div>;
  }

  return (
    <div className="h-screen flex justify-center items-center bg-blue-300">
  <div className="min-h-[600px] w-full max-w-xl border-2 px-6 py-4 rounded-xl bg-white flex flex-col">
    {/* Header */}
    <div className="flex items-center gap-4 border-b pb-4">
      <img src="/images/payment.jpg" alt="img" className="h-16 w-auto" />
      <div className="flex flex-col">
        <h2 className="text-3xl">Personalized Study Plan</h2>
        <p className="text-gray-700 text-sm">
          Membership status: <span className="text-green-600">Active</span>
        </p>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin size-10" />
        </div>
      ) : (
        <>
          {activePlans?.map((plan) => (
            <div
              key={plan.smid}
              className={`flex items-center justify-between py-2 px-2 border m-2 rounded-sm cursor-pointer
                ${selectedPlan?.smid === plan.smid ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
              onClick={() => setSelectedPlan(plan)}
            >
              <div className="flex flex-col">
                <p className="mb-1 text-gray-600">{plan.sname}</p>
                <h4 className="text-lg font-semibold">₹{plan.amount}</h4>
              </div>

              <div className="flex items-center justify-center">
                <div className={`h-5 w-5 rounded-full border-2 
                  ${selectedPlan?.smid === plan.smid ? 'bg-slate-300 border-slate-500' : 'border-gray-400'}`} />
              </div>
            </div>
          ))}
        </>
      )}
    </div>

    {/* Footer button */}
    <div className="flex flex-col items-center justify-center space-y-2 pt-4 border-t">
      <button
        disabled={!selectedPlan || isPending}
        onClick={() => {
          if (selectedPlan) handlePlanSelect(selectedPlan);
        }}
        className="p-3 bg-green-500 disabled:bg-green-300 w-[220px] text-white text-lg font-semibold rounded-3xl"
      >
        {isPending ? 'Processing...' : selectedPlan ? 'Continue' : 'Select a Plan'}
      </button>
      <p className="mt-2 text-sm text-gray-600">Swipe back to access other items</p>
    </div>
  </div>
</div>

  );
}