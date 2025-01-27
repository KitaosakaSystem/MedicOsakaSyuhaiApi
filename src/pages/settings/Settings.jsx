import React, { useState , useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { changeText } from '../../store/slice/headerTextSlice';
import { changeUserData } from '../../store/slice/userDataSlice';
import { db } from '../../firebase';
import { addDoc, collection, doc, getDoc, query, serverTimestamp, where } from 'firebase/firestore';
import ToggleSwitch from '../../components/ToggleSwitch';


const Settings = () => {

  // ヘッダー書き換え
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changeText('設定'))   
  })

  // store内の値を取得
  const userId = useSelector(state => state.userData.userId);
  const userName = useSelector(state => state.userData.userName);

  //社員に設定されたコースの検索--------------------------------------------
  const [loginName, setLoginName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loginUserType, setLoginUserType] = useState("");
  const [todayRoute,setTodayRoute] = useState("");
  const [routeNames, setRouteNames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // 初回レンダリング時にローカルストレージをチェック
    const bufTodayRoute = localStorage.getItem('todayRoute');
    const bufLoginId = localStorage.getItem('userId')
    // console.log("todayRoute",bufTodayRoute)
    // console.log("UserID",bufLoginId)
    // useStateの変数は関数内で値を設定しても、空白のままのようだ
    setTodayRoute(bufTodayRoute);
    setLoginId(bufLoginId);
    setLoginUserType(localStorage.getItem('userType'));

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
          dispatch(changeUserData({userId:bufLoginId,userName:bufLoginName}))   

          //スタッフ以外は下記コース設定は不要なので抜ける
          if (loginUserType !== 'staff') {
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

  //　コースマスター取得
  const getCustomerSchedule = async (documentId) => {
    try {
      const docRef = doc(db, 'pickup_routes', documentId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Doc.Data()やでー",data)
        const mondaySchedule = data.schedule.monday;
        mondaySchedule.forEach((schedule, index) => {
          console.log(`For Each Schedule ${index + 1}:`, schedule.customer_id + " " + schedule.order);
        });
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

  // チャットルーム作成
  const createChatRoom = async () => {
        try {
            const chatData = {
                room_id: "ch789",
                customer_id: "c111",
                staff_id: "s789",
                pickup_status: "1",
                date: new Date().toISOString().split('T')[0],
                created_at: serverTimestamp(),
            };

            console.log("chat_Data",chatData);
            const docRef = await addDoc(collection(db, 'chat_rooms'), chatData);
            console.log('チャットルームが作成されました:', docRef.id);

        } catch (error) {
            console.error('エラーが発生しました:', error);
        }
  };

  // 設定の状態管理---------------------------------------------------------------------
  const [customers,setCustomers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleBottomMarginChange = (enabled) => {
    console.log('ボトムメニューマージン:', enabled ? '有効' : '無効');
  };

  const handleSubmit = () => {
    console.log('保存されたデータ:', { selectedCourse });
    localStorage.setItem('todayRoute', selectedCourse);
    setTodayRoute(localStorage.getItem('todayRoute'));
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
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">

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

            <ToggleSwitch
              label="ボトムメニューマージン有効"
              onChange={handleBottomMarginChange}
            />
            
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