import config from "../config"


const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      // "data:image/jpeg;base64,xxxx" → only base64 part
      const base64 = reader.result.split(",")[1]
      resolve(base64)
    }
    reader.onerror = (error) => reject(error)
  })

export const uploadToS3 = async (file,fileName) => {
  const base64Content = await fileToBase64(file)

  const res = await fetch(
    `${config.BASE_URL}/utils/upload`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileContent: base64Content,
        fileName,
        fileType: file.type,
        userId: "admin", // ya logged-in userId
      }),
    }
  )

  const json = await res.json()

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Upload failed")
  }

  return json.data.publicUrl
}
