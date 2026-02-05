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
