import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { message_form } from "../../lib/api";

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    userType: "",
  });

  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationKey: ["message_form"],
    mutationFn: message_form,
    onSuccess: () => {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      
    },
    onError: (err) => {
      console.error("Mutation error:", err);
      setIsSubmitted(false);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    mutate(formData); // ✅ Pass formData to mutation function
  };

  return (
    <section className="w-full bg-secondary-base py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2
          className="text-4xl md:text-5xl font-bold text-center mb-12"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--primary-1)",
          }}
        >
          Contact Us
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left Section: Form */}
          <div className="md:w-1/2 w-full">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm mb-2"
                  style={{
                    fontFamily: "var(--font-main)",
                    color: "var(--text-1)",
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-1"
                  style={{
                    fontFamily: "var(--font-main)",
                    backgroundColor: "var(--base)",
                  }}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm mb-2"
                  style={{
                    fontFamily: "var(--font-main)",
                    color: "var(--text-1)",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-1"
                  style={{
                    fontFamily: "var(--font-main)",
                    backgroundColor: "var(--base)",
                  }}
                  required
                />
              </div>

              {/* User Type Dropdown */}
              <div>
                <label
                  htmlFor="userType"
                  className="block text-sm mb-2"
                  style={{
                    fontFamily: "var(--font-main)",
                    color: "var(--text-1)",
                  }}
                >
                  You Are?
                </label>
                <select
                  id="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-1 text-gray-400"
                  style={{
                    fontFamily: "var(--font-main)",
                    backgroundColor: "var(--base)",
                  }}
                  required
                >
                  <option value="" disabled hidden>
                    Select an option
                  </option>
                  <option value="Student" className="text-black">
                    Student
                  </option>
                  <option value="Parent" className="text-black">
                    Parent
                  </option>
                  <option value="Professional" className="text-black">
                    Professional
                  </option>
                  <option value="School" className="text-black">
                    School
                  </option>
                  <option value="Corporate" className="text-black">
                    Corporate
                  </option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm mb-2"
                  style={{
                    fontFamily: "var(--font-main)",
                    color: "var(--text-1)",
                  }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter your message"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-1"
                  style={{
                    fontFamily: "var(--font-main)",
                    backgroundColor: "var(--base)",
                  }}
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg text-white font-bold transition-all duration-300 hover:bg-primary-2 hover:scale-105"
                style={{
                  backgroundColor: "var(--primary-1)",
                  fontFamily: "var(--font-main)",
                }}
              >
                {isPending ? "Messages..." : "Send Message"}
              </button>
            </form>
            {isSuccess && isSubmitted && <p className="text-green-500">Message sent!</p>}
            {isError && <p className="text-red-500">Something went wrong!</p>}
          </div>

          {/* Right Section: Image */}
          <div className="md:w-1/2 w-full h-[50vh] md:h-full flex items-center justify-center">
            <img
              src="https://img.freepik.com/premium-photo/contact-us-hand-businessman-holding-mobile-smartphone-with-icon-cutomer-support_52701-303.jpg?semt=ais_hybrid&w=740"
              alt="Contact Us"
              className="w-full h-full object-cover rounded-lg shadow-lg opacity-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
