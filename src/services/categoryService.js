import config from "../config"

export const getCategories = async () => {
  try {
    const res = await fetch(`${config.BASE_URL}/categories`)
    const json = await res.json()
    return json.data || []
  } catch (error) {
    console.error("Category API Error:", error)
    return []
  }
}

export const deleteCategory = async (id) => {
  try {
    await fetch(`${config.BASE_URL}/categories/${id}`, {
      method: "DELETE",
    })
    return true
  } catch (error) {
    console.error("Delete Category Error:", error)
    return false
  }
}

export const createCategory = async (payload) => {
  try {
    const res = await fetch(`${config.BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    return json
  } catch (error) {
    console.error("Create Category Error:", error)
    return null
  }
}

export const updateCategory = async (id, payload) => {
  try {
    const res = await fetch(`${config.BASE_URL}/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    return json
  } catch (error) {
    console.error("Update Category Error:", error)
    return null
  }
}

export const toggleCategoryStatus = async (id, status) => {
    try {
      await fetch(`${config.BASE_URL}/categories/status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }
