// import axios from "axios";
import { api } from "./client";

// const SCORE_ENDPOINT = "https://aidev.gravitinfosystems.com:5000/student_test";

interface SubmitScorePayload {
  user_id: number;
  disc_id: number;
  score: number;
}

export const submitScore = async ({ user_id, disc_id, score }: SubmitScorePayload) => {
  const token = sessionStorage.getItem("auth_token");

  if (!token) {
    throw new Error("❌ auth_token not found in localStorage");
  }

  const res = await api.post(
    "/student_test",
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
