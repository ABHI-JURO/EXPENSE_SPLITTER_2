import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import groupsReducer from "../features/groups/groupsSlice";
import expensesReducer from "../features/expenses/expensesSlice";
import balancesReducer from "../features/balances/balancesSlice";
import settlementsReducer from "../features/settlements/settlementsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
    expenses: expensesReducer,
    balances: balancesReducer,
    settlements: settlementsReducer,
  },
});
