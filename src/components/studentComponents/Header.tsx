import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { defaultImg } from "../profileDetails/ProfileView";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { getUserById } from "../../lib/api";
import { ImgUrl } from "../../lib/client";
import { useState, useEffect } from "react";
import AlertMsgBox from "../AlertMsgBox";

export default function Header() {
  // const id = sessionStorage.getItem('userId')
  const { logout } = useAuth();

  const [id, setId] = useState(() => sessionStorage.getItem("userId"));
  const [, setToken] = useState(() =>
    sessionStorage.getItem("auth_token")
  );

  useEffect(() => {
    const storedId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("auth_token");
    if (storedId || token) {
      setId(storedId);
      setToken(token);
    }
  }, []);

  const { data: user } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id!),
    refetchOnWindowFocus: false,
  });

  // Provide default values or wait for user to load
  const image = user?.image || "";
  const name = user?.fname || "";
  const email = user?.email || "";

  return (
    <header className="sticky top-0  flex h-20 items-center justify-between border-b bg-[#f1cb34] px-6 z-50">
      <div className="flex items-center">
        {/* < className="flex items-center gap-2"> */}
        <div className="flex h-20 w-auto items-center justify-center rounded-md  overflow-hidden ">
          <img
            src="/Landing/memoryChampion_2.png"
            alt="Logo"
            className="h-full w-full object-cover"
          />
        </div>
        {/* Text Section */}
        <div className="flex flex-col pt-0.5">
          <span className="text-2xl font-bold text-[#245cab]">
            Memory Jamboree
          </span>
          <span className="text-[12px] text-black underline leading-tight ml-6">
            Powered By WhiteForest Academy
          </span>
        </div>
      </div>
      
      <div className="flex items-center relative">
        <AlertMsgBox />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="User menu"
              className="flex items-center gap-2 rounded-full p-1 transition hover:bg-gray-100"
            >
              <Avatar className="h-12 w-12 rounded-full ring-1 object-cover dark:ring-gray-700 shadow-sm">
                <AvatarImage
                  src={image ? `${ImgUrl}/${image}` : defaultImg}
                  alt={name}
                  className="object-cover w-full h-full  rounded-full "
                />
                <AvatarFallback>{name ? name.charAt(0) : "U"}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <div className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-400 transition">
              <Avatar className="h-12 w-12 overflow-hidden rounded-full">
                <AvatarImage
                  src={image ? `${ImgUrl}/${image}` : defaultImg}
                  alt={name ? name.charAt(0) : "U"}
                  className="object-cover w-full h-full overflow-hidden"
                />
                <AvatarFallback>{name}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-black">
                  {name}
                </span>
                <span className="text-sm text-gray-500 dark:text-black">
                  {email}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            {[
              { label: "My Profile", to: "/profile" },
              { label: "Change Password", to: "/change-password" },
              // { label: "Support / Help", to: "/support" },
            ].map((item) => (
              <DropdownMenuItem
                key={item.to}
                className="rounded-md px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-400 focus:outline-none transition"
              >
                <Link to={item.to}>
                  <div className="w-full text-sm text-gray-700 dark:text-black">
                    {item.label}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              className="rounded-md px-3 py-2 dark:hover:bg-red-600 hover:text-white focus:outline-none transition cursor-pointer"
            >
              <span className="w-full text-sm font-medium text-red-600 dark:text-black">
                Logout
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
