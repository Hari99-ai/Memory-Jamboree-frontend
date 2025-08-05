import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DeleteUsersEvent, getParticipatedUsers, getUsers, updateEventUsers } from "../../../lib/api"
import Loader2 from "../../../components/Loader2"
import { Button } from "../../../components/ui/button"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
// import { useRouter } from "../../../hooks/useRouter"
// import { FaArrowLeftLong } from "react-icons/fa6"
import { eventusercolumns } from "../eventusercolumns"
import { DataTable } from "./EventUsersDataTable"
import type { RegisterUserInput } from "../../../types"
// import Backbutton from "../../components/Backbutton"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
// import { API_BASE_URL } from "../../../lib/client";



export default function EventUsers() {
  const params = useParams();
  const navigate = useNavigate();
  const event_id = params.event_id;
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [monitoring, setMonitoring] = useState<Record<number, boolean>>({});

  const QueryClient = useQueryClient();


  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users-list"],
    queryFn: getUsers,
  })

  const { data: participated_users } = useQuery({
    queryKey: ["participated-users-list", event_id],
    queryFn: () => getParticipatedUsers(event_id as string),
    enabled: !!event_id,
  })

  console.log("participated_users", participated_users)

  useEffect(() => {
    if (participated_users && users) {
      console.log("Participated users data:", participated_users)

      // 🚫 Removed: selecting all users and enabling monitoring when emonitored === 1
      // ✅ Always use only participated users for initial state

      const initialUserIds: number[] = participated_users.participants?.map((user: any) => user.user_id) || []
      setSelectedUserIds(initialUserIds)

      const initialMonitoring: Record<number, boolean> = {}
      participated_users.participants?.forEach((user: any) => {
        initialMonitoring[user.user_id] = Boolean(user.monitoring)
      })
      setMonitoring(initialMonitoring)
    }
  }, [participated_users, users])


  const { mutate, isPending: isDeleting } = useMutation({
    mutationKey: ["delete-users"],
    mutationFn: DeleteUsersEvent,
    onSuccess: () => {
      QueryClient.invalidateQueries({ queryKey: ["participated-users-list", event_id] })
      QueryClient.invalidateQueries({ queryKey: ["users-list"] })
      setSuccessMessage(`Successfully deleted ${selectedUserIds.length} users to the event!`)
      setErrorMessage("")
      setSelectedUserIds([])
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to delete users to event"
      setErrorMessage(errorMsg)
      setSuccessMessage("")
      console.error("Error deleting users:", err)
    },
  })


  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationKey: ['update-event-users'],
    mutationFn: updateEventUsers,
    onSuccess: () => {
      QueryClient.invalidateQueries({ queryKey: ["participated-users-list", event_id] })
      QueryClient.invalidateQueries({ queryKey: ["users-list"] })
      setSuccessMessage(`Successfully Updated ${selectedUserIds.length} users to the event!`)
      setErrorMessage("")
      setSelectedUserIds([])
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.msg || err?.msg || "Failed to update users to event"
      setErrorMessage(errorMsg)
      setSuccessMessage("")
      console.error("Error deleting users:", err)
    },
  })

  if (!event_id) return <div className="text-red-500">Invalid event ID</div>

  const handleSelectionChange = (id: number, checked: boolean) => {
    setSelectedUserIds((prev) => (checked ? [...prev, id] : prev.filter((uid) => uid !== id)))

    if (checked) {
      // When selecting a user, automatically enable monitoring
      setMonitoring((prev) => ({
        ...prev,
        [id]: true, // ✅ Changed: automatically set to true when selected
      }))
    } else {
      // When unselecting a user, remove their monitoring state
      setMonitoring((prev) => {
        const newMonitoring = { ...prev }
        delete newMonitoring[id]
        return newMonitoring
      })
    }

    setSuccessMessage("")
    setErrorMessage("")
  }
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timeout = setTimeout(() => {
        setSuccessMessage("")
        setErrorMessage("")
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [successMessage, errorMessage])
  const handleSelectAll = (checked: boolean, currentPageUsers: RegisterUserInput[] = []) => {
    console.log("handleSelectAll called:", { checked, currentPageUsersCount: currentPageUsers.length }) // Debug log

    if (checked) {
      // Select only users on current page
      const currentPageUserIds = currentPageUsers.map((user: RegisterUserInput) => user.id)
      console.log("Selecting current page user IDs:", currentPageUserIds) // Debug log

      setSelectedUserIds((prev) => {
        // Add current page users to existing selection
        const newSelection = [...prev]
        currentPageUserIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id)
          }
        })
        console.log("New selection after adding current page:", newSelection) // Debug log
        return newSelection
      })

      // Set monitoring to true for current page users
      const newMonitoring: Record<number, boolean> = { ...monitoring }
      currentPageUserIds.forEach((id) => {
        newMonitoring[id] = true
      })
      setMonitoring(newMonitoring)
    } else {
      // Unselect only current page users
      const currentPageUserIds = currentPageUsers.map((user: RegisterUserInput) => user.id)
      console.log("Unselecting current page user IDs:", currentPageUserIds) // Debug log

      setSelectedUserIds((prev) => {
        const newSelection = prev.filter(id => !currentPageUserIds.includes(id))
        console.log("New selection after removing current page:", newSelection) // Debug log
        return newSelection
      })

      // Remove monitoring for current page users
      const newMonitoring: Record<number, boolean> = { ...monitoring }
      currentPageUserIds.forEach((id) => {
        delete newMonitoring[id]
      })
      setMonitoring(newMonitoring)
    }
  }

  const handleMonitoringToggle = (id: number, monitored: boolean) => {
    if (!selectedUserIds.includes(id)) {
      console.warn(`User ${id} is not selected for monitoring.`)
      return
    }
    setMonitoring((prev) => ({
      ...prev,
      [id]: monitored,
    }))
  }

  const handleMonitoringSelectAll = (checked: boolean) => {
    // Apply monitoring state to all selected users
    const newMonitoring: Record<number, boolean> = { ...monitoring }
    selectedUserIds.forEach((id) => {
      newMonitoring[id] = checked
    })
    setMonitoring(newMonitoring)
  }

  const handleUpdate = () => {
    if (!event_id || selectedUserIds.length === 0) {
      setErrorMessage("Please select users and make sure event ID is valid.")
      return
    }
    updateUser({
      event_id,
      user_id: selectedUserIds,
      monitoring: monitoring,
    })
  }

  const handleSubmit = () => {
    if (!event_id || selectedUserIds.length === 0) {
      setErrorMessage("Please select users and make sure event ID is valid.")
      return
    }

    mutate({
      event_id,
      user_id: selectedUserIds,
      monitoring: monitoring,
    })
  }

  if (isLoading) return <Loader2 />
  if (error) return <div className="text-red-500">Error loading users: {error.message || "Unknown error"}</div>


  return (
    <div className="container flex flex-col min-h-screen px-4 mx-auto">
      <div className="bg-white border-b border-gray-200 rounded-lg shadow-sm">
        <div className="container px-6 py-6 mx-auto">
          {/* Back Button with proper spacing */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className={`
        flex items-center gap-2 px-4 py-2
        text-white text-sm font-medium
        bg-blue-600 hover:bg-blue-700
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-300  rounded-full
      `}
              type="button"
            >
              <ArrowLeft size={16} />
              <span>Back to Event Details</span>
            </button>          </div>

          {/* Title and Status */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Event Users Management</h1>
            {selectedUserIds.length > 0 && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="px-3 py-1 font-medium text-blue-800 bg-blue-100 rounded-full">
                  {selectedUserIds.length} user(s) selected
                </span>
                <span className="px-3 py-1 font-medium text-green-800 bg-green-100 rounded-full">
                  {Object.values(monitoring).filter(Boolean).length} monitored
                </span>
              </div>
            )}
          </div>

          {/* Alert Messages */}
          {successMessage && (
            <div className="p-3 mb-4 text-green-700 bg-green-100 border-l-4 border-green-500 rounded-r">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 mb-4 text-red-700 bg-red-100 border-l-4 border-red-500 rounded-r">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">


            <Button
              onClick={handleUpdate}
              disabled={isUpdating || selectedUserIds.length === 0}
              variant="outline"
              className="px-6 py-2 font-medium text-white transition-colors bg-green-500 rounded-lg hover:bg-green-800"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </div>
              ) : (
                `Update ${selectedUserIds.length} Users`
              )}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isDeleting || selectedUserIds.length === 0}
              className="px-6 py-2 font-medium text-white transition-colors bg-red-400 rounded-lg hover:bg-red-700"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </div>
              ) : (
                `Delete ${selectedUserIds.length} Users`
              )}
            </Button>
            {selectedUserIds.length === 0 && (
              <p className="text-sm italic text-gray-500">
                Select users to enable actions
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <DataTable<RegisterUserInput, unknown>
          columns={eventusercolumns(
            handleSelectionChange,
            handleMonitoringToggle,
            monitoring,
            selectedUserIds,
            handleSelectAll,
            handleMonitoringSelectAll,
            // users || [],
          )}
          data={users ?? []}
          isLoading={isLoading}
          // onUpdate={handleUpdate}
        />
      </div>

      {/* <div className="sticky bottom-0 flex items-center gap-4 py-4 bg-white border-t border-gray-200">
        <Button onClick={handleSubmit} disabled={isDeleting || selectedUserIds.length === 0}>
          {isDeleting ? "Deleting..." : `Delete ${selectedUserIds.length} Users`}
        </Button>

        <Button
          onClick={handleUpdate}
          disabled={isUpdating || selectedUserIds.length === 0}
          variant="outline"
        >
          {isUpdating ? "Updating..." : `Update ${selectedUserIds.length} Users`}
        </Button>

        {selectedUserIds.length > 0 && (
          <span className="text-sm text-gray-600">
            {selectedUserIds.length} user(s) selected, {Object.values(monitoring).filter(Boolean).length} monitored
          </span>
        )}
      </div> */}
    </div>
  )

}