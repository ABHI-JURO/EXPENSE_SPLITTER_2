import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }) => {
    const res = await axiosInstance.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    return res.data.user;
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async ({ name, email, password }) => {
    const res = await axiosInstance.post("/auth/register", {
      name,
      email,
      password,
    });
    localStorage.setItem("token", res.data.token);
    return res.data.user;
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
