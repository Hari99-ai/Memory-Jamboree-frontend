import { NavLink, Outlet } from "react-router-dom"


export default function ViewSettings() {
  return (
    <div className="flex flex-col space-y-4">
        <h2>Settings</h2>
        <div className="flex gap-x-4 border bg-white py-4 px-3 rounded-md">
            <NavLink to={'/admin-dashboard/stepper/subscription'} className="p-4 border-none shadow rounded-md bg-slate-200">Payment & Subscription</NavLink>
            <NavLink to={'/admin-dashboard/stepper/masters'} className="p-4 border-none shadow rounded-md bg-slate-200">Masters</NavLink>
        </div>
        <Outlet/>
    </div>
  )
}