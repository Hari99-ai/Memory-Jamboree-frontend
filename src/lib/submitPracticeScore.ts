import axios from "axios";
import { API_BASE_URL } from "./client";

const SCORE_ENDPOINT = `${API_BASE_URL}/student_test`;

interface SubmitScorePayload {
  user_id: number;
  disc_id: number;
  score: number;
}

export const submitPracticeScore = async ({ user_id, disc_id, score }: SubmitScorePayload) => {
  const token = sessionStorage.getItem("auth_token");

  if (!token) {
    throw new Error("❌ auth_token not found in localStorage");
  }

  const res = await axios.post(
    SCORE_ENDPOINT,
    { user_id, disc_id, score },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};
