import config from "../config";

// 🔹 GET
export const getAppConfig = async () => {
  try {
    const res = await fetch(`${config.BASE_URL}/app-config`);
    const data = await res.json();
    return data.data || {};
  } catch (err) {
    console.error("AppConfig GET Error:", err);
    return {};
  }
};

// 🔹 SAVE
export const saveAppConfig = async (payload) => {
  try {
    const res = await fetch(`${config.BASE_URL}/admin/app-config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: payload }),
    });
    return await res.json();
  } catch (err) {
    console.error("AppConfig SAVE Error:", err);
    return { success: false };
  }
};