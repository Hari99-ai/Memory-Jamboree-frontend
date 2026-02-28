/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "./client";
import {
  User,
  Plan,
  RegisterUserInput,
  EventData,
  PasswordChangeData,
  EventDetailsResponse,
  SchoolsMasterData,
  ClassMasterData,
  CategoryMasterData,
  DisciplineData,
  AssesmentData,
  ImagesData,
  ResetPassData,
  MonitoringData,
  WindowData,
  KeyboardEventData,
  MessageData,
  setPasswordData,
  WindowLogs,
  PhoneSendData,
  // CapturedResponse,
} from "../types";

// The static 'token' and 'headers' constants have been removed.
// The Axios interceptor in client.ts now handles all authorization headers.

export const OtpVerification = async (data: User) => {
  try {
    const response = await api.post("/otp-verification", data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error:any) {
    return {
      success: false,
      status: error.response.status,
      msg: error.response.data.msg || "Something went wrong",
    }
  }
};

export const OtpVerify = async (data: ResetPassData) => {
  const response = await api.post("/verify-otp", data);
  return response.data;
};

export const setPassword = async(data:setPasswordData) => {
  const response = await api.post('/set-password', data);
  return response.data;
}

export const message_form = async(data: MessageData) => {
  const res = await api.post('/messages', data);
  return res.data;
}

export const ForgetPasswords = async(email:string) => {
  const response = await api.post("/forget_password", { email });
  return response.data;
}

export const RefreshTokenAPI = async (payload: FormData | { refresh_token: string }) => {
  const refresh_token =
    payload instanceof FormData
      ? String(payload.get("refresh_token") ?? "")
      : String(payload.refresh_token ?? "");

  const response = await api.post('/reset_password', { refresh_token });
  return response.data;
}

export const ResetPassword = async(data: ResetPassData) => {
  const response = await api.post('/reset_password', data);
  return response.data;
}

export const Register = async (formData: FormData) => {
  try {
    const response = await api.post("/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!response.data) {
      throw new Error("No data received from server");
    }
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Registration failed";
    console.error("Registration error details:", error.response?.data);
    throw new Error(errorMessage);
  }
};

export const update_image = async (user_id: string) => {
  const response = await api.delete(`/remove/${user_id}`);
  return response.data;
};

export const Login = async (formData: FormData) => {
  const response = await api.post("/login", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const UpdateProfile = async (formdata: FormData) => {
  try {
    const response = await api.patch(`/edit_profile`, formdata, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update profile");
  }
};

export const fetchUser = async (user_id: string) => {
  const response = await api.get(`/admin/get-user/${user_id}`);
  return response.data.user;
};

export const Logout = async() => {
  const response = await api.delete('/logout');
  return response.data;
}

export const registered_events = async() : Promise<EventData[]> => {
  const response = await api.get(`/get-user-registered-events`);
  return response.data.events;
} 

export const register_event = async(user_id: string, event_id:number) => {
  const res = await api.post('/register_event_user', { user_id, event_id });
  return res.data;
}

export const registered_user_events = async() : Promise<EventData[]> => {
  const response = await api.get(`/get-user-events`);
  return response.data.events;
} 

// Admin
export const CreateUser = async (formdata: FormData) => {
  const response = await api.post("/admin/create-user", formdata, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateUser = async (userId: string, formData: FormData) => {
  try {
    const response = await api.post(`/admin/update-user/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const DeleteUsers = async (user_ids: number[]) => {
  const response = await api.delete('/delete-users', {
    data: { user_ids },
  });
  return response.data;
};

export const getUsers = async (): Promise<RegisterUserInput[]> => {
  const response = await api.get("/get-users");
  return response.data;
};

export const getUserById = async (user_id: string): Promise<RegisterUserInput> => {
  const response = await api.get(`/get-user/${user_id}`);
  return response.data;
};

export const getUser = async (user_id: string): Promise<RegisterUserInput> => {
  const response = await api.get(`/admin/get-user/${user_id}`);
  return response.data.user;
};

export const getUserDetails = async (user_id: string) => {
  const response = await api.get(`/admin/get-user-details/${user_id}`);
  return response.data;
};

export const deleteUser = async (user_id: string) => {
  const response = await api.delete(`/delete-user/${user_id}`);
  return response.data;
};

// Buying & Subscriptions Plans
export const createPlan = async (data: Plan) => {
  const response = await api.post("/admin/create-plan", data);
  return response.data;
};

export const fetchPlans = async (): Promise<Plan[]> => {
  const response = await api.get("/get-plans");
  return response.data.plans;
};

export const updatePlan = async (plan_id: string, data: Plan) => {
  const response = await api.post(`/admin/update-plan/${plan_id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deletePlan = async (plan_id: string) => {
  const response = await api.delete(`/admin/delete-plan/${plan_id}`);
  return response.data;
};

export const statusHandling = async (plan_id: string) => {
  const response = await api.post(`/admin/plan-handling/${plan_id}`);
  return response.data;
};

// Events
export const AddEvents = async (formdata: FormData) => {
  const response = await api.post("/admin/create-events", formdata, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const FetchEvents = async (): Promise<EventData[]> => {
  const response = await api.get("/get-events");
  return response.data.events;
};

export const getEvent = async (event_id: string) => {
  const response = await api.get(`/get-event/${event_id}`);
  return response.data;
};

export const deleteEvent = async (event_id: string) => {
  const response = await api.delete(`/delete-event/${event_id}`);
  return response.data;
};

export const getEventDetails = async (event_id: string): Promise<EventDetailsResponse> => {
  const res = await api.get(`/event-details/${event_id}`);
  return res.data;
};

export const updateEventDisciplines = async (event_id: string, disciplineIds: string[]) => {
  const res = await api.patch(`/admin/event/${event_id}/discipline`, disciplineIds);
  return res.data;
};

export const updateEventSchools = async (event_id: string, schoolIds: number[]) => {
  const res = await api.patch(`/admin/event/${event_id}/school`, schoolIds);
  return res.data;
};

export const updateEventCategory = async (event_id: string, categoryIds: number[]) => {
  const res = await api.patch(`/admin/event/${event_id}/category`, categoryIds);
  return res.data;
};

export const DeleteUsersEvent = async ({ event_id, user_id, monitoring }: { event_id: string; user_id: number[]; monitoring: any; }) => {
  const response = await api.delete(`/delete-event-users/${event_id}`, {
    data: { user_id, monitoring },
  });
  return response.data;
};

export const updateEventUsers = async({ event_id, user_id, monitoring }: { event_id: string; user_id: number[]; monitoring: any; }) => {
  const response = await api.patch(`/update-event-users/${event_id}`, { user_id, monitoring });
  return response.data;
}

export const getParticipatedUsers = async (event_id: string) => {
  const response = await api.get(`/get-user-event-participants/${event_id}`);
  return response.data;
}

export const GetUsersEvent = async ({event_id}: {event_id: string;}) => {
  const response = await api.get(`/admin/get-event-users/${event_id}`);
  return response.data;
};

export const getUserEvents = async (): Promise<EventData[]> => {
  const response = await api.get("/get-user-events");
  return response.data.events;
};

export const getUserEventDetails = async (event_id: number) => {
  try {
    const response = await api.get(`/get-user-event-details/${event_id}`);
    return { event: response.data };
  } catch (error: any) {
    console.error("❌ Error fetching user event details:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch event details");
  }
}

// SETTINGS/MASTERS
export const AddSchool = async (data: SchoolsMasterData) => {
  const res = await api.post("/schools", data);
  return res.data;
};

export const getSchools = async () => {
  const res = await api.get("/schools");
  return res.data;
};

export const deleteSchool = async (school_id: number): Promise<void> => {
  const res = await api.delete("/schools", { data: { school_id } });
  return res.data;
};

export const updateSchool = async (school_id: number | undefined, data: SchoolsMasterData): Promise<void> => {
  if (!school_id) throw new Error("School ID is required for update");
  const updatedData = { ...data, school_id };
  const res = await api.put(`/schools`, updatedData);
  return res.data;
};

export const AddClass = async (data: ClassMasterData) => {
  const res = await api.post("/class-group", data);
  return res.data;
};

export const getClasses = async () => {
  const res = await api.get("/class-group");
  return res.data;
};

export const Addcategory = async (data: CategoryMasterData) => {
  const res = await api.post("/category", data);
  return res.data;
};

export const getCategory = async () => {
  const res = await api.get("/category");
  return res.data;
};

export const deleteCategory = async (cat_id: number): Promise<void> => {
  const res = await api.delete("/category", { data: { cat_id } });
  return res.data;
};

export const updateCategory = async (cat_id: number | undefined, data: CategoryMasterData): Promise<void> => {
  if (!cat_id) throw new Error("Category ID is required for update");
  const requestData = { ...data, cat_id };
  const res = await api.put(`/category`, requestData);
  return res.data;
};

export const addDiscipline = async (data: DisciplineData) => {
  const res = await api.post("/discipline", data);
  return res.data;
};

export const getDisciplines = async (): Promise<DisciplineData[]> => {
  try {
    const res = await api.get("/discipline");
    return res.data;
  } catch (error) { 
    console.error("Error fetching disciplines:", error);
    throw new Error("Failed to fetch disciplines");
  }
};

export const deleteDiscipline = async (disc_id: number): Promise<void> => {
  const res = await api.delete("/discipline", { data: { disc_id } });
  return res.data;
};

export const updateDiscipline = async (disc_id: number | undefined, data: DisciplineData): Promise<void> => {
  if (!disc_id) throw new Error("Discipline ID is required for update");
  const res = await api.put(`/discipline`, { disc_id, ...data });
  return res.data;
};

export const changePassword = async (data: PasswordChangeData) => {
  const response = await api.post("/change-password", { data });
  return response.data;
};

// AI
// export const get_face_verification = async (formData: FormData) => {
//   const res = await api.post("/face_verification", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };
export const get_face_verification = async (formData: FormData) => {
  const res = await api.post("/face_verification", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Assessment
export const create_assesment = async (data: AssesmentData) => {
  const res = await api.post("/create-assesment", data);
  return res.data;
};

export const give_test = async (formData: FormData) => {
  const res = await api.post("/web_monitoring", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!res.data) {
    throw new Error("No data received from server");
  }
  return res.data;
};

export const phone_monitoring = async (formData: FormData) => {
  const res = await api.post("/phone_monitoring", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!res.data) {
    throw new Error("No data received from server");
  }
  return res.data;
};

// Library
export const insert_images = async(formData: FormData) => {
  const res = await api.post('/insert_images', formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!res.data) {
    throw new Error("No data received from server");
  }
  return res.data;
};

export const get_images = async (): Promise<ImagesData[]> => {
  const res = await api.get("/images");
  return res.data;
}

// Monitoring Logs
export const monioring_logs = async (): Promise<MonitoringData[]> => {
  const res = await api.get('/get-logs');
  return res.data;
}

export const deleteMonitorings = async (email: string, discipline_id: string) => {
  try {
    const res = await api.post('/delete-logs', { email, discipline_id });
    return res.data;
  } catch (error: any) {
    console.error("Failed to delete monitoring logs:", error);
    throw new Error(error.response?.data?.message || "Failed to delete logs");
  }
};

export const window_events = async (data: WindowData) => {
  const res = await api.post("/window_event", data);
  return res.data;
};

export const window_event_logs = async (discipline_id: string, email: string): Promise<WindowLogs> => {
  const res = await api.get('/window-logs', {
    params: { discipline_id, email },
  });
  return res.data;
};

export const logKeyboardEvent = async (discipline_id:string, user_id:string, keyboard_event:string) => {
  const res = await api.post('/keyboard_log', { discipline_id, user_id, keyboard_event });
  return res.data;
}

export const key_logs = async(discipline_id:string, email:string): Promise<KeyboardEventData[]>  => {
  const res = await api.get('/get_keys', { params: { discipline_id, email } });
  return res.data;
}

interface Achievement {
  max_score:number;
}

export const getAchievement = async(): Promise<Achievement> => {
  const res = await api.get("/achievements");
  return res.data;
}

type DisciplineAvg = {
  discipline_name: string;
  avg_score: number;
}

export const getAllAvgScores = async (): Promise<DisciplineAvg[]> => {
  const res = await api.get("/all_avg_scores");
  return res.data;
}

// Admin Dashboard
export const admin_dashboard_data = async () => {
  const res = await api.get('/admin-dashboard-data');
  return res.data;
}

export const live_registration = async () => {
  const res = await api.get('/live-registrations');
  return res.data;
}

export const getcertificates = async (user_id:number) => {
  const response = await api.get(`/get-ranks/${user_id}`);
  return response.data;
}

export const top_performer = async () => {
  const res = await api.get('/top-performer');
  return res.data;
}

export const getUserAverageScores = async () => {
  try {
    const response = await api.get(`/get-average-score`);
    return response.data;
  } catch (error) {
    console.error("Error fetching average scores:", error);
  }
}

export const fetchDashboardData = async () => {
  try {
    const response = await api.get(`/student-dashboard-data`);       
    return response.data;
  } catch (error) {
    console.error("Error fetching average scores:", error);
  }
}

export const StudentEventsReport = async () => {
  const response = await api.get(`/get-ranks`);       
  return response.data;
}

export const sendPhoneLinkedMail = async(data:PhoneSendData) => {
  const response = await api.post("/send-mail", data);
  return response.data;
}

export const publishResult = async (event_id:string) => {
  const response = await api.post(`/publish_result`, { event_id });
  return response.data;
};

export const precheck_verication = async (formData: FormData) => {
  const res = await api.post("/prechecking", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const capture_img = async (formData = FormData) => {
  const res = await api.post('/capture' , formData , {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data
}

export const get_captured_image = async (
  event_id: string,
  disc_id: string,
  user_id: string
) => {
  const res = await api.get(
    `/get-captured/${event_id}/${disc_id}/${user_id}`
  )
  console.log("captured data 🔥🔥" , res)
  return res.data.captured_image
}

export const precheck_verification = async (
  event_id: string,
  user_id: string,
  disc_id: string
) => {
  const res = await api.get(`/prechecking/${event_id}/${disc_id}/${user_id}`);
  return res.data;
};

export const capture_request = async(
  event_id:string,
  user_id:string,
  disc_id:string
) => {
  const res = await api.post(`/request-capture/${event_id}/${disc_id}/${user_id}`)
  return res.data
}

// Exam Proctoring APIs
export const verifyFaceForExam = async (formData: FormData) => {
  try {
    const res = await api.post("/video_feed", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    console.error("Face verification failed:", error);
    throw new Error(error.response?.data?.message || "Face verification failed");
  }
};

export const startExamMonitoring = async () => {
  try {
    const res = await api.post("/start-monitoring");
    return res.data;
  } catch (error: any) {
    console.error("Failed to start monitoring:", error);
    throw new Error(error.response?.data?.message || "Failed to start monitoring");
  }
};

export const stopExamMonitoring = async () => {
  try {
    const res = await api.post("/stop-monitoring");
    return res.data;
  } catch (error: any) {
    console.error("Failed to stop monitoring:", error);
    throw new Error(error.response?.data?.message || "Failed to stop monitoring");
  }
};

export const monitorFaceDuringExam = async (formData: FormData) => {
  try {
    const res = await api.post("/monitor-face", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    console.error("Face monitoring error:", error);
    throw new Error(error.response?.data?.message || "Face monitoring failed");
  }
};



// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { api } from "./client";
// import {
//   User,
//   Plan,
//   RegisterUserInput,
//   EventData,
//   PasswordChangeData,
//   EventDetailsResponse,
//   SchoolsMasterData,
//   ClassMasterData,
//   CategoryMasterData,
//   DisciplineData,
//   AssesmentData,
//   ImagesData,
//   ResetPassData,
//   MonitoringData,
//   WindowData,
//   KeyboardEventData,
//   MessageData,
//   setPasswordData,
//   WindowLogs,
//   PhoneSendData,
//   // CapturedResponse,
// } from "../types";

// // The static 'token' and 'headers' constants have been removed.
// // The Axios interceptor in client.ts now handles all authorization headers.

// export const OtpVerification = async (data: User) => {
//   try {
//     const response = await api.post("/otp-verification", data);
//     return {
//       success: true,
//       data: response.data,
//     };
//   } catch (error:any) {
//     return {
//       success: false,
//       status: error.response.status,
//       msg: error.response.data.msg || "Something went wrong",
//     }
//   }
// };

// export const OtpVerify = async (data: ResetPassData) => {
//   const response = await api.post("/verify-otp", data);
//   return response.data;
// };

// export const setPassword = async(data:setPasswordData) => {
//   const response = await api.post('/set-password', data);
//   return response.data;
// }

// export const message_form = async(data: MessageData) => {
//   const res = await api.post('/messages', data);
//   return res.data;
// }

// export const ForgetPasswords = async(email:string) => {
//   const response = await api.post("/forget_password", { email });
//   return response.data;
// }

// export const RefreshTokenAPI = async(formData: FormData) => {
//   const response = await api.post('/reset_password', formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return response.data;
// }

// export const ResetPassword = async(data: ResetPassData) => {
//   const response = await api.post('/reset_password', data);
//   return response.data;
// }

// export const Register = async (formData: FormData) => {
//   try {
//     const response = await api.post("/register", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     if (!response.data) {
//       throw new Error("No data received from server");
//     }
//     return response.data;
//   } catch (error: any) {
//     const errorMessage = error.response?.data?.message || error.message || "Registration failed";
//     console.error("Registration error details:", error.response?.data);
//     throw new Error(errorMessage);
//   }
// };

// export const update_image = async (user_id: string) => {
//   const response = await api.delete(`/remove/${user_id}`);
//   return response.data;
// };

// export const Login = async (formData: FormData) => {
//   const response = await api.post("/login", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return response.data;
// };

// export const UpdateProfile = async (formdata: FormData) => {
//   try {
//     const response = await api.patch(`/edit_profile`, formdata, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return response.data;
//   } catch (error: any) {
//     throw new Error(error.response?.data?.message || "Failed to update profile");
//   }
// };

// export const fetchUser = async (user_id: string) => {
//   const response = await api.get(`/admin/get-user/${user_id}`);
//   return response.data.user;
// };

// export const Logout = async() => {
//   const response = await api.delete('/logout');
//   return response.data;
// }

// export const registered_events = async() : Promise<EventData[]> => {
//   const response = await api.get(`/get-user-registered-events`);
//   return response.data.events;
// } 

// export const register_event = async(user_id: string, event_id:number) => {
//   const res = await api.post('/register_event_user', { user_id, event_id });
//   return res.data;
// }

// export const registered_user_events = async() : Promise<EventData[]> => {
//   const response = await api.get(`/get-user-events`);
//   return response.data.events;
// } 

// // Admin
// export const CreateUser = async (formdata: FormData) => {
//   const response = await api.post("/admin/create-user", formdata, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return response.data;
// };

// export const updateUser = async (userId: string, formData: FormData) => {
//   try {
//     const response = await api.post(`/admin/update-user/${userId}`, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return response.data;
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const DeleteUsers = async (user_ids: number[]) => {
//   const response = await api.delete('/delete-users', {
//     data: { user_ids },
//   });
//   return response.data;
// };

// export const getUsers = async (): Promise<RegisterUserInput[]> => {
//   const response = await api.get("/get-users");
//   return response.data;
// };

// export const getUserById = async (user_id: string): Promise<RegisterUserInput> => {
//   const response = await api.get(`/get-user/${user_id}`);
//   return response.data;
// };

// export const getUser = async (user_id: string): Promise<RegisterUserInput> => {
//   const response = await api.get(`/admin/get-user/${user_id}`);
//   return response.data.user;
// };

// export const getUserDetails = async (user_id: string) => {
//   const response = await api.get(`/admin/get-user-details/${user_id}`);
//   return response.data;
// };

// export const deleteUser = async (user_id: string) => {
//   const response = await api.delete(`/delete-user/${user_id}`);
//   return response.data;
// };

// // Buying & Subscriptions Plans
// export const createPlan = async (data: Plan) => {
//   const response = await api.post("/admin/create-plan", data);
//   return response.data;
// };

// export const fetchPlans = async (): Promise<Plan[]> => {
//   const response = await api.get("/get-plans");
//   return response.data.plans;
// };

// export const updatePlan = async (plan_id: string, data: Plan) => {
//   const response = await api.post(`/admin/update-plan/${plan_id}`, data, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return response.data;
// };

// export const deletePlan = async (plan_id: string) => {
//   const response = await api.delete(`/admin/delete-plan/${plan_id}`);
//   return response.data;
// };

// export const statusHandling = async (plan_id: string) => {
//   const response = await api.post(`/admin/plan-handling/${plan_id}`);
//   return response.data;
// };

// // Events
// export const AddEvents = async (formdata: FormData) => {
//   const response = await api.post("/admin/create-events", formdata, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return response.data;
// };

// export const FetchEvents = async (): Promise<EventData[]> => {
//   const response = await api.get("/get-events");
//   return response.data.events;
// };

// export const getEvent = async (event_id: string) => {
//   const response = await api.get(`/get-event/${event_id}`);
//   return response.data;
// };

// export const deleteEvent = async (event_id: string) => {
//   const response = await api.delete(`/delete-event/${event_id}`);
//   return response.data;
// };

// export const getEventDetails = async (event_id: string): Promise<EventDetailsResponse> => {
//   const res = await api.get(`/event-details/${event_id}`);
//   return res.data;
// };

// export const updateEventDisciplines = async (event_id: string, disciplineIds: string[]) => {
//   const res = await api.patch(`/admin/event/${event_id}/discipline`, disciplineIds);
//   return res.data;
// };

// export const updateEventSchools = async (event_id: string, schoolIds: number[]) => {
//   const res = await api.patch(`/admin/event/${event_id}/school`, schoolIds);
//   return res.data;
// };

// export const updateEventCategory = async (event_id: string, categoryIds: number[]) => {
//   const res = await api.patch(`/admin/event/${event_id}/category`, categoryIds);
//   return res.data;
// };

// export const DeleteUsersEvent = async ({ event_id, user_id, monitoring }: { event_id: string; user_id: number[]; monitoring: any; }) => {
//   const response = await api.delete(`/delete-event-users/${event_id}`, {
//     data: { user_id, monitoring },
//   });
//   return response.data;
// };

// export const updateEventUsers = async({ event_id, user_id, monitoring }: { event_id: string; user_id: number[]; monitoring: any; }) => {
//   const response = await api.patch(`/update-event-users/${event_id}`, { user_id, monitoring });
//   return response.data;
// }

// export const getParticipatedUsers = async (event_id: string) => {
//   const response = await api.get(`/get-user-event-participants/${event_id}`);
//   return response.data;
// }

// export const GetUsersEvent = async ({event_id}: {event_id: string;}) => {
//   const response = await api.get(`/admin/get-event-users/${event_id}`);
//   return response.data;
// };

// export const getUserEvents = async (): Promise<EventData[]> => {
//   const response = await api.get("/get-user-events");
//   return response.data.events;
// };

// export const getUserEventDetails = async (event_id: number) => {
//   try {
//     const response = await api.get(`/get-user-event-details/${event_id}`);
//     return { event: response.data };
//   } catch (error: any) {
//     console.error("❌ Error fetching user event details:", error);
//     throw new Error(error.response?.data?.message || "Failed to fetch event details");
//   }
// }

// // SETTINGS/MASTERS
// export const AddSchool = async (data: SchoolsMasterData) => {
//   const res = await api.post("/schools", data);
//   return res.data;
// };

// export const getSchools = async () => {
//   const res = await api.get("/schools");
//   return res.data;
// };

// export const deleteSchool = async (school_id: number): Promise<void> => {
//   const res = await api.delete("/schools", { data: { school_id } });
//   return res.data;
// };

// export const updateSchool = async (school_id: number | undefined, data: SchoolsMasterData): Promise<void> => {
//   if (!school_id) throw new Error("School ID is required for update");
//   const updatedData = { ...data, school_id };
//   const res = await api.put(`/schools`, updatedData);
//   return res.data;
// };

// export const AddClass = async (data: ClassMasterData) => {
//   const res = await api.post("/class-group", data);
//   return res.data;
// };

// export const getClasses = async () => {
//   const res = await api.get("/class-group");
//   return res.data;
// };

// export const Addcategory = async (data: CategoryMasterData) => {
//   const res = await api.post("/category", data);
//   return res.data;
// };

// export const getCategory = async () => {
//   const res = await api.get("/category");
//   return res.data;
// };

// export const deleteCategory = async (cat_id: number): Promise<void> => {
//   const res = await api.delete("/category", { data: { cat_id } });
//   return res.data;
// };

// export const updateCategory = async (cat_id: number | undefined, data: CategoryMasterData): Promise<void> => {
//   if (!cat_id) throw new Error("Category ID is required for update");
//   const requestData = { ...data, cat_id };
//   const res = await api.put(`/category`, requestData);
//   return res.data;
// };

// export const addDiscipline = async (data: DisciplineData) => {
//   const res = await api.post("/discipline", data);
//   return res.data;
// };

// export const getDisciplines = async (): Promise<DisciplineData[]> => {
//   try {
//     const res = await api.get("/discipline");
//     return res.data;
//   } catch (error) { 
//     console.error("Error fetching disciplines:", error);
//     throw new Error("Failed to fetch disciplines");
//   }
// };

// export const deleteDiscipline = async (disc_id: number): Promise<void> => {
//   const res = await api.delete("/discipline", { data: { disc_id } });
//   return res.data;
// };

// export const updateDiscipline = async (disc_id: number | undefined, data: DisciplineData): Promise<void> => {
//   if (!disc_id) throw new Error("Discipline ID is required for update");
//   const res = await api.put(`/discipline`, { disc_id, ...data });
//   return res.data;
// };

// export const changePassword = async (data: PasswordChangeData) => {
//   const response = await api.post("/change-password", { data });
//   return response.data;
// };

// // AI
// // export const get_face_verification = async (formData: FormData) => {
// //   const res = await api.post("/face_verification", formData, {
// //     headers: { "Content-Type": "multipart/form-data" },
// //   });
// //   return res.data;
// // };
// export const get_face_verification = async (formData: FormData) => {
//   const res = await api.post("/face_verification", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// // Assessment
// export const create_assesment = async (data: AssesmentData) => {
//   const res = await api.post("/create-assesment", data);
//   return res.data;
// };

// export const give_test = async (formData: FormData) => {
//   const res = await api.post("/web_monitoring", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   if (!res.data) {
//     throw new Error("No data received from server");
//   }
//   return res.data;
// };

// export const phone_monitoring = async (formData: FormData) => {
//   const res = await api.post("/phone_monitoring", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   if (!res.data) {
//     throw new Error("No data received from server");
//   }
//   return res.data;
// };

// // Library
// export const insert_images = async(formData: FormData) => {
//   const res = await api.post('/insert_images', formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   if (!res.data) {
//     throw new Error("No data received from server");
//   }
//   return res.data;
// };

// export const get_images = async (): Promise<ImagesData[]> => {
//   const res = await api.get("/images");
//   return res.data;
// }

// // Monitoring Logs
// export const monioring_logs = async (): Promise<MonitoringData[]> => {
//   const res = await api.get('/get-logs');
//   return res.data;
// }

// export const deleteMonitorings = async (email: string, discipline_id: string) => {
//   try {
//     const res = await api.post('/delete-logs', { email, discipline_id });
//     return res.data;
//   } catch (error: any) {
//     console.error("Failed to delete monitoring logs:", error);
//     throw new Error(error.response?.data?.message || "Failed to delete logs");
//   }
// };

// export const window_events = async (data: WindowData) => {
//   const res = await api.post("/window_event", data);
//   return res.data;
// };

// export const window_event_logs = async (discipline_id: string, email: string): Promise<WindowLogs> => {
//   const res = await api.get('/window-logs', {
//     params: { discipline_id, email },
//   });
//   return res.data;
// };

// export const logKeyboardEvent = async (discipline_id:string, user_id:string, keyboard_event:string) => {
//   const res = await api.post('/keyboard_log', { discipline_id, user_id, keyboard_event });
//   return res.data;
// }

// export const key_logs = async(discipline_id:string, email:string): Promise<KeyboardEventData[]>  => {
//   const res = await api.get('/get_keys', { params: { discipline_id, email } });
//   return res.data;
// }

// interface Achievement {
//   max_score:number;
// }

// export const getAchievement = async(): Promise<Achievement> => {
//   const res = await api.get("/achievements");
//   return res.data;
// }

// type DisciplineAvg = {
//   discipline_name: string;
//   avg_score: number;
// }

// export const getAllAvgScores = async (): Promise<DisciplineAvg[]> => {
//   const res = await api.get("/all_avg_scores");
//   return res.data;
// }

// // Admin Dashboard
// export const admin_dashboard_data = async () => {
//   const res = await api.get('/admin-dashboard-data');
//   return res.data;
// }

// export const live_registration = async () => {
//   const res = await api.get('/live-registrations');
//   return res.data;
// }

// export const getcertificates = async (user_id:number) => {
//   const response = await api.get(`/get-ranks/${user_id}`);
//   return response.data;
// }

// export const top_performer = async () => {
//   const res = await api.get('/top-performer');
//   return res.data;
// }

// export const getUserAverageScores = async () => {
//   try {
//     const response = await api.get(`/get-average-score`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching average scores:", error);
//   }
// }

// export const fetchDashboardData = async () => {
//   try {
//     const response = await api.get(`/student-dashboard-data`);       
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching average scores:", error);
//   }
// }

// export const StudentEventsReport = async () => {
//   const response = await api.get(`/get-ranks`);       
//   return response.data;
// }

// export const sendPhoneLinkedMail = async(data:PhoneSendData) => {
//   const response = await api.post("/send-mail", data);
//   return response.data;
// }

// export const publishResult = async (event_id:string) => {
//   const response = await api.post(`/publish_result`, { event_id });
//   return response.data;
// };

// export const precheck_verication = async (formData: FormData) => {
//   const res = await api.post("/prechecking", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// export const capture_img = async (formData = FormData) => {
//   const res = await api.post('/capture' , formData , {
//     headers: { "Content-Type": "multipart/form-data" },
//   })
//   return res.data
// }

// export const get_captured_image = async (
//   event_id: string,
//   disc_id: string,
//   user_id: string
// ) => {
//   const res = await api.get(
//     `/get-captured/${event_id}/${disc_id}/${user_id}`
//   )
//   console.log("captured data 🔥🔥" , res)
//   return res.data.captured_image
// }

// export const precheck_verification = async (
//   event_id: string,
//   user_id: string,
//   disc_id: string
// ) => {
//   const res = await api.get(`/prechecking/${event_id}/${disc_id}/${user_id}`);
//   return res.data;
// };

// export const capture_request = async(
//   event_id:string,
//   user_id:string,
//   disc_id:string
// ) => {
//   const res = await api.post(`/request-capture/${event_id}/${disc_id}/${user_id}`)
//   return res.data
// }

// // Exam Proctoring APIs
// export const verifyFaceForExam = async (formData: FormData) => {
//   try {
//     const res = await api.post("/video_feed", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res.data;
//   } catch (error: any) {
//     console.error("Face verification failed:", error);
//     throw new Error(error.response?.data?.message || "Face verification failed");
//   }
// };

// export const startExamMonitoring = async () => {
//   try {
//     const res = await api.post("/start-monitoring");
//     return res.data;
//   } catch (error: any) {
//     console.error("Failed to start monitoring:", error);
//     throw new Error(error.response?.data?.message || "Failed to start monitoring");
//   }
// };

// export const stopExamMonitoring = async () => {
//   try {
//     const res = await api.post("/stop-monitoring");
//     return res.data;
//   } catch (error: any) {
//     console.error("Failed to stop monitoring:", error);
//     throw new Error(error.response?.data?.message || "Failed to stop monitoring");
//   }
// };

// export const monitorFaceDuringExam = async (formData: FormData) => {
//   try {
//     const res = await api.post("/monitor-face", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res.data;
//   } catch (error: any) {
//     console.error("Face monitoring error:", error);
//     throw new Error(error.response?.data?.message || "Face monitoring failed");
//   }
// };


// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { api } from "./client";
// import {
//   User,
//   Plan,
//   RegisterUserInput,
//   EventData,
//   PasswordChangeData,
//   EventDetailsResponse,
//   SchoolsMasterData,
//   ClassMasterData,
//   CategoryMasterData,
//   DisciplineData,
//   AssesmentData,
//   ImagesData,
//   ResetPassData,
//   MonitoringData,
//   WindowData,
//   KeyboardEventData,
//   MessageData,
//   setPasswordData,
//   WindowLogs,
//   PhoneSendData,
//   // CapturedResponse,
// } from "../types";

// // The static 'token' and 'headers' constants have been removed.
// // The Axios interceptor in client.ts now handles all authorization headers.

// export const OtpVerification = async (data: User) => {
//   try {
//     const response = await api.post("/otp-verification", data);
//     return {
//       success: true,
//       data: response.data,
//     };
//   } catch (error:any) {
//     return {
//       success: false,
//       status: error.response.status,
//       msg: error.response.data.msg || "Something went wrong",
//     }
//   }
// };

// export const OtpVerify = async (data: ResetPassData) => {
//   const response = await api.post("/verify-otp", data);
//   return response.data;
// };

// export const setPassword = async(data:setPasswordData) => {
//   const response = await api.post('/set-password', data);
//   return response.data;
// }

// export const message_form = async(data: MessageData) => {
//   const res = await api.post('/messages', data);
//   return res.data;
// }

// export const ForgetPasswords = async(email:string) => {
//   const response = await api.post("/forget_password", { email });
//   return response.data;
// }

// export const RefreshTokenAPI = async(formData: FormData) => {
//   const response = await api.post('/reset_password', formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return response.data;
// }

// export const ResetPassword = async(data: ResetPassData) => {
//   const response = await api.post('/reset_password', data);
//   return response.data;
// }

// export const Register = async (formData: FormData) => {
//   try {
//     const response = await api.post("/register", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     if (!response.data) {
//       throw new Error("No data received from server");
//     }
//     return response.data;
//   } catch (error: any) {
//     const errorMessage = error.response?.data?.message || error.message || "Registration failed";
//     console.error("Registration error details:", error.response?.data);
//     throw new Error(errorMessage);
//   }
// };

// export const update_image = async (user_id: string) => {
//   const response = await api.delete(`/remove/${user_id}`);
//   return response.data;
// };

// export const Login = async (formData: FormData) => {
//   const response = await api.post("/login", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return response.data;
// };

// export const UpdateProfile = async (formdata: FormData) => {
//   try {
//     const response = await api.patch(`/edit_profile`, formdata, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return response.data;
//   } catch (error: any) {
//     throw new Error(error.response?.data?.message || "Failed to update profile");
//   }
// };

// export const fetchUser = async (user_id: string) => {
//   const response = await api.get(`/admin/get-user/${user_id}`);
//   return response.data.user;
// };

// export const Logout = async() => {
//   const response = await api.delete('/logout');
//   return response.data;
// }

// export const registered_events = async() : Promise<EventData[]> => {
//   const response = await api.get(`/get-user-registered-events`);
//   return response.data.events;
// } 

// export const register_event = async(user_id: string, event_id:number) => {
//   const res = await api.post('/register_event_user', { user_id, event_id });
//   return res.data;
// }

// export const registered_user_events = async() : Promise<EventData[]> => {
//   const response = await api.get(`/get-user-events`);
//   return response.data.events;
// } 

// // Admin
// export const CreateUser = async (formdata: FormData) => {
//   const response = await api.post("/admin/create-user", formdata, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return response.data;
// };

// export const updateUser = async (userId: string, formData: FormData) => {
//   try {
//     const response = await api.post(`/admin/update-user/${userId}`, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return response.data;
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const DeleteUsers = async (user_ids: number[]) => {
//   const response = await api.delete('/delete-users', {
//     data: { user_ids },
//   });
//   return response.data;
// };

// export const getUsers = async (): Promise<RegisterUserInput[]> => {
//   const response = await api.get("/get-users");
//   return response.data;
// };

// export const getUserById = async (user_id: string): Promise<RegisterUserInput> => {
//   const response = await api.get(`/get-user/${user_id}`);
//   return response.data;
// };

// export const getUser = async (user_id: string): Promise<RegisterUserInput> => {
//   const response = await api.get(`/admin/get-user/${user_id}`);
//   return response.data.user;
// };

// export const getUserDetails = async (user_id: string) => {
//   const response = await api.get(`/admin/get-user-details/${user_id}`);
//   return response.data;
// };

// export const deleteUser = async (user_id: string) => {
//   const response = await api.delete(`/delete-user/${user_id}`);
//   return response.data;
// };

// // Buying & Subscriptions Plans
// export const createPlan = async (data: Plan) => {
//   const response = await api.post("/admin/create-plan", data);
//   return response.data;
// };

// export const fetchPlans = async (): Promise<Plan[]> => {
//   const response = await api.get("/get-plans");
//   return response.data.plans;
// };

// export const updatePlan = async (plan_id: string, data: Plan) => {
//   const response = await api.post(`/admin/update-plan/${plan_id}`, data, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return response.data;
// };

// export const deletePlan = async (plan_id: string) => {
//   const response = await api.delete(`/admin/delete-plan/${plan_id}`);
//   return response.data;
// };

// export const statusHandling = async (plan_id: string) => {
//   const response = await api.post(`/admin/plan-handling/${plan_id}`);
//   return response.data;
// };

// // Events
// export const AddEvents = async (formdata: FormData) => {
//   const response = await api.post("/admin/create-events", formdata, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return response.data;
// };

// export const FetchEvents = async (): Promise<EventData[]> => {
//   const response = await api.get("/get-events");
//   return response.data.events;
// };

// export const getEvent = async (event_id: string) => {
//   const response = await api.get(`/get-event/${event_id}`);
//   return response.data;
// };

// export const deleteEvent = async (event_id: string) => {
//   const response = await api.delete(`/delete-event/${event_id}`);
//   return response.data;
// };

// export const getEventDetails = async (event_id: string): Promise<EventDetailsResponse> => {
//   const res = await api.get(`/event-details/${event_id}`);
//   return res.data;
// };

// export const updateEventDisciplines = async (event_id: string, disciplineIds: string[]) => {
//   const res = await api.patch(`/admin/event/${event_id}/discipline`, disciplineIds);
//   return res.data;
// };

// export const updateEventSchools = async (event_id: string, schoolIds: number[]) => {
//   const res = await api.patch(`/admin/event/${event_id}/school`, schoolIds);
//   return res.data;
// };

// export const updateEventCategory = async (event_id: string, categoryIds: number[]) => {
//   const res = await api.patch(`/admin/event/${event_id}/category`, categoryIds);
//   return res.data;
// };

// export const DeleteUsersEvent = async ({ event_id, user_id, monitoring }: { event_id: string; user_id: number[]; monitoring: any; }) => {
//   const response = await api.delete(`/delete-event-users/${event_id}`, {
//     data: { user_id, monitoring },
//   });
//   return response.data;
// };

// export const updateEventUsers = async({ event_id, user_id, monitoring }: { event_id: string; user_id: number[]; monitoring: any; }) => {
//   const response = await api.patch(`/update-event-users/${event_id}`, { user_id, monitoring });
//   return response.data;
// }

// export const getParticipatedUsers = async (event_id: string) => {
//   const response = await api.get(`/get-user-event-participants/${event_id}`);
//   return response.data;
// }

// export const GetUsersEvent = async ({event_id}: {event_id: string;}) => {
//   const response = await api.get(`/admin/get-event-users/${event_id}`);
//   return response.data;
// };

// export const getUserEvents = async (): Promise<EventData[]> => {
//   const response = await api.get("/get-user-events");
//   return response.data.events;
// };

// export const getUserEventDetails = async (event_id: number) => {
//   try {
//     const response = await api.get(`/get-user-event-details/${event_id}`);
//     return { event: response.data };
//   } catch (error: any) {
//     console.error("❌ Error fetching user event details:", error);
//     throw new Error(error.response?.data?.message || "Failed to fetch event details");
//   }
// }

// // SETTINGS/MASTERS
// export const AddSchool = async (data: SchoolsMasterData) => {
//   const res = await api.post("/schools", data);
//   return res.data;
// };

// export const getSchools = async () => {
//   const res = await api.get("/schools");
//   return res.data;
// };

// export const deleteSchool = async (school_id: number): Promise<void> => {
//   const res = await api.delete("/schools", { data: { school_id } });
//   return res.data;
// };

// export const updateSchool = async (school_id: number | undefined, data: SchoolsMasterData): Promise<void> => {
//   if (!school_id) throw new Error("School ID is required for update");
//   const updatedData = { ...data, school_id };
//   const res = await api.put(`/schools`, updatedData);
//   return res.data;
// };

// export const AddClass = async (data: ClassMasterData) => {
//   const res = await api.post("/class-group", data);
//   return res.data;
// };

// export const getClasses = async () => {
//   const res = await api.get("/class-group");
//   return res.data;
// };

// export const Addcategory = async (data: CategoryMasterData) => {
//   const res = await api.post("/category", data);
//   return res.data;
// };

// export const getCategory = async () => {
//   const res = await api.get("/category");
//   return res.data;
// };

// export const deleteCategory = async (cat_id: number): Promise<void> => {
//   const res = await api.delete("/category", { data: { cat_id } });
//   return res.data;
// };

// export const updateCategory = async (cat_id: number | undefined, data: CategoryMasterData): Promise<void> => {
//   if (!cat_id) throw new Error("Category ID is required for update");
//   const requestData = { ...data, cat_id };
//   const res = await api.put(`/category`, requestData);
//   return res.data;
// };

// export const addDiscipline = async (data: DisciplineData) => {
//   const res = await api.post("/discipline", data);
//   return res.data;
// };

// export const getDisciplines = async (): Promise<DisciplineData[]> => {
//   try {
//     const res = await api.get("/discipline");
//     return res.data;
//   } catch (error) { 
//     console.error("Error fetching disciplines:", error);
//     throw new Error("Failed to fetch disciplines");
//   }
// };

// export const deleteDiscipline = async (disc_id: number): Promise<void> => {
//   const res = await api.delete("/discipline", { data: { disc_id } });
//   return res.data;
// };

// export const updateDiscipline = async (disc_id: number | undefined, data: DisciplineData): Promise<void> => {
//   if (!disc_id) throw new Error("Discipline ID is required for update");
//   const res = await api.put(`/discipline`, { disc_id, ...data });
//   return res.data;
// };

// export const changePassword = async (data: PasswordChangeData) => {
//   const response = await api.post("/change-password", { data });
//   return response.data;
// };

// // AI
// // export const get_face_verification = async (formData: FormData) => {
// //   const res = await api.post("/face_verification", formData, {
// //     headers: { "Content-Type": "multipart/form-data" },
// //   });
// //   return res.data;
// // };
// export const get_face_verification = async (formData: FormData) => {
//   const res = await api.post("/face_verification", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// // Assessment
// export const create_assesment = async (data: AssesmentData) => {
//   const res = await api.post("/create-assesment", data);
//   return res.data;
// };

// export const give_test = async (formData: FormData) => {
//   const res = await api.post("/web_monitoring", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   if (!res.data) {
//     throw new Error("No data received from server");
//   }
//   return res.data;
// };

// export const phone_monitoring = async (formData: FormData) => {
//   const res = await api.post("/phone_monitoring", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   if (!res.data) {
//     throw new Error("No data received from server");
//   }
//   return res.data;
// };

// // Library
// export const insert_images = async(formData: FormData) => {
//   const res = await api.post('/insert_images', formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   if (!res.data) {
//     throw new Error("No data received from server");
//   }
//   return res.data;
// };

// export const get_images = async (): Promise<ImagesData[]> => {
//   const res = await api.get("/images");
//   return res.data;
// }

// // Monitoring Logs
// export const monioring_logs = async (): Promise<MonitoringData[]> => {
//   const res = await api.get('/get-logs');
//   return res.data;
// }

// export const deleteMonitorings = async (email: string, discipline_id: string) => {
//   try {
//     const res = await api.post('/delete-logs', { email, discipline_id });
//     return res.data;
//   } catch (error: any) {
//     console.error("Failed to delete monitoring logs:", error);
//     throw new Error(error.response?.data?.message || "Failed to delete logs");
//   }
// };

// export const window_events = async (data: WindowData) => {
//   const res = await api.post("/window_event", data);
//   return res.data;
// };

// export const window_event_logs = async (discipline_id: string, email: string): Promise<WindowLogs> => {
//   const res = await api.get('/window-logs', {
//     params: { discipline_id, email },
//   });
//   return res.data;
// };

// export const logKeyboardEvent = async (discipline_id:string, user_id:string, keyboard_event:string) => {
//   const res = await api.post('/keyboard_log', { discipline_id, user_id, keyboard_event });
//   return res.data;
// }

// export const key_logs = async(discipline_id:string, email:string): Promise<KeyboardEventData[]>  => {
//   const res = await api.get('/get_keys', { params: { discipline_id, email } });
//   return res.data;
// }

// interface Achievement {
//   max_score:number;
// }

// export const getAchievement = async(): Promise<Achievement> => {
//   const res = await api.get("/achievements");
//   return res.data;
// }

// type DisciplineAvg = {
//   discipline_name: string;
//   avg_score: number;
// }

// export const getAllAvgScores = async (): Promise<DisciplineAvg[]> => {
//   const res = await api.get("/all_avg_scores");
//   return res.data;
// }

// // Admin Dashboard
// export const admin_dashboard_data = async () => {
//   const res = await api.get('/admin-dashboard-data');
//   return res.data;
// }

// export const live_registration = async () => {
//   const res = await api.get('/live-registrations');
//   return res.data;
// }

// export const getcertificates = async (user_id:number) => {
//   const response = await api.get(`/get-ranks/${user_id}`);
//   return response.data;
// }

// export const top_performer = async () => {
//   const res = await api.get('/top-performer');
//   return res.data;
// }

// export const getUserAverageScores = async () => {
//   try {
//     const response = await api.get(`/get-average-score`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching average scores:", error);
//   }
// }

// export const fetchDashboardData = async () => {
//   try {
//     const response = await api.get(`/student-dashboard-data`);       
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching average scores:", error);
//   }
// }

// export const StudentEventsReport = async () => {
//   const response = await api.get(`/get-ranks`);       
//   return response.data;
// }

// export const sendPhoneLinkedMail = async(data:PhoneSendData) => {
//   const response = await api.post("/send-mail", data);
//   return response.data;
// }

// export const publishResult = async (event_id:string) => {
//   const response = await api.post(`/publish_result`, { event_id });
//   return response.data;
// };

// export const precheck_verication = async (formData: FormData) => {
//   const res = await api.post("/prechecking", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return res.data;
// };

// export const capture_img = async (formData = FormData) => {
//   const res = await api.post('/capture' , formData , {
//     headers: { "Content-Type": "multipart/form-data" },
//   })
//   return res.data
// }

// export const get_captured_image = async (
//   event_id: string,
//   disc_id: string,
//   user_id: string
// ) => {
//   const res = await api.get(
//     `/get-captured/${event_id}/${disc_id}/${user_id}`
//   )
//   console.log("captured data 🔥🔥" , res)
//   return res.data.captured_image
// }

// export const precheck_verification = async (
//   event_id: string,
//   user_id: string,
//   disc_id: string
// ) => {
//   const res = await api.get(`/prechecking/${event_id}/${disc_id}/${user_id}`);
//   return res.data;
// };

// export const capture_request = async(
//   event_id:string,
//   user_id:string,
//   disc_id:string
// ) => {
//   const res = await api.post(`/request-capture/${event_id}/${disc_id}/${user_id}`)
//   return res.data
// }

// // Exam Proctoring APIs
// export const verifyFaceForExam = async (formData: FormData) => {
//   try {
//     const res = await api.post("/video_feed", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res.data;
//   } catch (error: any) {
//     console.error("Face verification failed:", error);
//     throw new Error(error.response?.data?.message || "Face verification failed");
//   }
// };

// export const startExamMonitoring = async () => {
//   try {
//     const res = await api.post("/start-monitoring");
//     return res.data;
//   } catch (error: any) {
//     console.error("Failed to start monitoring:", error);
//     throw new Error(error.response?.data?.message || "Failed to start monitoring");
//   }
// };

// export const stopExamMonitoring = async () => {
//   try {
//     const res = await api.post("/stop-monitoring");
//     return res.data;
//   } catch (error: any) {
//     console.error("Failed to stop monitoring:", error);
//     throw new Error(error.response?.data?.message || "Failed to stop monitoring");
//   }
// };

// export const monitorFaceDuringExam = async (formData: FormData) => {
//   try {
//     const res = await api.post("/monitor-face", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return res.data;
//   } catch (error: any) {
//     console.error("Face monitoring error:", error);
//     throw new Error(error.response?.data?.message || "Face monitoring failed");
//   }
// };

// // ================== NEW FOCUS TRACKING APIS ================== //

/**
 * Reset focus tracking state when starting a new exam
 * Call this before starting monitoring to clear any previous state
 */
export const resetFocusTracking = async (
  event_id: string,
  disc_id: string,
  user_id: string
) => {
  try {
    const response = await api.post(`/reset-focus-tracking/${event_id}/${disc_id}/${user_id}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to reset focus tracking:", error);
    throw new Error(error.response?.data?.message || "Failed to reset focus tracking");
  }
};

/**
 * Reset violation counts for a user
 * Use when restarting an exam or resetting warnings
 */
export const resetViolations = async (
  event_id: string,
  disc_id: string,
  user_id: string
) => {
  try {
    const response = await api.post(`/reset-violations/${event_id}/${disc_id}/${user_id}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to reset violations:", error);
    throw new Error(error.response?.data?.message || "Failed to reset violations");
  }
};

/**
 * Get current focus tracking status
 * Useful for debugging or resuming monitoring
 */
export const getFocusTrackingStatus = async (
  event_id: string,
  disc_id: string,
  user_id: string
) => {
  try {
    const response = await api.get(`/focus-tracking-status/${event_id}/${disc_id}/${user_id}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to get focus tracking status:", error);
    throw new Error(error.response?.data?.message || "Failed to get focus tracking status");
  }
};

/**
 * Bypass verification for testing purposes
 * Only for development/testing environments
 */
// export const bypassVerification = async (
//   event_id: string,
//   disc_id: string,
//   user_id: string
// ) => {
//   try {
//     const response = await api.post(`/bypass-verification/${event_id}/${disc_id}/${user_id}`);
//     return response.data;
//   } catch (error: any) {
//     console.error("Failed to bypass verification:", error);
//     throw new Error(error.response?.data?.message || "Failed to bypass verification");
//   }
// };

// // ================== STUDENT REPORT APIS ================== //

/**
 * Get comprehensive student report
 * Shows all registered events with performance data
 */
export const getStudentReport = async (user_id: number) => {
  try {
    const response = await api.get(`/get-student-report/${user_id}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to get student report:", error);
    throw new Error(error.response?.data?.message || "Failed to get student report");
  }
};

// // ================== EXAM MONITORING COORDINATION APIS ================== //

/**
 * Check if monitoring is properly coordinated between phone and desktop
 */
export const checkMonitoringCoordination = async (
  event_id: string,
  disc_id: string,
  user_id: string
) => {
  try {
    const response = await api.get(`/check-monitoring-coordination/${event_id}/${disc_id}/${user_id}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to check monitoring coordination:", error);
    throw new Error(error.response?.data?.message || "Failed to check monitoring coordination");
  }
};

/**
 * Force sync monitoring state between frontend and backend
 */
export const syncMonitoringState = async (
  event_id: string,
  disc_id: string,
  user_id: string,
  state: {
    warning_count: number;
    monitoring_paused: boolean;
    game_terminated: boolean;
  }
) => {
  try {
    const response = await api.post(`/sync-monitoring-state/${event_id}/${disc_id}/${user_id}`, state);
    return response.data;
  } catch (error: any) {
    console.error("Failed to sync monitoring state:", error);
    throw new Error(error.response?.data?.message || "Failed to sync monitoring state");
  }
};

// // ================== UTILITY FUNCTIONS ================== //

/**
 * Clean up monitoring resources
 * Call when exam is completed or component unmounts
 */
export const cleanupMonitoring = async (
  event_id: string,
  disc_id: string,
  user_id: string
) => {
  try {
    const response = await api.post(`/cleanup-monitoring/${event_id}/${disc_id}/${user_id}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to cleanup monitoring:", error);
    // Don't throw error here as cleanup might fail if connection is already closed
    return { success: false, error: error.message };
  }
};

/**
 * Get real-time monitoring statistics
 */
export const getMonitoringStats = async (
  event_id: string,
  disc_id: string,
  user_id: string
) => {
  try {
    const response = await api.get(`/monitoring-stats/${event_id}/${disc_id}/${user_id}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to get monitoring stats:", error);
    throw new Error(error.response?.data?.message || "Failed to get monitoring stats");
  }
};

/**
 * Validate monitoring configuration
 * Ensures all required parameters are set before starting monitoring
 */
export const validateMonitoringConfig = async (
  event_id: string,
  disc_id: string,
  user_id: string,
  config: {
    enabled: boolean;
    requires_phone: boolean;
    requires_webcam: boolean;
  }
) => {
  try {
    const response = await api.post(`/validate-monitoring-config/${event_id}/${disc_id}/${user_id}`, config);
    return response.data;
  } catch (error: any) {
    console.error("Failed to validate monitoring config:", error);
    throw new Error(error.response?.data?.message || "Failed to validate monitoring config");
  }
};

// // ================== WEBSOCKET STATUS ================== //

/**
 * Check WebSocket connection status
 */
export const checkWebSocketStatus = async (discipline_id: string) => {
  try {
    const response = await api.get(`/status/${discipline_id}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to check WebSocket status:", error);
    throw new Error(error.response?.data?.message || "Failed to check WebSocket status");
  }
};
