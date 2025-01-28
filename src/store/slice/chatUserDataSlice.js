import { createSlice } from "@reduxjs/toolkit";

export const chatUserDataSlice = createSlice({
  // slice名
  name: "chatUserData",
  // 内部で保持するデータ(キー:mess, 初期値:メッセージ)
  initialState: {
    chatUserId: "",
    chatUserName: "",
  },
  // 内部のデータにアクセスするための処理(処理名:sayhello)
  reducers: {
    changeChatUserData: (state, action) => {
      state.chatUserId = action.payload.userId;
      state.chatUserName = action.payload.userName;
    },
  },
});

// 外からインポートするためにactionとreducerをエクスポートする
export const { changeChatUserData } = chatUserDataSlice.actions;
export default chatUserDataSlice.reducer;
