import { configureStore } from "@reduxjs/toolkit";
import headerTextReducer from "./slice/headerTextSlice";
import userDataReducer from "./slice/userDataSlice";

export const store = configureStore({
  reducer: {
    header: headerTextReducer,
    userData: userDataReducer,
  },
});
