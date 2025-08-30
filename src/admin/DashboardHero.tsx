/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  live_registration,
  top_performer,
  admin_dashboard_data,
} from "../lib/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Clock, ArrowRightCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImgUrl } from "../lib/client";
import { EventData } from "../types";

const AdminPage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: dash_data, isLoading: dash_loading } = useQuery({
    queryKey: ["admin-dashboard-data"],
    queryFn: admin_dashboard_data,
  });

  const topCities = dash_data?.top_cities || [];
  const upcomingEvents = dash_data?.upcoming_events || [];

  const { data: liveData, isLoading: isLoadingLive } = useQuery({
    queryKey: ["live-registrations"],
    queryFn: live_registration,
    refetchInterval: 50000,
  });

  const { data: topPerformers, isLoading: performerLoading } = useQuery({
    queryKey: ["top-performers"],
    queryFn: top_performer,
  });

  useEffect(() => {
    if (!upcomingEvents || upcomingEvents.length === 0) return;

    const maxIndex = Math.max(0, upcomingEvents.length - 2);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [upcomingEvents]);

  useEffect(() => {
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");

    if (!prevBtn || !nextBtn) return;

    const handlePrev = () => {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = () => {
      const maxIndex = Math.max(0, upcomingEvents.length - 2);
      setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    };

    prevBtn.addEventListener("click", handlePrev);
    nextBtn.addEventListener("click", handleNext);

    return () => {
      prevBtn.removeEventListener("click", handlePrev);
      nextBtn.removeEventListener("click", handleNext);
    };
  }, [upcomingEvents]);

  return (
    <div className="relative w-full min-h-screen px-4 py-0 space-y-6 overflow-hidden sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <circle cx="25" cy="25" r="1.5" fill="#cbd5e1" />
          <circle cx="75" cy="75" r="1.5" fill="#cbd5e1" />
          <circle cx="25" cy="75" r="1.5" fill="#cbd5e1" />
          <circle cx="75" cy="25" r="1.5" fill="#cbd5e1" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative w-full px-2 sm:px-4">
        <h1 className="text-lg sm:text-xl font-semibold leading-tight text-[#245cab]">
          Welcome👋 to <span className="text-[#FF8B00]">Admin</span>
        </h1>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-[#245cab]">
          Dashboard
        </h1>
      </div>

      {/* Upcoming Events Section */}
      <div className="relative z-10">
        <div className="p-4 bg-white shadow sm:p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#245cab]">
              Upcoming Events
            </h2>
          </div>

          {dash_loading ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="flex items-center justify-center gap-1"> {/* Added gap-1 instead of default spacing */}
              {upcomingEvents.length > 1 && (
                <button
                  id="prev-btn"
                  className="flex-shrink-0 p-2 transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="sm:w-9 sm:h-9"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
              )}

              <div className="flex items-center justify-center flex-1 pb-4 overflow-hidden">
                <div className={`w-full max-w-4xl overflow-hidden ${upcomingEvents.length === 1 ? 'flex items-center justify-center' : ''
                  }`}>
                  <div
                    className={`flex transition-transform duration-500 ease-in-out ${upcomingEvents.length === 1 ? 'justify-center w-full' : ''
                      }`}
                    style={{
                      transform: upcomingEvents.length > 1
                        ? `translateX(-${currentIndex * (100 / Math.min(2, upcomingEvents.length))}%)`
                        : 'none'
                    }}
                  >
                    {upcomingEvents.map((event: EventData, idx: any) => (
                      <div
                        key={idx}
                        className={`flex-shrink-0 px-2 ${upcomingEvents.length === 1
                          ? 'w-[80%] sm:w-[70%] md:w-[60%] lg:w-[50%]' // Custom explicit widths for single event
                          : 'w-full sm:w-1/2'
                          } sm:px-4 mx-auto`}
                      >
                        <div className="relative h-48 overflow-hidden rounded-lg shadow-md sm:h-64 hover:shadow-lg group">
                          <img
                            src={`https://aidev.gravitinfosystems.com:5000/uploads/events/${event.eimage}`}
                            alt={event.ename}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              console.error('Image failed to load:', e.currentTarget.src);
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/50 to-black/80"></div>
                          <div className="absolute inset-0 flex flex-col justify-between p-4">
                            <div>
                              <h3 className="mb-1 text-sm font-semibold text-white truncate sm:text-lg">
                                {event.ename}
                              </h3>
                              <div className="flex items-center mb-2 text-xs text-gray-200">
                                <Clock size={14} className="mr-1" />
                                <span>
                                  {new Date(event.event_start).toLocaleDateString(
                                    "en-US",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-1 text-xs text-white rounded-full bg-green-500/80">
                                Active
                              </span>
                              <button
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                                  bg-white/90 text-[#245cab] px-2 sm:px-3 py-1 rounded-full text-xs font-medium 
                                  flex items-center gap-1 hover:bg-white"
                                onClick={() =>
                                  navigate(`/admin/event/${event.event_id}`)
                                }
                              >
                                View Details <ArrowRightCircle size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Only show next button if multiple events */}
              {upcomingEvents.length > 1 && (
                <button
                  id="next-btn"
                  className="flex-shrink-0 p-2 transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="sm:w-9 sm:h-9"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">
              No upcoming events available
            </div>
          )}
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="flex flex-col w-full gap-6 p-4 bg-white shadow sm:p-6 rounded-xl">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 text-[#245cab]">
            Top Performers
          </h2>
        </div>
        {performerLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : topPerformers?.top_participants && topPerformers.top_participants.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[500px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      Student
                    </th>
                    <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      Category
                    </th>
                    <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      Event
                    </th>
                    <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      Score
                    </th>
                    <th className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase sm:px-6">
                      Rank
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topPerformers.top_participants.map((performer: any, idx: any) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10">
                            {performer.image ? (
                              <img
                                className="w-8 h-8 rounded-full sm:w-10 sm:h-10"
                                src={`${ImgUrl}/${performer.image}`}
                                alt=""
                              />
                            ) : (
                              <div className="flex items-center justify-center w-8 h-8 text-xs font-medium text-blue-600 bg-blue-100 rounded-full sm:w-10 sm:h-10 sm:text-sm">
                                {performer.fname?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-2 sm:ml-4">
                            <div className="text-xs font-medium text-gray-900 sm:text-sm">
                              {performer.fname} {performer.lname}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-[150px]">
                              {performer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                        <div className="inline-flex text-xs font-semibold leading-5 text-blue-800">
                          Category {performer.category_name ? performer.category_name : "N/A"}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-xs text-gray-500 sm:px-6 sm:text-sm whitespace-nowrap">
                        {performer.event_name}
                      </td>
                      <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                          {parseFloat(performer.score).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold leading-5 rounded-full">
                          {idx + 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-gray-500 h-60">
            No top performers available
          </div>
        )}
      </div>

      {/* Bottom Grid Section */}
      <div className="relative z-10 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Live Registrations */}
        <div className="flex flex-col gap-6 p-4 bg-white shadow sm:p-6 rounded-xl">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-[#245cab]">
              Live Registrations
            </h2>
          </div>

          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[400px]">
              {isLoadingLive ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : liveData?.live && liveData.live.length > 0 ? (
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="font-semibold text-gray-700 border-b">
                      <th className="px-3 py-3 text-left">User</th>
                      <th className="px-3 py-3 text-left">Event</th>
                      <th className="px-3 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveData.live.map((reg: any, idx: any) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {reg.image ? (
                              <div className="w-6 h-6 overflow-hidden bg-gray-200 rounded-full sm:w-8 sm:h-8">
                                <img
                                  src={`${ImgUrl}/${reg.image}`}
                                  alt={reg.fname}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-6 h-6 text-xs font-medium text-blue-600 bg-blue-100 rounded-full sm:w-8 sm:h-8">
                                {reg.fname?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="text-xs font-medium sm:text-sm">
                                {reg.fname} {reg.lname}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                {reg.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs sm:text-sm">{reg.event_name}</td>
                        <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {reg.created_at}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-10 text-center text-gray-500">
                  No live registrations available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top 5 Cities */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow max-h-[550px] flex flex-col gap-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-[#245cab]">
              Top 5 Cities
            </h2>
          </div>
          {dash_loading ? (
            <div className="flex items-center justify-center h-60">
              <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : topCities && topCities.length > 0 ? (
            <div className="h-72 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topCities.map((city: any) => ({
                    name: city.city,
                    value: city.participant_count,
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `${value} participants`,
                      "Participants",
                    ]}
                  />
                  <Bar dataKey="value" fill="#FF8B00" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-500 h-60">
              No city data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;