import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { DataTable } from "./DataTable";
import { columns } from "./column";
import { getUsers } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import Loader2 from "../../components/Loader2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"; // Added Card component imports for modern UI

// Utility to convert Indian state codes to full names
const stateCodeToName: { [key: string]: string } = {
  AP: "Andhra Pradesh",
  AR: "Arunachal Pradesh",
  AS: "Assam",
  BR: "Bihar",
  CT: "Chhattisgarh",
  GA: "Goa",
  GJ: "Gujarat",
  HR: "Haryana",
  HP: "Himachal Pradesh",
  JH: "Jharkhand",
  KA: "Karnataka",
  KL: "Kerala",
  MP: "Madhya Pradesh",
  MH: "Maharashtra",
  MN: "Manipur",
  ML: "Meghalaya",
  MZ: "Mizoram",
  NL: "Nagaland",
  OR: "Odisha",
  PB: "Punjab",
  RJ: "Rajasthan",
  SK: "Sikkim",
  TN: "Tamil Nadu",
  TG: "Telangana",
  TR: "Tripura",
  UP: "Uttar Pradesh",
  UK: "Uttarakhand",
  WB: "West Bengal",
  AN: "Andaman and Nicobar Islands",
  CH: "Chandigarh",
  DN: "Dadra and Nagar Haveli and Daman and Diu",
  DL: "Delhi",
  JK: "Jammu and Kashmir",
  LA: "Ladakh",
  LD: "Lakshadweep",
  PY: "Puducherry",
};

const getFullStateName = (code: string) => stateCodeToName[code] || code;

export default function Users() {
  const navigate = useNavigate();
  
  const {
    data: users,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch,
  } = useQuery({
    queryKey: ["users-list"],
    queryFn: getUsers,
  });

  const processedUsers = useMemo(() => {
    if (!users) return [];
    
    const enriched = users.map((user: any) => {
      return {
        ...user,
        id: user.id,
        fname: user.fname,
        lname: user.lname || "",
        email: user.email,
        mobile: user.mobile,
        school_name: user.school_name,
        school_class: user.school_class,
        city: user.city,
        state: user.state ? getFullStateName(user.state) : "N/A",
      };
    });

    // MODIFICATION: Implemented natural sort for names with numbers
    return enriched.slice().sort((a: any, b: any) => {
      const nameA = `${a.fname} ${a.lname}`.trim().toLowerCase();
      const nameB = `${b.fname} ${b.lname}`.trim().toLowerCase();
      // Use numeric: true for natural sorting (handles "user10" vs "user2")
      return nameA.localeCompare(nameB, undefined, { numeric: true });
    });
  }, [users]);

  const isLoading = isLoadingUsers;
  const error = usersError;

  // MODIFICATION: Enhanced loading state UI
  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 />
          <p className="mt-2 text-lg text-gray-600">Loading users...</p>
        </div>
      </div>
    );

  // MODIFICATION: Enhanced error state UI
  if (error)
    return (
      <div className="flex h-screen items-center justify-center bg-red-50 p-4">
        <div className="rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
          <h3 className="text-2xl font-semibold text-red-600">
            Failed to Load Users
          </h3>
          <p className="mt-2 text-red-500">{(error as Error).message}</p>
        </div>
      </div>
    );

  // MODIFICATION: Overhauled the main return with a modern Card-based layout
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Manage Users</CardTitle>
          <CardDescription>
            A list of all registered users in the system. You can search,
            filter, and manage user details from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns(refetch, navigate)}
            data={processedUsers}
            isLoading={isLoading}
            refetchUsers={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
}