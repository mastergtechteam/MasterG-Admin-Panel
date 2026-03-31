import config from "../config"

// 🔹 ADMIN - GET all time slots
export const getTimeSlots = async () => {
  try {
    const res = await fetch(`${config.IMPORT_API}/admin/time-slots`)
    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error("TimeSlots API Error:", error)
    return []
  }
}

// 🔹 ADMIN - CREATE + UPDATE + TOGGLE (UPSERT)
export const saveTimeSlots = async (payload) => {
  try {
    const res = await fetch(`${config.IMPORT_API}/admin/time-slots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    return await res.json()
  } catch (error) {
    console.error("Save TimeSlots Error:", error)
    return { success: false }
  }
}

// 🔹 USER - only active slots (app use karega)
export const getUserTimeSlots = async () => {
  try {
    const res = await fetch(`${config.IMPORT_API}/time-slots`)
    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error("User TimeSlots Error:", error)
    return []
  }
}