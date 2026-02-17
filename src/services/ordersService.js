import config from "../config"

export const getOrders = async () => {
  try {
    const res = await fetch(`${config.BASE_URL}/api/v1/order`)
    const json = await res.json()

    console.log("Orders API RESPONSE:", json)

    return Array.isArray(json.data) ? json.data : []
  } catch (error) {
    console.error("Orders API Error:", error)
    return []
  }
}

export const getOrdersByRetailer = async (retailerId) => {
  const res = await fetch(
    `${config.BASE_URL}/api/v1/order?retailerId=${retailerId}`
  )
  return res.json()
}
