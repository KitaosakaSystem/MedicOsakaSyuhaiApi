import { configureStore } from "@reduxjs/toolkit";
import headerTextReducer from "./slice/headerTextSlice";

export const store = configureStore({
  reducer: {
    header: headerTextReducer,
  },
});
