const BASE_URL = "http://localhost:8000";

const getToken = () => localStorage.getItem("sh_token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const apiRegister = async (name, email, password) => {
  const res = await fetch(`${BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiLogin = async (email, password) => {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiGoogleAuth = async (access_token) => {
  const res = await fetch(`${BASE_URL}/users/google-auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiGetMe = async () => {
  const res = await fetch(`${BASE_URL}/users/me`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiDeleteAccount = async () => {
  const res = await fetch(`${BASE_URL}/users/me`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiUpdateProfile = async (name, password) => {
  const res = await fetch(`${BASE_URL}/users/me`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ 
      name, 
      ...(password ? { password } : {}) 
    }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

// ── Vehicles ──────────────────────────────────────────────────────────────────
export const apiGetAllVehicles = async (limit = 20) => {
  const res = await fetch(`${BASE_URL}/vehicles/?limit=${limit}`);
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiGetMyVehicles = async () => {
  const res = await fetch(`${BASE_URL}/vehicles/mine`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiCreateVehicle = async (vehicle) => {
  const res = await fetch(`${BASE_URL}/vehicles/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(vehicle),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiUpdateVehicle = async (id, updates) => {
  console.log("Sending update:", id, JSON.stringify(updates));
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiDeleteVehicle = async (id) => {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

// ── Uploads ───────────────────────────────────────────────────────────────────
export const apiUploadVehicleImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/uploads/vehicle-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const apiInitiatePayment = async (plan) => {
  const res = await fetch(`${BASE_URL}/payments/initiate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiVerifyPayment = async (reference) => {
  const res = await fetch(`${BASE_URL}/payments/verify/${reference}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiCancelSubscription = async () => {
  const res = await fetch(`${BASE_URL}/payments/cancel`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiGetMySubscription = async () => {
  const res = await fetch(`${BASE_URL}/payments/my-subscription`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};
// ── Notifications ─────────────────────────────────────────────────────────────
export const apiGetNotifications = async () => {
  const res = await fetch(`${BASE_URL}/notifications/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiMarkNotificationRead = async (id) => {
  const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiMarkAllNotificationsRead = async () => {
  const res = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};
// ── Admin ─────────────────────────────────────────────────────────────────────
export const apiAdminDashboard = async () => {
  const res = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

// ── Complaints ────────────────────────────────────────────────────────────────
export const apiSubmitComplaint = async (subject, category, message) => {
  const res = await fetch(`${BASE_URL}/complaints/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ 
      subject, 
      category, 
      message 
    }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiAdminGetUsers = async () => {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiAdminToggleUser = async (userId) => {
  const res = await fetch(`${BASE_URL}/admin/users/${userId}/toggle-status`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiAdminGetComplaints = async () => {
  const res = await fetch(`${BASE_URL}/admin/complaints`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiAdminResolveComplaint = async (complaintId) => {
  const res = await fetch(`${BASE_URL}/admin/complaints/${complaintId}/resolve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiAdminSendAnnouncement = async (title, message, audience) => {
  const res = await fetch(`${BASE_URL}/admin/announcements`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, message, audience }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiAdminGetSubscriptions = async () => {
  const res = await fetch(`${BASE_URL}/admin/subscriptions`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiAdminUpdatePrice = async (plan, price) => {
  const res = await fetch(`${BASE_URL}/admin/subscriptions/price`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ plan, price }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiAdminGetEmployees = async () => {
  const res = await fetch(`${BASE_URL}/admin/employees`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiAdminAddEmployee = async (name, email, section) => {
  const res = await fetch(`${BASE_URL}/admin/employees`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, email, section }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiAdminToggleEmployee = async (userId) => {
  const res = await fetch(`${BASE_URL}/admin/employees/${userId}/toggle`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const apiAdminMonthlyStats = async () => {
  const res = await fetch(`${BASE_URL}/admin/monthly-stats`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};