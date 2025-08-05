import { ArrowLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const HelpSupport: React.FC = () => {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2">
            <div className="bg-white shadow-lg rounded-2xl p-4 w-full max-w-2xl">

                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center text-sm gap-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-100 p-2 rounded-full"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>
                {/* Header image */}
                <div className="flex justify-center">
                    <img
                        src="https://img.freepik.com/free-vector/flat-customer-support-illustration_23-2148899114.jpg?semt=ais_items_boosted&w=740"
                        alt="Help and Support"
                        className="w-50 h-32 object-contain"
                    />
                </div>
                {/* Heading */}
                <h2 className="text-2xl font-bold text-center text-[#245cab] mb-4">
                    Help & Support
                </h2>

                {/* Content */}
                <div className="space-y-5 text-gray-700 text-base">
                    <p>
                        If you're facing any issues or need assistance, we're here to help!
                        You can reach out to us through any of the following methods:
                    </p>

                    <div className="text-left space-y-3">
                        <div>
                            <h3 className="text-base font-semibold text-[#245cab]">📧 Email Support</h3>
                            <p>support@example.com</p>
                        </div>

                        <div>
                            <h3 className="text-base font-semibold text-[#245cab]">📞 Phone</h3>
                            <p>+1 234 567 890</p>
                        </div>

                        <div>
                            <h3 className="text-base font-semibold text-[#245cab]">💬 Live Chat</h3>
                            <p>Available Mon-Fri, 9am to 6pm</p>
                        </div>
                    </div>

                    {/* Feedback form */}
                    <form className="space-y-3 mt-4">
                        <div>
                            <label className="block text-base font-medium text-gray-700 mb-1">
                                Your Message
                            </label>
                            <textarea
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Describe your issue or question..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#245cab] hover:bg-[#95baed] text-white py-2 rounded-md transition"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
