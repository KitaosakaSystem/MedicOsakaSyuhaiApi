import { createSlice } from "@reduxjs/toolkit";

export const chatRoomDataSlice = createSlice({
  // slice名
  name: "chatRoomData",
  // 内部で保持するデータ(キー:mess, 初期値:メッセージ)
  initialState: {
    customer_code: '',
    customer: [],
  },
  // 内部のデータにアクセスするための処理(処理名:sayhello)
  reducers: {
    addChatRoomData: (state, action) => {
        state.customer.push(action.payload);
    },
  },
});

// 外からインポートするためにactionとreducerをエクスポートする
export const { addChatRoomData } = chatRoomDataSlice.actions;
export default chatRoomDataSlice.reducer;
