export const fetchEventHistory = async () => {
  const res = await fetch("/api/history/events") // replace with actual endpoint
  return res.json()
}
