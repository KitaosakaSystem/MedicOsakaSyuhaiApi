import { createSlice } from "@reduxjs/toolkit";

export const userDataSlice = createSlice({
  // slice名
  name: "userData",
  // 内部で保持するデータ(キー:mess, 初期値:メッセージ)
  initialState: {
    userId: "",
    userName: "",
  },
  // 内部のデータにアクセスするための処理(処理名:sayhello)
  reducers: {
    changeUserData: (state, action) => {
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
    },
  },
});

// 外からインポートするためにactionとreducerをエクスポートする
export const { changeUserData } = userDataSlice.actions;
export default userDataSlice.reducer;
