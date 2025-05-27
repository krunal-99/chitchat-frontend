import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: number;
    user_name: string;
    email: string;
    image_url: string;
  } | null;
  token: string | null;
}

const storedToken =
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

const initialState: AuthState = {
  isAuthenticated: !!storedToken,
  user: null,
  token: storedToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ user: AuthState["user"]; token: string }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", action.payload.token);
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
