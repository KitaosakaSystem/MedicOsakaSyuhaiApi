import { configureStore } from "@reduxjs/toolkit";
import headerTextReducer from "./slice/headerTextSlice";
import chatUserDataReducer from "./slice/chatUserDataSlice";
import authReducer from "./slice/authSlice";

export const store = configureStore({
  reducer: {
    header: headerTextReducer,
    chatUserData: chatUserDataReducer,
    auth: authReducer,
  },
});
