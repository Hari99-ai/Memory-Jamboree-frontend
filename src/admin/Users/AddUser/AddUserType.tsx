import { FileUp, UserPlus, Users } from "lucide-react";
import { ReactNode } from "react";
import { Link, 
  // Outlet
} from "react-router-dom"; 

interface UserTypeProps {
  title: string;
  icon: ReactNode;
  link: string;
}

const UserType: UserTypeProps[] = [
  {
    title: "Add Single User",
    icon: <UserPlus />,
    link: "/admin/users/add/single",
  },
  {
    title: "Multiple Users",
    icon: <Users />,
    link: "/admin/users/add/many",
  },
  {
    title: "Add User By Excel File",
    icon: <FileUp />,
    link: "/admin/users/add/insert",
  },
];

export default function AddUserType() {
  return (
    <div className="flex flex-col items-center w-full p-4 space-y-6">
      <h2 className="text-xl font-bold">Choose Your User Type</h2>

      <div className="w-full max-w-md space-y-4">
        {UserType.map((ele, idx) => (
          <Link
            key={idx}
            to={ele.link}
            className="flex justify-between items-center px-6 py-4 bg-blue-100 border rounded-md hover:bg-blue-200 transition"
          >
            <p className="text-black font-medium">{ele.title}</p>
            <div className="text-blue-600">{ele.icon}</div>
          </Link>
        ))}
      </div>
      {/* <Outlet/> */}
    </div>
  );
}
