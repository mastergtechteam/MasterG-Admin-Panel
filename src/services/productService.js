import config from "../config"

export const getProducts = async ({
    pageSize = 10,
    lastKey = null,
    categoryId = null
  } = {}) => {
    try {
      const params = new URLSearchParams()
  
      params.append("pageSize", pageSize)
  
      if (lastKey) {
        params.append("lastKey", lastKey)
      }
  
      if (categoryId) {
        params.append("categoryId", categoryId)
      }
  
      const res = await fetch(
        `${config.BASE_URL}/products?${params.toString()}`
      )
  
      const json = await res.json()
  
      return json // ✅ full response (data + pagination)
  
    } catch (error) {
      console.error("Product API Error:", error)
      return {
        success: false,
        data: [],
        pagination: {}
      }
    }
  }
  

export const getProductById = async (id) => {
    try {
      const res = await fetch(`${config.BASE_URL}/products/${id}`)
  
      if (!res.ok) {
        throw new Error("Failed to fetch product")
      }
  
      return await res.json()
    } catch (error) {
      console.error("GET PRODUCT ERROR:", error)
      return { success: false, message: error.message }
    }
  }
  
  
export const deleteProduct = async (id) => {
  try {
    await fetch(`${config.BASE_URL}/products/${id}`, { method: "DELETE" })
    return true
  } catch (error) {
    console.error("Delete Error:", error)
    return false
  }
}


export const createProduct = async (data) => {
  try {
    const res = await fetch(`${config.BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })

    const json = await res.json()

    if (!res.ok) {
      throw new Error(json.message || "Failed to create product")
    }

    return json
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error)
    return { success: false, message: error.message }
  }
}


export const updateProduct = async (id, data) => {
  try {
    const res = await fetch(`${config.BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })

    const json = await res.json()

    if (!res.ok) {
      throw new Error(json.message || "Failed to update product")
    }

    return json
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error)
    return { success: false, message: error.message }
  }
}


  export const toggleProductStatus = async (id, status) => {
    try {
      const res = await fetch(`${config.BASE_URL}/products/status/${id}`, {
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
  
