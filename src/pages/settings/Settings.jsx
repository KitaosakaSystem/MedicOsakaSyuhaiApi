import React, { useState , useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { changeText } from '../../store/slice/headerTextSlice';
import { changeChatUserData } from '../../store/slice/chatUserDataSlice';
import { db } from '../../firebase';
import { addDoc, collection, doc, getDoc, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import ToggleSwitch from '../../components/ToggleSwitch';
import { changeLoginUserData } from '../../store/slice/loginUserDataSlice';
import { getTodayDate } from '../../utils/dateUtils'


const Settings = () => {

  // ヘッダー書き換え
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changeText('設定'))   
  })

  // store内の値を取得
  // todo:いらんやろし消す
  const userId = useSelector(state => state.loginUserData.loginUserId);
  const userName = useSelector(state => state.loginUserData.loginUserName);

  //社員に設定されたコースの検索--------------------------------------------
  const [loginName, setLoginName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loginUserType, setLoginUserType] = useState("");
  const [todayRoute,setTodayRoute] = useState("");
  const [routeNames, setRouteNames] = useState([]);
  const [loading, setLoading] = useState(true);

  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {

    console.log('設定画面')
    // 初回レンダリング時にローカルストレージをチェック
    const bufTodayRoute = localStorage.getItem('todayRoute');
    const bufLoginId = localStorage.getItem('userId')
    const bufUserType = localStorage.getItem('userType')
    // console.log("todayRoute",bufTodayRoute)
    // console.log("UserID",bufLoginId)
    // useStateの変数は関数内で値を設定しても、空白のままのようだ
    setTodayRoute(bufTodayRoute);
    setLoginId(bufLoginId);
    setLoginUserType(bufUserType);

    const fetchData = async () => {
      try {
        let docRef
        if(bufLoginId.length === 4){
          docRef = doc(db, 'customer', bufLoginId);
        }else{
          docRef = doc(db, 'staff', bufLoginId);
        }
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          //console.log("検索",docSnap.data().name);
          const bufLoginName = docSnap.data().name
          setLoginName(bufLoginName);
          dispatch(changeLoginUserData({userId:bufLoginId,userName:bufLoginName,todayRoute:bufTodayRoute}))   

          //スタッフ以外は下記コース設定は不要なので抜ける
          if (bufUserType !== 'staff') {
            return; 
          }
          const arrayField = docSnap.data().routes; // 配列フィールド名
          //console.log("配列",arrayField);
          const mappedArray = arrayField.map(item => ({
            id:item,
            name: item,
          }));
          setRouteNames(mappedArray);
          //console.log("コース",mappedArray)
        } else {
          console.log("ねーよ何も");
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }  finally {
        setLoading(false);
      }
    };
    fetchData();
  },[])


  //console.log("loginName",loginName);
   // チャットルーム作成
   const createChatRoom = async (routeId,schedule,chatRooms) => {
    try {
        const chatRoomData = {
            room_id: userId + '_' + schedule.customer_id,
            customer_id: schedule.customer_id,
            customer_name: schedule.name,
            staff_id: userId,
            pickup_status: "1",
            date: new Date().toISOString().split('T')[0],
            created_at: serverTimestamp(),
        };

        chatRooms.push(chatRoomData) //ローカルストレージ保管用に足していく
        // console.log("chat_Data",chatRoomData);
        // const docRef = doc(db, 'chat_rooms', userId + '_' + schedule.customer_id);
        // await setDoc(docRef, chatRoomData);
        //console.log('チャットルームが作成されました:', docRef.id);

    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
  };

  //　当日割り当てコースマスター取得
  const getCustomerSchedule = async (documentId) => {
    try {
      const docRef = doc(db, 'pickup_routes', documentId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Doc.Data()やでー",data)
        const mondaySchedule = data.schedule.monday;
        const chatRooms = [];
        mondaySchedule.forEach((schedule, index) => {
          console.log(`For Each Schedule ${index + 1}:`, schedule.customer_id + schedule.name  + " " + schedule.order);
          createChatRoom(documentId,schedule,chatRooms)          
        });

        //ローカルストレージに保管しておく
        console.log("ChaaaaatRoooooooooooms",chatRooms);
        localStorage.setItem('chatRooms', JSON.stringify(chatRooms));
        return mondaySchedule;
      } else {
        console.log('Document not found');
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  // 設定の状態管理---------------------------------------------------------------------
  const [customers,setCustomers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleBottomMarginChange = (enabled) => {
    //console.log('ボトムメニューマージン:', enabled ? '有効' : '無効');
  };

  const handleSubmit = () => {
    if (!selectedCourse){
      console.log('なんもえらんでへんさかいな');
      return;
    }
    console.log('保存されたデータ:', { selectedCourse });
    localStorage.setItem('todayRoute', selectedCourse);
    setTodayRoute(localStorage.getItem('todayRoute'));
    dispatch(changeLoginUserData({userId:loginId,userName:loginName,todayRoute:todayRoute}))
    
    const newData = {
      date: getTodayDate(), // YYYY-MM-DD形式
      todayRoute: selectedCourse
    };
    localStorage.setItem('todayRoute', JSON.stringify(newData));

    console.log('newData',newData);

    getCustomerSchedule('C62');
    //createChatRoom();
  };

  const handleLogout = () => {
    console.log('ログアウト処理');
    localStorage.setItem('userId', "");
    localStorage.setItem('userType', "");
    localStorage.setItem('todayRoute', '');
    localStorage.setItem('isAuthenticated', 'false');
    window.location.reload();   
  };

  if (loading) return <div>Loading...</div>;

  return (
    // <div className="min-h-screen bg-blue-50 p-8">
    <div className="flex flex-col h-screen overflow-y-auto  bg-gray-50">
      {/* <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg "> */}
      <div className="flex-1 overflow-y-auto p-4">

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-base font-medium text-gray-700">ユーザーID：</label>
            <label className="text-base font-medium text-gray-700">{loginId}</label>
          </div>
          <div className="space-y-2">
            <label className="text-base font-medium text-gray-700">ユーザー名：</label>
            <label className="text-base font-medium text-gray-700">{loginName}</label>
          </div>

          <div className="space-y-2">
            <label className="text-base font-medium text-gray-700">本日の担当コース：</label>
            <label className="text-base font-medium text-gray-700">{todayRoute}</label>
          </div>

          <div className="space-y-2">
            <label className="text-base font-medium text-gray-700">担当コース</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">コースを選択</option>
              {routeNames.map((route) => (
                <option key={route.id} value={route.name}>
                  {route.id}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 space-y-4">
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              設定を保存
            </button>

            <div className="pt-12 border-t mt-8">
              <ToggleSwitch
                label="ボトムメニューマージン有効"
                onChange={handleBottomMarginChange}
              />
            </div>

            
            <div className="pt-12 border-t mt-8">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;