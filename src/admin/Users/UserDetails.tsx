import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getUserDetails, getDisciplines } from "../../lib/api";
import { FaUser, FaPhone, FaEnvelope, FaBirthdayCake, FaMapMarkerAlt, FaSchool, FaUserGraduate, FaLayerGroup, FaMobileAlt, FaPhoneAlt, FaCity, FaGlobeAsia, FaFlag, FaLocationArrow } from "react-icons/fa";
import { ImgUrl } from '../../lib/client';
import { useNavigate } from "react-router-dom";
import { Pencil, ArrowLeft } from "lucide-react";
import { defaultImg } from "../../lib/select";

// --- Helper for full names ---
const countryMap: { [key: string]: string } = {
  "IN": "India",
  "USA": "United States of America",
  // Add other country codes as needed
};

const stateMap: { [key: string]: string } = {
  "MP": "Madhya Pradesh",
  "MH": "Maharashtra",
  "DL": "Delhi",
  "KA": "Karnataka",
  // Add other state codes as needed
};

const getFullName = (code: string, type: 'country' | 'state'): string => {
  if (type === 'country' && countryMap[code]) {
    return countryMap[code];
  }
  if (type === 'state' && stateMap[code]) {
    return stateMap[code];
  }
  return code; // Fallback to the original code if not found
};
// -----------------------------

interface UserEventDiscipline {
  disc_id: number;
  finalscore: string;
  time_taken: string;
}

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
  category_name: string;
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

  const { data: disciplines } = useQuery({
    queryKey: ['disciplines'],
    queryFn: getDisciplines,
    retry: 1,
  });

  const useEvent = data?.events || [];
  const user = data?.user || {};

  // Create a unique list of events based on event_id
  const uniqueEvents = Array.from(new Map(useEvent.map(item => [item.event_id, item])).values());

  const getDisciplineScore = (eventItem: UserEventsResponse, discId: number): string => {
    const disciplineData = eventItem.disciplines?.find(d => d.disc_id === discId);
    if (!disciplineData) {
      return "NA";
    }
    const parsedScore = parseFloat(disciplineData.finalscore);
    return isNaN(parsedScore) ? "NA" : parsedScore.toFixed(2);
  };

  const getDisciplineTime = (eventItem: UserEventsResponse, discId: number): string => {
    const disciplineData = eventItem.disciplines?.find(d => d.disc_id === discId);
    return disciplineData ? disciplineData.time_taken : "NA";
  };

  // Helper function to format overall score and handle NaN
  const formatOverallScore = (score: number | string | undefined): string => {
    if (score === undefined || score === null) return "NA";
    const parsedScore = parseFloat(String(score));
    return isNaN(parsedScore) ? "NA" : parsedScore.toFixed(2);
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
    mo_mobile,
    category_name
  } = data?.user || {};

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
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

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
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
            className="p-2 text-blue-600 rounded-full hover:bg-blue-100"
          >
            <Pencil className="w-6 h-6" />
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
              <p><FaCity className="inline mr-2 text-blue-500" />City: {city}</p>
              <p><FaGlobeAsia className="inline mr-2 text-green-600" />State Name: {getFullName(state!, 'state')}</p>
              <p><FaFlag className="inline mr-2 text-yellow-600" />Country Name: {getFullName(country!, 'country')}</p>
              <p><FaLocationArrow className="inline mr-2 text-purple-600" />Pincode: {pincode}</p>
            </div>
          </div>

          {/* School Info */}
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">School Info</h2>
            <div className="space-y-2 text-black">
              <p><FaSchool className="inline mr-2 text-indigo-500" />School: {school_name}</p>
              <p><FaUserGraduate className="inline mr-2 text-green-600" />Class: {school_class}</p>
              <p><FaLayerGroup className="inline mr-2 text-pink-600" />Category: {category_name}</p>
            </div>
          </div>

          {/* Family Info */}
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">Guardians Info</h2>
            <div className="space-y-3 text-black">
              <div>
                <p className="pl-4"><FaUser className="inline mr-2 text-blue-600" />Name: {fa_name}</p>
                <p className="pl-4"><FaMobileAlt className="inline mr-2 text-green-600" />Mobile: {fa_mobile}</p>
                <p className="pl-4"><FaEnvelope className="inline mr-2 text-red-500" />Email: {fa_email}</p>
                <p className="pl-4"><FaPhoneAlt className="inline mr-2 text-purple-500" />Alternate Mobile: {mo_mobile}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="p-6 mx-auto mt-8 rounded-lg shadow-lg max-w-7xl bg-gradient-to-br from-white to-gray-100">
        <h4 className='text-xl font-bold text-black mb-4'>Participated Events</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-auto min-w-max">
            <thead>
              <tr className="text-indigo-900 bg-indigo-200">
                <th rowSpan={2} className="px-3 py-2 text-xs text-left border-2 border-indigo-300">Event</th>
                <th rowSpan={2} className="px-3 py-2 text-xs text-left border-2 border-indigo-300">Category</th>
                <th rowSpan={2} className="px-3 py-2 text-xs text-left border-2 border-indigo-300">Overall Score</th>
                <th rowSpan={2} className="px-3 py-2 text-xs text-left border-2 border-indigo-300">Event Rank</th>
                <th rowSpan={2} className="px-3 py-2 text-xs text-left border-2 border-indigo-300">Category Rank</th>
                {disciplines?.map((discipline) => (
                  <th key={discipline.disc_id} colSpan={2} className="border-t-2 border-l-2 border-r-2 border-b border-indigo-300 px-2 py-2 text-center text-xs max-w-[180px]" title={discipline.discipline_name}>
                    {discipline.discipline_name}
                  </th>
                ))}
              </tr>
              <tr className="text-indigo-900 bg-indigo-200">
                {disciplines?.map((discipline) => (
                  <>
                    <th key={`${discipline.disc_id}-score`} className="px-2 py-2 text-xs text-center border-l-2 border-r border-b border-indigo-300">Score</th>
                    <th key={`${discipline.disc_id}-time`} className="px-2 py-2 text-xs text-center border-l border-r-2 border-b border-indigo-300">Recall Time</th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody>
              {uniqueEvents.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-indigo-50"}>
                  <td className="px-3 py-2 text-xs border-2 border-indigo-200">{item.event_name}</td>
                  <td className="px-3 py-2 text-xs border-2 border-indigo-200">{item.category_name}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-green-600 border-2 border-indigo-200">{formatOverallScore(item.overall_score)}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-yellow-600 border-2 border-indigo-200">{item.event_rank}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-blue-600 border-2 border-indigo-200">{item.cat_rank}</td>
                  {disciplines?.map((discipline) => (
                    <>
                      <td key={`${discipline.disc_id}-score`} className="px-2 py-2 text-xs text-center border-t border-b border-l-2 border-r border-indigo-200">
                        <span className={getDisciplineScore(item, discipline.disc_id!) !== "NA" ? "text-green-600 font-semibold" : "text-gray-400"}>
                          {getDisciplineScore(item, discipline.disc_id!)}
                        </span>
                      </td>
                      <td key={`${discipline.disc_id}-time`} className="px-2 py-2 text-xs text-center border-t border-b border-l border-r-2 border-indigo-200">
                        <span className={getDisciplineTime(item, discipline.disc_id!) !== "NA" ? "text-gray-600" : "text-gray-400"}>
                          {getDisciplineTime(item, discipline.disc_id!)}
                        </span>
                      </td>
                    </>
                  ))}
                </tr>
              ))}
              {uniqueEvents.length === 0 && (
                <tr>
                  <td colSpan={5 + (disciplines?.length || 0) * 2} className="px-4 py-5 text-center text-gray-500">
                    No events found for this user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}