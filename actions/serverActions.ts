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

export async function getAllUsers() {
  const response = await fetch(`${API_URL}/api/auth`, {
    next: {
      tags: ["users"],
    },
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
}

export async function getAllMessages() {
  const response = await fetch(`${API_URL}/messages`, {
    next: {
      tags: ["messages"],
    },
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
}
