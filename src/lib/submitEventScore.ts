// src/lib/submitEventScore.ts

import { API_BASE_URL } from "./client"

// Interface for score submission request
interface ScoreSubmissionRequest {
  event_id: number
  calc_score: number
  disc_id: number
  time_taken?: string // New field for recall phase timing
  // Optional fields for termination case, as requested
  status?: number
  iscomplete?: number
}

// Interface for score submission response
interface ScoreSubmissionResponse {
  result: {
    iscomplete: number
    disc_id: number
    discipline_name: string
    status?: number
  }
}

// Interface for completed disciplines from GET /iscompleted
interface CompletedDiscipline {
  disc_id: number
  discipline_name: string
  iscomplete: number
  status?: number
  wstatus?: number
}

// Helper to get auth token from sessionStorage
function getAuthToken(): string | null {
  return sessionStorage.getItem("auth_token")
}

/**
 * Submit event score - Modified
 * POST /create-assesment
 * This function now supports an `isTerminated` option. When true, it sends
 * status=0 and iscomplete=0 to the backend. For a successful submission,
 * it sends iscomplete=1.
 * @param {number} event_id - The ID of the event.
 * @param {number} calc_score - The calculated score for the discipline.
 * @param {number} disc_id - The ID of the discipline.
 * @param {object} [options] - Optional parameters.
 * @param {boolean} [options.isTerminated] - Set to true if the discipline was automatically terminated.
 * @param {string} [options.timeTaken] - The time taken for recall phase in format "5min:10sec".
 * @returns {Promise<ScoreSubmissionResponse>} - The response from the server.
 */
export async function submitEventScore(
  event_id: number,
  calc_score: number,
  disc_id: number,
  options?: { isTerminated?: boolean; timeTaken?: string },
): Promise<ScoreSubmissionResponse> {
  try {
    const token = getAuthToken()
    if (!token) throw new Error("Authentication token missing from sessionStorage.")

    const requestData: ScoreSubmissionRequest = {
      event_id,
      calc_score,
      disc_id,
    }

    // Add time_taken if provided
    if (options?.timeTaken) {
      requestData.time_taken = options.timeTaken
      console.log("⏱️ Including recall time in submission:", options.timeTaken)
    }

    // Per the new requirement:
    if (options?.isTerminated) {
      // For automatic termination, keep iscomplete as 0.
      requestData.iscomplete = 0
      requestData.status = 0 // Keep status as 0 for termination
      console.log("📤 Submitting as automatic termination with iscomplete: 0", requestData)
    } else {
      // For a successful, voluntary submission, set iscomplete to 1.
      requestData.iscomplete = 1
      console.log("📤 Submitting as successful completion with iscomplete: 1", requestData)
    }

    console.log("📤 POST /create-assesment request:", requestData)

    const response = await fetch(`${API_BASE_URL}/create-assesment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Score submission failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`Failed to submit score: ${response.status} ${response.statusText}`)
    }

    const result: ScoreSubmissionResponse = await response.json()
    console.log("✅ Score submitted successfully:", result)

    return result
  } catch (error) {
    console.error("❌ Error submitting event score:", error)
    throw error
  }
}

/**
 * Get completed disciplines for a user in an event
 * GET /iscompleted?event_id={event_id}&cand_id={cand_id}
 */
export async function getCompletedDisciplines(event_id: number, cand_id: string): Promise<CompletedDiscipline[]> {
  try {
    const token = getAuthToken()
    if (!token) throw new Error("Authentication token missing from sessionStorage.")

    const url = `${API_BASE_URL}/iscompleted?event_id=${event_id}&cand_id=${cand_id}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Failed to fetch completed disciplines:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`Failed to fetch completed disciplines: ${response.status} ${response.statusText}`)
    }

    const result: CompletedDiscipline[] = await response.json()
    console.log("✅ Completed disciplines fetched:", result)
    return result
  } catch (error) {
    console.error("❌ Error fetching completed disciplines:", error)
    return [] // Return empty array on error
  }
}

/**
 * MODIFICATION: Check if a specific discipline is marked as completed.
 * This function now ONLY checks the `iscomplete` flag from the /iscompleted endpoint data.
 * The combined logic with `status` and `wstatus` is now handled in the EventView component.
 * @param {CompletedDiscipline[]} completedDisciplines - Array of completed disciplines.
 * @param {number} disc_id - The ID of the discipline to check.
 * @returns {boolean} - True if the discipline is considered completed.
 */
export function isDisciplineAttempted(completedDisciplines: CompletedDiscipline[], disc_id: number): boolean {
  const discipline = completedDisciplines.find((d) => d.disc_id === disc_id)

  if (!discipline) {
    return false // If no record found, it's not attempted.
  }

  // A discipline is considered "attempted" if the user has completed it.
  const isComplete = discipline.iscomplete === 1

  console.log(`🔍 Checking completion status for disc_id ${disc_id}:`, {
    iscomplete: discipline.iscomplete,
    isComplete,
  })

  return isComplete
}

/**
 * Submit score and mark discipline as completed.
 */
export async function submitScoreAndMarkComplete(
  event_id: number,
  calc_score: number,
  disc_id: number,
  timeTaken?: string,
): Promise<ScoreSubmissionResponse> {
  console.log("🎯 Submitting score and marking as complete:", { event_id, calc_score, disc_id, timeTaken })
  // A standard call to this function implies a successful completion, not a termination.
  return submitEventScore(event_id, calc_score, disc_id, { isTerminated: false, timeTaken })
}
