import axios from "axios"
import config from "../config"

export const getApiAnalytics = async (range) => {
  try {

    const res = await axios.get(
      `${config.BASE_URL}/admin/api-analytics`,
      {
        params: { range }
      }
    )

    return res.data

  } catch (error) {

    console.error("Analytics Service Error:", error)

    return {
      totalRequests: 0,
      successRate: 0,
      errors4xx: 0,
      errors5xx: 0,
      avgLatency: 0,
      totalErrors: 0,
      errorRate: 0,
    }

  }
}