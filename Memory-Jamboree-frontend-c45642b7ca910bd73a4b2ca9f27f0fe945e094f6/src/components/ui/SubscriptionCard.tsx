const SubscriptionCard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6 space-y-6">
      {/* Page Heading */}
      <div className="w-full max-w-5xl">
        
           <h2 className="w-full max-w-6xl text-left text-4xl font-extrabold text-indigo-900 mb-10 select-none">
       💳 Payment & Subscription
      </h2>

      </div>

      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-8 space-y-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Monthly Plan */}
          <div className="flex-1 bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-4">Plan Details</h3>
            <p className="text-4xl font-bold text-indigo-900 mb-4">
              ₹85<span className="text-lg font-medium">/mo</span>
            </p>
            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li>✅ Free Practise Test</li>
              <li>✅ No installation fee</li>
              <li>✅ No maintenance fee</li>
              <li>✅ No update fees</li>
            </ul>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow hover:bg-indigo-700 transition">
              Update Plan
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="flex-1 bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-2">Yearly Subscription</h3>
            <p className="text-sm text-gray-600">Expiry Date: <span className="font-medium">28 March 2020</span></p>
            <div className="mt-6 flex items-center justify-between text-sm text-gray-700">
              <span>Payment Amount</span>
              <span className="font-bold text-indigo-800">₹14,400.00 + VAT</span>
            </div>
          </div>
        </div>

        {/* Payment & Invoices Section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Card Details */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-indigo-800">Card Details</h3>
              <a href="#" className="text-sm text-blue-600 font-medium hover:underline">Edit</a>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">💳</span>
              <div>
                <p className="text-gray-800 font-medium tracking-wider">•••• •••• •••• 3456</p>
                <p className="text-xs text-gray-500">MasterCard - Expires 05/21</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Billed on the first of every month.</p>
            <p className="text-sm text-gray-600">Next billing on <strong>July 01, 2019</strong>.</p>
          </div>

          {/* Invoices */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-indigo-800">Invoices</h3>
              <a href="#" className="text-sm text-blue-600 font-medium hover:underline">View all</a>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              {[
                { date: "March 01, 2019", amount: "₹156.00" },
                { date: "February 01, 2019", amount: "₹156.00" },
                { date: "January 01, 2019", amount: "₹156.00" },
                { date: "December 01, 2018", amount: "₹156.00" },
              ].map((invoice, idx) => (
                <li key={idx} className="flex justify-between items-center bg-indigo-50 rounded px-4 py-2">
                  <span>{invoice.date}</span>
                  <span className="font-semibold">{invoice.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
