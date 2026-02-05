import config from "../config"

export const getProducts = async () => {
  try {
    const res = await fetch(`${config.BASE_URL}/products`)
    const json = await res.json()
    return json.data || []
  } catch (error) {
    console.error("Product API Error:", error)
    return []
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
