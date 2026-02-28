import { FileUp, UserPlus, Users, ArrowRight } from "lucide-react";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface UserTypeOption {
  title: string;
  description: string;
  icon: ReactNode;
  link: string;
}

const UserOptions: UserTypeOption[] = [
  {
    title: "Add Single Student",
    description: "Manually fill out a form to register a single student profile.",
    icon: <UserPlus className="w-8 h-8" />,
    link: "/admin/users/add/single",
  },
  {
    title: "Multiple Students",
    description: "Add multiple students sequentially in a guided flow.",
    icon: <Users className="w-8 h-8" />,
    link: "/admin/users/add/many",
  },
  {
    title: "Bulk Upload (Excel)",
    description: "Import a large batch of students using an Excel/CSV file.",
    icon: <FileUp className="w-8 h-8" />,
    link: "/admin/users/add/insert",
  },
];

export default function AddUserType() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-gray-50/50">
      {/* Header Section */}
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-3xl font-bold text-[#245cab]">
          Select Registration Method
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Choose the most convenient way to add new students to the system.
        </p>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {UserOptions.map((option, idx) => (
          <Link
            key={idx}
            to={option.link}
            className="group relative flex flex-col items-center text-center p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-[#245cab]/30 hover:-translate-y-1 transition-all duration-300"
          >
            {/* Icon Circle */}
            <div className="mb-6 p-4 rounded-full bg-blue-50 text-[#245cab] group-hover:bg-[#245cab] group-hover:text-white transition-colors duration-300">
              {option.icon}
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#245cab] transition-colors">
              {option.title}
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {option.description}
            </p>

            {/* Action Text */}
            <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-[#245cab] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              Get Started <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}