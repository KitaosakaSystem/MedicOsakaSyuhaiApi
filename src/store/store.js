import { configureStore } from "@reduxjs/toolkit";
import headerTextReducer from "./slice/headerTextSlice";
import chatUserDataReducer from "./slice/chatUserDataSlice";
import authReducer from "./slice/authSlice";
import loginUserDataReducer from "./slice/loginUserDataSlice";
import chatRoomDataReducer from "./slice/chatRoomDataSlice";

export const store = configureStore({
  reducer: {
    header: headerTextReducer,
    chatUserData: chatUserDataReducer,
    loginUserData:loginUserDataReducer,
    auth: authReducer,
    chatRoomData:chatRoomDataReducer,
  },
});
