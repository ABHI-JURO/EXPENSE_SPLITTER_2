import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const recordSettlement = createAsyncThunk(
  "settlements/record",
  async ({ group_id, paid_to, amount }) => {
    const res = await axiosInstance.post("/settlements", {
      group_id,
      paid_to,
      amount,
    });
    return res.data; // { settlement_id }
  },
);

const settlementsSlice = createSlice({
  name: "settlements",
  initialState: {
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(recordSettlement.pending, (state) => {
        state.status = "loading";
      })
      .addCase(recordSettlement.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(recordSettlement.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default settlementsSlice.reducer;
