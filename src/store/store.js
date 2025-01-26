import { configureStore } from "@reduxjs/toolkit";
import headerTextReducer from "./slice/headerTextSlice";
import userDataReducer from "./slice/userDataSlice";
import authReducer from "./slice/authSlice";

export const store = configureStore({
  reducer: {
    header: headerTextReducer,
    userData: userDataReducer,
    auth: authReducer,
  },
});
