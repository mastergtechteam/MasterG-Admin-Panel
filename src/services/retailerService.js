import config from "../config"

export const getRetailers = async () => {
  try {
    const res = await fetch(`${config.BASE_URL}/retailers`)
    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error("Retailer API Error:", error)
    return []
  }
}

export const getRetailerById = async (id) => {
    try {
      const res = await fetch(`${config.BASE_URL}/retailers/${id}`)
      return await res.json()
    } catch (error) {
      console.error("Get Retailer Error:", error)
      return { success: false }
    }
  }

  export const createRetailer = async (payload) => {
    try {
      const res = await fetch(`${config.BASE_URL}/retailers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      return await res.json()
    } catch (error) {
      console.error("Create Retailer Error:", error)
      return { success: false }
    }
  }

  export const updateRetailer = async (id, payload) => {
    try {
      const res = await fetch(`${config.BASE_URL}/retailers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      return await res.json()
    } catch (error) {
      console.error("Update Retailer Error:", error)
      return { success: false }
    }
  }

export const deleteRetailer = async (id) => {
  try {
    await fetch(`${config.BASE_URL}/retailers/${id}`, {
      method: "DELETE",
    })
    return true
  } catch (error) {
    console.error("Delete Error:", error)
    return false
  }
}
