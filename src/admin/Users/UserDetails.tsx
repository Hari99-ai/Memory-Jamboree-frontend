import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getUserDetails, getDisciplines } from "../../lib/api";
import { FaUser, FaPhone, FaEnvelope, FaBirthdayCake, FaMapMarkerAlt, FaSchool } from "react-icons/fa";
import { ImgUrl } from '../../lib/client';
import { useNavigate } from "react-router-dom";
import { Pencil, ArrowLeft } from "lucide-react";
import { defaultImg } from "../../lib/select";



interface UserEventDiscipline {
  disc_id: number;
  finalscore: string;
}

// interface UserEventItem {

// }

export interface UserEventsResponse {
  cat_rank: number;
  category_name: string;
  classes: string;
  disciplines: UserEventDiscipline[];
  event_id: number;
  event_name: string;
  event_rank: number;
  fname: string;
  lname: string;
  overall_score: number;
}

interface User {
  image?: string;
  fname: string;
  lname: string;
  role: string;
  gender: string;
  email: string;
  mobile: string;
  birth_date: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  school_name: string;
  school_class: string;
  fa_name: string;
  fa_mobile: string;
  fa_email: string;
  mo_name: string;
  mo_mobile: string;
  mo_email: string;
}

interface UserDetailsResponse {
  user: User;
  events: UserEventsResponse[];
}

export default function UserDetails() {
  const params = useParams<{ id: string }>();
  const user_id = params.id;
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<UserDetailsResponse>({
    queryKey: ['user-details', user_id],
    queryFn: () => getUserDetails(String(user_id)),
    enabled: !!user_id,
  });

  const { data: disciplines, isLoading: isLoadingDisciplines } = useQuery({
    queryKey: ['disciplines'],
    queryFn: getDisciplines,
    retry: 1,
  });

  // const { data: userEvent, isLoading: isLoadingEvents } = useQuery<UserEventsResponse[]>({
  //   queryKey: ['user-events', user_id],
  //   queryFn: () => getcertificates(Number(user_id)),
  //   enabled: !!user_id,
  //   retry: 1,
  // });

  const useEvent = data?.events || [];
  const user = data?.user || {};



  console.log("user - ", user);
  console.log("disciplines - ", disciplines);
  console.log("userEvents - ", useEvent);



  // Helper function to get discipline score for a specific event and discipline
  const getDisciplineScore = (eventItem: UserEventsResponse, discId: number): string => {
    const disciplineData = eventItem.disciplines?.find(d => d.disc_id === discId);
    return disciplineData ? parseFloat(disciplineData.finalscore).toFixed(2) : "-";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading user details...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error fetching user details</div>
      </div>
    );
  }

  const {
    image,
    fname,
    lname,
    role,
    gender,
    email,
    mobile,
    birth_date,
    address,
    city,
    state,
    country,
    pincode,
    school_name,
    school_class,
    fa_name,
    fa_mobile,
    fa_email,
    mo_name,
    mo_mobile,
    mo_email,
  } = data?.user || {};

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  const handleBackClick = (): void => {
    navigate("/admin/users/view");
  };

  const handleEditClick = (): void => {
    navigate(`/admin/user/update/${user_id}`);
  };

  return (
    <div>
      <div className="p-6 mx-auto mt-8 rounded-lg shadow-lg max-w-7xl bg-gradient-to-br from-white to-gray-100">
        <button
          className="flex items-center gap-2 px-4 py-2 mb-4 text-blue-500 transition-colors duration-200 rounded-md hover:text-blue-700"
          onClick={handleBackClick}
        >
          <ArrowLeft size={16} />
          <span className="hover:underline">Back</span>
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <img
              src={image ? `${ImgUrl}/${image}` : defaultImg}
              alt={`${fname} ${lname}`}
              className="object-cover border-4 border-blue-500 rounded-full shadow-md w-28 h-28"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{fname} {lname}</h1>
              <span className="inline-block px-3 py-1 mt-2 text-sm text-blue-700 bg-blue-100 rounded-full">{role}</span>
            </div>
          </div>
          <button
            onClick={handleEditClick}
            className="px-4 py-2 mt-4"
          >
            <Pencil className="w-6 h-6 text-blue-600" />
          </button>
        </div>

        <div className="grid gap-6 mt-8 text-sm md:grid-cols-2">
          {/* Personal Info */}
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">Personal Info</h2>
            <div className="space-y-2 text-black">
              <p><FaUser className="inline mr-2 text-blue-500" />Gender: {gender}</p>
              <p><FaEnvelope className="inline mr-2 text-green-500" />Email: {email}</p>
              <p><FaPhone className="inline mr-2 text-purple-500" />Mobile: {mobile}</p>
              <p><FaBirthdayCake className="inline mr-2 text-pink-500" />Birth Date: {formatDate(birth_date!)}</p>
            </div>
          </div>

          {/* Address Info */}
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">Address Info</h2>
            <div className="space-y-2 text-black">
              <p><FaMapMarkerAlt className="inline mr-2 text-red-500" />{address}</p>
              <p>City: {city}</p>
              <p>State: {state}</p>
              <p>Country: {country}</p>
              <p>Pincode: {pincode}</p>
            </div>
          </div>

          {/* School Info */}
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">School Info</h2>
            <div className="space-y-2 text-black">
              <p><FaSchool className="inline mr-2 text-indigo-500" />School: {school_name}</p>
              <p>Class: {school_class}</p>
            </div>
          </div>

          {/* Family Info */}
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">Family Info</h2>
            <div className="space-y-2 text-black">
              <p><strong>Father:</strong> {fa_name} ({fa_mobile}, {fa_email})</p>
              <p><strong>Mother:</strong> {mo_name} ({mo_mobile}, {mo_email})</p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="p-6 mx-auto mt-8 rounded-lg shadow-lg max-w-7xl bg-gradient-to-br from-white to-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className='text-xl font-bold text-black'>Participated Events</h4>
          {isLoading && (
            <span className="text-sm text-blue-500 animate-pulse">
              Loading events...
            </span>
          )}
          {isLoadingDisciplines && (
            <span className="text-sm text-blue-500 animate-pulse">
              Loading disciplines...
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto min-w-max">
            <thead>
              <tr className="text-indigo-900 bg-indigo-200">
                <th className="px-3 py-2 text-xs text-left border border-indigo-300">Event</th>
                <th className="px-3 py-2 text-xs text-left border border-indigo-300">Category</th>
                <th className="px-3 py-2 text-xs text-left border border-indigo-300">Overall Score</th>
                <th className="px-3 py-2 text-xs text-left border border-indigo-300">Event Rank</th>
                <th className="px-3 py-2 text-xs text-left border border-indigo-300">Category Rank</th>
                {disciplines?.map((discipline) => (
                  <th
                    key={discipline.disc_id}
                    className="border border-indigo-300 px-2 py-2 text-center text-xs max-w-[90px]"
                    title={discipline.discipline_name}
                  >
                    {discipline.discipline_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {useEvent?.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-indigo-50"}
                >
                  <td className="px-3 py-2 text-xs border border-indigo-200">{item.event_name}</td>
                  <td className="px-3 py-2 text-xs border border-indigo-200">{item.category_name}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-green-600 border border-indigo-200">
                    {parseFloat(String(item.overall_score)).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold text-yellow-600 border border-indigo-200">
                    {item.event_rank}
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold text-blue-600 border border-indigo-200">
                    {item.cat_rank}
                  </td>
                  {disciplines?.map((discipline) => (
                    <td
                      key={discipline.disc_id}
                      className="px-2 py-2 text-xs text-center border border-indigo-200 "
                    >
                      <span className={getDisciplineScore(item, discipline.disc_id!) !== "-" ? "text-green-600 font-semibold" : "text-gray-400"}>
                        {getDisciplineScore(item, discipline.disc_id!)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              {useEvent.length === 0 && (
                <tr>
                  <td colSpan={5} className="flex items-center px-4 py-5 text-center text-gray-500">
                    No events found for this user.
                  </td>

                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div >
  );
}