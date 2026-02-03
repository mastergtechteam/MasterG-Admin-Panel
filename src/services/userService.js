import config from "../config"

export const getUsers = async () => {
  try {
    const response = await fetch(`${config.BASE_URL}/auth/users`)
    const data = await response.json()
    return data.data.users
  } catch (error) {
    console.error("API Error:", error)
    return []
  }
}
