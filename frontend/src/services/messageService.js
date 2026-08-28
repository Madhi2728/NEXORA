import api from "./api";

// Async direct messaging (no real-time). See backend messageController.js.

export async function sendMessage({
  receiver_id,
  receiver_role,
  subject,
  body,
}) {
  const { data } = await api.post("/messages", {
    receiver_id,
    receiver_role,
    subject,
    body,
  });
  return data.message;
}

export async function getInbox(userId) {
  const { data } = await api.get(`/messages/${userId}`);
  return data.messages;
}

export async function getUnreadCount(userId) {
  const { data } = await api.get(`/messages/${userId}/unread-count`);
  return data.count;
}

export async function markRead(messageId) {
  const { data } = await api.patch(`/messages/${messageId}/read`);
  return data.message;
}
