

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { DataTable } from "./DataTable"
import { columns } from "./column"
import { getUsers } from "../../lib/api"
import { useNavigate } from "react-router-dom"
import Loader2 from "../../components/Loader2"

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
}

const getFullStateName = (code: string) => stateCodeToName[code] || code

export default function Users() {
  const navigate = useNavigate()

  const {
    data: users,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch,
  } = useQuery({
    queryKey: ["users-list"],
    queryFn: getUsers,
  })

  const processedUsers = useMemo(() => {
    if (!users) return []

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
      }
    })

    return enriched.slice().sort((a: any, b: any) => {
      const nameA = `${a.fname} ${a.lname}`.trim().toLowerCase()
      const nameB = `${b.fname} ${b.lname}`.trim().toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [users]) // Removed schoolMap dependency since API now provides all data

  const isLoading = isLoadingUsers
  const error = usersError

  if (isLoading)
    return (
      <div>
        <Loader2 />
      </div>
    )
  if (error) return <div>Error loading data: {(error as Error).message}</div>

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl text-center text-[#245cab] mb-4">View users</h2>
      <DataTable
        columns={columns(refetch, navigate)}
        data={processedUsers}
        isLoading={isLoading}
        refetchUsers={refetch}
      />
    </div>
  )
}
