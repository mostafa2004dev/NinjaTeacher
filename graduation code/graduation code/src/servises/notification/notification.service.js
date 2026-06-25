const BASE_URL = "http://localhost:3000";

function authHeaders() {
  const token = localStorage.getItem("userToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const getNotifications = async () => {
  try {
    const res = await fetch(`${BASE_URL}/notifications`, { headers: authHeaders() });
    const data = await res.json();
    return data.data?.notifications || [];   // ✅ تم التصحيح هنا
  } catch (err) {
    console.error("error fetching notifications:", err);
    return [];
  }
};

export const markAsRead = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error("error marking as read:", err);
  }
};

export const markAllAsRead = async () => {
  try {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error("error marking all as read:", err);
  }
};

export const deleteNotification = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/notifications/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error("error deleting notification:", err);
  }
};