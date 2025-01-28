import { createSlice } from "@reduxjs/toolkit";

export const loginUserDataSlice = createSlice({
  // slice名
  name: "loginUserData",
  // 内部で保持するデータ(キー:mess, 初期値:メッセージ)
  initialState: {
    loginUserId: "",
    loginUserName: "",
    loginTodayRoute:"",
  },
  // 内部のデータにアクセスするための処理(処理名:sayhello)
  reducers: {
    changeLoginUserData: (state, action) => {
      state.loginUserId = action.payload.userId;
      state.loginUserName = action.payload.userName;
      state.loginTodayRoute = action.payload.todayRoute;
    },
  },
});

// 外からインポートするためにactionとreducerをエクスポートする
export const { changeLoginUserData } = loginUserDataSlice.actions;
export default loginUserDataSlice.reducer;
