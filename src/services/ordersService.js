import config from "../config"

export const getOrders = async ({ pageSize = 10, lastKey = null } = {}) => {
  try {
    const url = `${config.BASE_URL}/api/v1/order?pageSize=${pageSize}${
      lastKey ? `&lastKey=${lastKey}` : ""
    }`

    const res = await fetch(url, {
      headers: {
        "X-App-Type": "pro"
      }
    })

    const json = await res.json()

    console.log("Orders API RESPONSE:", json)

    return json // 🔥 pura response return karo
  } catch (error) {
    console.error("Orders API Error:", error)
    return { success: false, data: [] }
  }
}

export const getOrdersByRetailer = async (retailerId) => {
  const res = await fetch(
    `${config.BASE_URL}/api/v1/order?retailerId=${retailerId}`,
    {
      headers: {
        "X-App-Type": "pro"
      }
    }
  )
  return res.json()
}

export const updateOrderStatus = async ({
  orderId,
  newStatus,
  remark,
  changedBy = "ADMIN"
}) => {
  try {
    const res = await fetch(
      `${config.BASE_URL}/api/v1/order/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          newStatus,
          remark,
          changedBy
        })
      }
    )

    return await res.json()
  } catch (err) {
    console.error("Update Order Status Error:", err)
    throw err
  }
}
