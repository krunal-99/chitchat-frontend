"use server";
import { API_URL } from "@/constants/constants";
import { RegisteredUserData } from "@/utils/validationSchema";

export async function handleRegister(userData: RegisteredUserData) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  return data;
}

export async function handleLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  return data;
}

export async function getAllUsers(token: string) {
  const response = await fetch(`${API_URL}/api/auth`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
}

export async function getMessages(token: string, selectedUserId: number) {
  try {
    const response = await fetch(
      `${API_URL}/messages?selectedUserId=${selectedUserId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      status: "error",
      message: "Failed to fetch messages",
    };
  }
}

export async function getAIChatResponse(
  message: string,
  chatHistory: Array<{ role: string; content: string }> = []
) {
  try {
    const res = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, chatHistory }),
    });
    if (!res.ok || !res.body) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    return res.body;
  } catch (error) {
    console.error("Error fetching AI chat response:", error);
    throw new Error("AI request failed");
  }
}
