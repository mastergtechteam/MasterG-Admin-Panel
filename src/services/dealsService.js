import config from "../config"


export const getDeals = async () => {
    try {
      const res = await fetch(`${config.BASE_URL}/deals`)
      const json = await res.json()
  
    //   console.log("DEALS API RESPONSE:", json) 
  
      return Array.isArray(json) ? json : []
    } catch (error) {
      console.error("Deals API Error:", error)
      return []
    }
  }
  

export const getDealsById = async (id) => {
    try {
      const res = await fetch(`${config.BASE_URL}/deals/${id}`)
  
      if (!res.ok) {
        throw new Error("Failed to fetch Deals")
      }
  
      return await res.json()
    } catch (error) {
      console.error("GET Deals ERROR:", error)
      return { success: false, message: error.message }
    }
  }
  
  
export const deleteDeals = async (id) => {
  try {
    await fetch(`${config.BASE_URL}/deals/${id}`, { method: "DELETE" })
    return true
  } catch (error) {
    console.error("Delete Error:", error)
    return false
  }
}


export const createDeals = async (data) => {
  try {
    const res = await fetch(`${config.BASE_URL}/deals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })

    const json = await res.json()

    if (!res.ok) {
      throw new Error(json.message || "Failed to create Deals")
    }

    return json
    
  } catch (error) {
    console.error("CREATE Deals ERROR:", error)
    return { success: false, message: error.message }
  }
}


export const updateDeals = async (id, data) => {
  try {
    const res = await fetch(`${config.BASE_URL}/deals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })

    const json = await res.json()

    if (!res.ok) {
      throw new Error(json.message || "Failed to update Deals")
    }

    return json
  } catch (error) {
    console.error("UPDATE Deals ERROR:", error)
    return { success: false, message: error.message }
  }
}


  export const toggleIsBanner = async (id, status) => {
    try {
      const res = await fetch(`${config.BASE_URL}/deals/isBanner/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      return res.ok
    } catch (err) {
      console.error("Status toggle error:", err)
      return false
    }
  }
  
