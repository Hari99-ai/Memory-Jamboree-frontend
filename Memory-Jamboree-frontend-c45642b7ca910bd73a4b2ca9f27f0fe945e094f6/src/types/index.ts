/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  status?: string;
  fname?: string;
  lname?: string;
  email: string;
}

export interface ResetPassData {
  email:string;
  otp:string;
  password?:string;
}

export interface setPasswordData {
  email:string;
  password?:string;
}

export interface Plan {
  amount: number;
  duration: number;
  sfeatures?: string | null;
  smid?: number;
  sname: string;
  status: boolean;
  discount_percent: number;
  status_message: string;
  final_amount?: number;
  stripe_price_id?: string | null;
  stripe_product_id?: string | null;
  total_active_members: number;
  onUpdate?: () => void;
  onDelete?: () => void;
  onStatus?: () => void;
}

export interface PaymentData {
  email: string;
  fname: string;
  plan_period_start: string; 
  plan_period_end: string;   
  duration: number;
  smid: number;
}

type Score = {
  disc_id:number;
  raw_score:number;
  score:number;
  rank:number;
  time_taken?:number;
}


// export interface UserBase {
  
// }

export interface RegisterUserInput  {
  role: string;
  id: number;
  fname?: string;
  lname?: string;
  gender: string;
  birth_date: string;
  email: string;
  mobile?: string;
  fa_name?: string;
  fa_mobile?: string;
  fa_email?: string;
  mo_name?: string;
  mo_mobile?: string;
  mo_email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  school_name?: string;
  school_class?: string;
  password: string;
  image: string | File | null;
  scores?: Score[]
  ename?:string;
  overall_rank?: number;
  rank?:number;
  total_score?:number;
  event_overall_rank?:number;
  category_overall_rank?:number;
  emonitored?:number;
  status?:number;
}



export interface UserEventDetails {
  event_id: number;
  user_id: number;
  ename: string;
  finalscore: string;
  calc_score: string;
  category_name: string;
  category_rank: number | null;
  overall_rank: number | null;
  created_at: string;
  discipline_scores: {
    discipline_name: string;
    score: number;
  }[];
}


export interface UserDetails {
  user: RegisterUserInput; // not an array, it's a single user object
  events: UserEventDetails[];     // array of event objects
}

// export interface CreateUserInput extends UserBase{
//   id?:number;
// }

export interface PracticeTestRecord {
  createdat: string
  discipline_name: string | null
  score: string
}

export interface UserAssesmentRespone  {
  finalscore:number;
  calc_score:number;
  time_taken?:number;
  createdat:string;
  events: EventData[]
}


export interface RegisterUserResponse {
  message: string;
  access_token: string;
  user_id: string;
}

export interface EventData {
  user_registered: unknown;
  event_id?:number;
  ename:string;
  eimage: File | string;
  event_start:string;
  event_end:string;
  estatus:number;
  category:string[];
  participants:string[];
  disciplines:string[];
  school_participants?: string[];
  user_participants?:string;
  etype?:number;
  is_participating:number;
  isPlaceholder?:boolean; 
  emonitored?:number;
}

export interface PasswordChangeData {
  password:string;
  newPassword:string;
}

export type Discipline = {
  disc_id: number;
  discipline_name: string;
  status?:number
};

export type UserCategory = {
  category_id:number;
  category:string;
  class_ranges:string[];
  users: User[]
}


export interface OverallData {
  user: RegisterUserInput[]
}

export type EventDetailsResponse = {
  etype(etype: any): string;
  emonitored: number;
  event_id: number;
  eimage:string;
  event_name: string;
  event_start: string;
  event_end: string;
  estatus: number;
  disciplines: Discipline[];
  category: CategoryMasterData[];
  school_participants:SchoolsMasterData[];
  user_participants:number;
  users_by_category: UserCategory[];
  overall_users: OverallData[]
};


export interface SchoolsMasterData {
  school_id:number;
  school_name:string;
  country:string;
  city:string;
  state:string;
}

export interface ClassMasterData {
  class_id?:number;
  class_name:string
}

export interface CategoryMasterData {
  cat_id:number
  category_name: string; 
  classes?:string;
}

export interface DisciplineData {
  disc_id?:number;
  discipline_name:string;
  formula:string;
  status?:number;
  standard:number;
  wstatus?:number;
}

export interface VerifyFaceInput {
  userId: string;
  webcam_image: string;
}

export interface AssesmentData {
  cand_id:number;
  event_id:number;
  disc_id:number;
  calc_score:number;
  result:string;
  face_status?:VerifyFaceInput[];
  finalscore:number;
  created_at:string;
  time_taken?:string;
}

export interface MonitoringData {
  folders?: any;
  user_id: string;
  email?:string;
  event_name?:string;
  event_id: string;
  disciplines?:any
  discipline_id: string;
  discipline_name?:string;
  user_movements_updown?: string; 
  user_movements_lr?: string;
  user_movements_eyes?: string;
  voice_db?: number;
  phone_detection?:number;
  img_log?: string;               
  log_time?: string;  
  external_img?: string;         
}

export interface ImagesData {
  id:number;
  filename:string;
}

export interface WindowData {
  transaction_log: string;
  wid?:number;
  user_id:number;
  discipline_id:number;
  window_event:number;
}

export interface MessageData {
  name:string;
  email:string;
  message:string;
  userType:string;
}

export interface KeyboardEventData {
  kid?:number;
  user_id:number;
  discipline_id:number;
  keyboard_event:string;
  transaction_log:string; 
}

export interface WindowLogs {
  logs:WindowData[]
  key_logs: KeyboardEventData[]
}

export interface WindowData {
  wid?:number;
  user_id:number;
  discipline_id:number;
  window_event:number;
}

export interface MessageData {
  name:string;
  email:string;
  message:string;
  userType:string;
}

export interface PhoneSendData  {
  email:string;
  event_id:string;
  disc_id:string;
}