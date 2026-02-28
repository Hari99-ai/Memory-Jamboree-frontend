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
};

const stateMap: { [key: string]: string } = {
  "MP": "Madhya Pradesh",
  "MH": "Maharashtra",
  "DL": "Delhi",
  "KA": "Karnataka",
};

const getFullName = (code: string, type: 'country' | 'state'): string => {
  if (type === 'country' && countryMap[code]) {
    return countryMap[code];
  }
  if (type === 'state' && stateMap[code]) {
    return stateMap[code];
  }
  return code;
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
    <div className="bg-gray-50 border-b border-2 min-h-screen pb-10">
      <div className="p-4 md:p-6 mx-auto mt-4 md:mt-8 rounded-lg shadow-lg max-w-7xl bg-white">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            className="flex items-center gap-2 px-3 py-2 text-blue-600 transition-colors duration-200 rounded-md hover:bg-blue-50"
            onClick={handleBackClick}
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back</span>
          </button>
          
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Profile</span>
          </button>
        </div>

        {/* Profile Header: Stack on mobile, Row on desktop */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 border-b pb-8">
          <img
            src={image ? `${ImgUrl}/${image}` : defaultImg}
            alt={`${fname} ${lname}`}
            className="object-cover border-4 border-blue-100 rounded-full shadow-md w-32 h-32 flex-shrink-0"
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">{fname} {lname}</h1>
            <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
               <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-full border border-blue-100">
                {role}
              </span>
              <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full border border-gray-200">
                {gender}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 text-sm md:grid-cols-2">
          {/* Personal Info */}
          <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-800 border-b pb-2">Personal Info</h2>
            <div className="space-y-3 text-gray-600">
              <p className="flex items-center"><FaEnvelope className="mr-3 text-blue-500 w-4 h-4" /> <span className="text-gray-900 font-medium mr-2">Email:</span> {email}</p>
              <p className="flex items-center"><FaPhone className="mr-3 text-green-500 w-4 h-4" /> <span className="text-gray-900 font-medium mr-2">Mobile:</span> {mobile}</p>
              <p className="flex items-center"><FaBirthdayCake className="mr-3 text-pink-500 w-4 h-4" /> <span className="text-gray-900 font-medium mr-2">Birth Date:</span> {formatDate(birth_date!)}</p>
            </div>
          </div>

          {/* Address Info */}
          <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-800 border-b pb-2">Address Info</h2>
            <div className="space-y-3 text-gray-600">
              <p className="flex items-start"><FaMapMarkerAlt className="mr-3 text-red-500 w-4 h-4 mt-0.5" /> <span>{address}</span></p>
              <div className="grid grid-cols-2 gap-2">
                 <p className="flex items-center"><FaCity className="mr-2 text-blue-500 w-4 h-4" /> {city}</p>
                 <p className="flex items-center"><FaLocationArrow className="mr-2 text-purple-600 w-4 h-4" /> {pincode}</p>
              </div>
              <p className="flex items-center"><FaGlobeAsia className="mr-3 text-green-600 w-4 h-4" /> {getFullName(state!, 'state')}, {getFullName(country!, 'country')}</p>
            </div>
          </div>

          {/* School Info */}
          <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-800 border-b pb-2">School Info</h2>
            <div className="space-y-3 text-gray-600">
              <p className="flex items-center"><FaSchool className="mr-3 text-indigo-500 w-4 h-4" /> <span className="text-gray-900 font-medium mr-2">School:</span> {school_name}</p>
              <p className="flex items-center"><FaUserGraduate className="mr-3 text-orange-500 w-4 h-4" /> <span className="text-gray-900 font-medium mr-2">Class:</span> {school_class}</p>
              <p className="flex items-center"><FaLayerGroup className="mr-3 text-teal-600 w-4 h-4" /> <span className="text-gray-900 font-medium mr-2">Category:</span> {category_name}</p>
            </div>
          </div>

          {/* Family Info */}
          <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-800 border-b pb-2">Guardians Info</h2>
            <div className="space-y-3 text-gray-600">
              <p className="flex items-center"><FaUser className="mr-3 text-blue-600 w-4 h-4" /> <span className="text-gray-900 font-medium mr-2">Name:</span> {fa_name}</p>
              <p className="flex items-center"><FaMobileAlt className="mr-3 text-green-600 w-4 h-4" /> <span className="text-gray-900 font-medium mr-2">Mobile:</span> {fa_mobile}</p>
              <p className="flex items-center"><FaEnvelope className="mr-3 text-red-500 w-4 h-4" /> <span className="text-gray-900 font-medium mr-2">Email:</span> {fa_email}</p>
              <p className="flex items-center"><FaPhoneAlt className="mr-3 text-purple-500 w-4 h-4" /> <span className="text-gray-900 font-medium mr-2">Alt Mobile:</span> {mo_mobile}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="p-4 md:p-6 mx-auto mt-8 rounded-lg shadow-lg max-w-7xl bg-white">
        <h4 className='text-xl font-bold text-gray-900 mb-6 flex items-center gap-2'>
           <FaFlag className="text-indigo-600" /> Participated Events
        </h4>
        
        {/* TABLE CONTAINER: Added border, rounded corners, and overflow control */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                {/* Sticky First Column */}
                <th rowSpan={2} className="sticky left-0 z-10 bg-slate-100 px-4 py-3 text-xs font-bold text-left uppercase tracking-wider border-b border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Event
                </th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-bold text-left uppercase tracking-wider border-b border-r border-slate-300">Category</th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-bold text-center uppercase tracking-wider border-b border-r border-slate-300">Overall</th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-bold text-center uppercase tracking-wider border-b border-r border-slate-300">Evt Rank</th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-bold text-center uppercase tracking-wider border-b border-r border-slate-300">Cat Rank</th>
                {disciplines?.map((discipline) => (
                  <th key={discipline.disc_id} colSpan={2} className="px-4 py-2 text-xs font-bold text-center uppercase tracking-wider border-b border-r border-slate-300 bg-slate-50">
                    {discipline.discipline_name}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-100 text-slate-600">
                {disciplines?.map((discipline) => (
                  <>
                    <th key={`${discipline.disc_id}-score`} className="px-2 py-2 text-[10px] font-semibold text-center uppercase border-b border-r border-slate-300">Score</th>
                    <th key={`${discipline.disc_id}-time`} className="px-2 py-2 text-[10px] font-semibold text-center uppercase border-b border-r border-slate-300">Time</th>
                  </>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uniqueEvents.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  {/* Sticky First Column Data */}
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    {item.event_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-r border-slate-200">{item.category_name}</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600 text-center border-r border-slate-200">{formatOverallScore(item.overall_score)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-yellow-600 text-center border-r border-slate-200">{item.event_rank}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600 text-center border-r border-slate-200">{item.cat_rank}</td>
                  {disciplines?.map((discipline) => (
                    <>
                      <td key={`${discipline.disc_id}-score`} className="px-2 py-3 text-sm text-center border-r border-slate-200">
                        <span className={getDisciplineScore(item, discipline.disc_id!) !== "NA" ? "text-green-700 font-semibold" : "text-gray-300"}>
                          {getDisciplineScore(item, discipline.disc_id!)}
                        </span>
                      </td>
                      <td key={`${discipline.disc_id}-time`} className="px-2 py-3 text-xs text-center text-gray-500 border-r border-slate-200">
                        {getDisciplineTime(item, discipline.disc_id!)}
                      </td>
                    </>
                  ))}
                </tr>
              ))}
              {uniqueEvents.length === 0 && (
                <tr>
                  <td colSpan={5 + (disciplines?.length || 0) * 2} className="px-6 py-8 text-center text-gray-500">
                    No participating events found for this user.
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