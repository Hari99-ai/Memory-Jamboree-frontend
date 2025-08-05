// import { Switch } from "../../components/ui/switch";
import { Plan } from "../../types";

export default function PlanCard({
  sname,
  amount,
  duration,
  status_message,
  total_active_members,
  status,
  onUpdate,
  onDelete,
  // onStatus,
  final_amount
}: Plan) {
  const monthlyAmount = (Number(final_amount ?? amount) / 12).toFixed(2);
  

  return (
    <div className="h-96 w-80 shadow-lg rounded-xl bg-white border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <h2 className="text-2xl font-bold capitalize">{sname}</h2>
        <p className="text-sm opacity-90">{duration}</p>
      </div>

      {/* Price section */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <h3 className="text-gray-600 font-medium mb-1">Amount</h3>
            <p className="text-4xl font-bold text-gray-800">
              ₹{amount}
              <span className="text-base text-gray-500 font-normal"> /year</span>
            </p>

            {final_amount && (
              <p className={`text-sm mt-1 ${final_amount < amount ? "text-green-600" : "text-gray-600"}`}>
                Final Amount: ₹{final_amount}
              </p>
            )}


            <p className="text-sm text-gray-500 mt-1">
              ₹{monthlyAmount} <span className="text-base font-normal">/month</span>
            </p>
          </div>

          {/* Members info */}
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm">Active members</p>
              <span className="bg-blue-100 text-blue-800 font-medium px-2 py-1 rounded text-xs">
                {total_active_members}
              </span>
            </div>
          </div>
        </div>

        {/* Status & Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <p className={status ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {status_message}
          </p>
          {/* <Switch onClick={onStatus} /> */}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={onUpdate}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors font-medium text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Update
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-medium text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
