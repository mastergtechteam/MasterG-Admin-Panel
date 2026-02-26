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
