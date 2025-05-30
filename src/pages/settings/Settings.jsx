import React, { useState , useEffect } from 'react';
import { LogOut, Download, Smartphone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { changeText } from '../../store/slice/headerTextSlice';
import { changeChatUserData } from '../../store/slice/chatUserDataSlice';
import { db } from '../../firebase';
import { addDoc, collection, doc, getDoc, getDocs, deleteDoc, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import ToggleSwitch from '../../components/ToggleSwitch';
import { changeLoginUserData } from '../../store/slice/loginUserDataSlice';
import { getTodayDate } from '../../utils/dateUtils'
import { useAuth } from '../../authservice/AuthContext';
import { signOut } from '../../authservice/authService';
import { getMessaging, getToken } from 'firebase/messaging';
import { app } from '../../firebase'; // firebaseの初期化インスタンスをインポート


const Settings = () => {

  // ヘッダー書き換え
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changeText('設定'))   
  })

  // store内の値を取得
  // todo:いらんやろし消す
  const loginUserId = useSelector(state => state.loginUserData.loginUserId);
  const loginUserName = useSelector(state => state.loginUserData.loginUserName);
  const loginUserType = useSelector(state => state.loginUserData.loginUserType);
  const loginTodayRouteId = useSelector(state => state.loginUserData.loginTodayRouteId);
 
  //社員に設定されたコースの検索--------------------------------------------
  const [todayRoute,setTodayRoute] = useState("");
  const [routeNames, setRouteNames] = useState([]);
  const [loading, setLoading] = useState(true);

  const [chatRooms, setChatRooms] = useState([]);
  // 選択されたコースをテキストボックスに表示するための状態
  const [routeTextInput, setRouteTextInput] = useState("");

  // PWA関連の状態管理
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPWAButton, setShowPWAButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState('');
  const [pwaDebugInfo, setPwaDebugInfo] = useState('');

  const getCurrentDayOfWeek = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDate = new Date();
    return days[currentDate.getDay()]; // 0 (日曜日) から 6 (土曜日) の数値を返すので、それをインデックスとして使用
  };

  // PWA関連の初期化
  useEffect(() => {
    // デバイス情報の取得
    const userAgent = navigator.userAgent;
    let deviceType = '';
    
    if (/iPad/.test(userAgent)) {
      deviceType = 'iPad';
    } else if (/iPhone/.test(userAgent)) {
      deviceType = 'iPhone';
    } else if (/iPod/.test(userAgent)) {
      deviceType = 'iPod';
    } else if (/Android/.test(userAgent)) {
      if (/Mobile/.test(userAgent)) {
        deviceType = 'Android スマートフォン';
      } else {
        deviceType = 'Android タブレット';
      }
    } else if (/Windows/.test(userAgent)) {
      deviceType = 'Windows PC';
    } else if (/Mac/.test(userAgent)) {
      deviceType = 'Mac';
    } else if (/Linux/.test(userAgent)) {
      deviceType = 'Linux PC';
    } else {
      deviceType = 'その他のデバイス';
    }
    
    // ブラウザ情報も追加
    let browserType = '';
    if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
      browserType = 'Chrome';
    } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
      browserType = 'Safari';
    } else if (/Firefox/.test(userAgent)) {
      browserType = 'Firefox';
    } else if (/Edge/.test(userAgent)) {
      browserType = 'Edge';
    } else {
      browserType = 'その他のブラウザ';
    }
    
    setDeviceInfo(`${deviceType} (${browserType})`);

    // iOSの検出
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // スタンドアローンモード（既にインストール済み）の検出
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    // PWAデバッグ情報の作成
    let debugInfo = [];
    debugInfo.push(`isIOS: ${isIOSDevice}`);
    debugInfo.push(`isStandalone: ${isStandaloneMode}`);
    debugInfo.push(`display-mode: ${window.matchMedia('(display-mode: standalone)').matches}`);
    debugInfo.push(`navigator.standalone: ${window.navigator.standalone}`);
    debugInfo.push(`deferredPrompt: ${deferredPrompt ? 'あり' : 'なし'}`);
    debugInfo.push(`showPWAButton: ${showPWAButton}`);
    
    // Manifest検出
    const manifestLink = document.querySelector('link[rel="manifest"]');
    debugInfo.push(`manifest: ${manifestLink ? 'あり' : 'なし'}`);
    
    // Service Worker検出
    debugInfo.push(`serviceWorker: ${'serviceWorker' in navigator ? 'サポート' : '非サポート'}`);
    
    // HTTPS検出
    debugInfo.push(`HTTPS: ${location.protocol === 'https:' || location.hostname === 'localhost'}`);
    
    setPwaDebugInfo(debugInfo.join(' | '));

    // Android用のPWAインストールイベント
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt イベントが発生しました');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAButton(true);
      
      // デバッグ情報を更新
      setPwaDebugInfo(prev => prev + ' | beforeinstallprompt: 発生');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOSの場合、スタンドアローンでなければボタンを表示
    if (isIOSDevice && !isStandaloneMode) {
      setShowPWAButton(true);
    }

    // 5秒後にデバッグ情報を更新（beforeinstallpromptが来ない場合の確認用）
    setTimeout(() => {
      setPwaDebugInfo(prev => {
        if (!prev.includes('beforeinstallprompt: 発生')) {
          return prev + ' | beforeinstallprompt: 未発生';
        }
        return prev;
      });
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt, showPWAButton]);

  // PWAインストール処理
  const handlePWAInstall = async () => {
    if (isIOS) {
      // iOS用の案内を表示
      alert(`iPhoneでアプリのようにホーム画面に追加するには：\n\n1. Safari下部の共有ボタン📤をタップ\n2. 「ホーム画面に追加」をタップ\n3. 右上の「追加」をタップ\n\nホーム画面にアプリアイコンが表示されます！`);
    } else if (deferredPrompt) {
      // Android用のインストール
      try {
        const { outcome } = await deferredPrompt.prompt();
        console.log(`PWA install prompt was: ${outcome}`);
        
        if (outcome === 'accepted') {
          console.log('PWAがインストールされました');
          alert('アプリがホーム画面に追加されました！');
        }
        
        setDeferredPrompt(null);
        setShowPWAButton(false);
      } catch (error) {
        console.error('PWAインストールエラー:', error);
        alert('インストールに失敗しました。もう一度お試しください。');
      }
    }
  };

  useEffect(() => {

    //社員の定型ルートIdセットを読み込む----------------------------
    const data = localStorage.getItem('selectRouteIds');
    if (data) {
      const selectRouteIds = JSON.parse(data);
      // console.log(selectRouteIds);
      const mappedArray = selectRouteIds.map(item => ({
        id:item.id,
        name: item.name,
      }));
      setRouteNames(mappedArray);
      console.log("ローカルから読んだので、FireStoreから読み込む必要ないので（節約!!!)")
      setLoading(false);
      return; //ローカルから読んだので、FireStoreから読み込む必要ないので（節約!!!)
    }

    const fetchData = async () => {
      try {
        let docRef
        if(loginUserId.length === 4){
          //docRef = doc(db, 'customer', loginUserId);
          return; //スタッフ以外は下記コース設定は不要なので抜ける
        }else{
          docRef = doc(db, 'staff', loginUserId);
        }
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {

          const arrayField = docSnap.data().routes; // 配列フィールド名
          //console.log("配列",arrayField);
          const mappedArray = arrayField.map(item => ({
            id:item,
            name: item,
          }));
          setRouteNames(mappedArray);
          localStorage.setItem('selectRouteIds', JSON.stringify(mappedArray));
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



  //ルートマスター割り当て
  const updateOrCreateStaffData = async (documentId, fieldName, staffData) => {
    try {
      const docRef = doc(db, 'routes', String(documentId));
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        // ドキュメントが存在する場合、既存のデータを保持しながら更新
        const existingData = docSnap.data();
        await setDoc(docRef, {
          ...existingData,
          [fieldName]: staffData
        });
      } else {
        // ドキュメントが存在しない場合、新規作成
        await setDoc(docRef, {
          [fieldName]: staffData
        });
      }
      console.log('Document successfully updated/created');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // チャットルーム作成
const createChatRoom = async (routeId, schedule, chatRooms) => {
  try {
    // Document ID to be created
    const newDocId = loginUserId + '_' + schedule.customer_id;
    
    // First, check if a document with the same staff_id exists and delete it
    const chatRoomsCollection = collection(db, 'chat_rooms');
    const q = query(chatRoomsCollection, where("staff_id", "==", loginUserId));
    
    // Get all documents where staff_id matches loginUserId
    const querySnapshot = await getDocs(q);
    
    // Delete each matching document
    const deletePromises = [];
    querySnapshot.forEach((document) => {
      //console.log("To Delete document.id",document.id)
      const docRef = doc(db, 'chat_rooms', document.id);
      deletePromises.push(deleteDoc(docRef));
      console.log('Deleting existing chat room:', document.id);
    });
    
    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    
    // Now create the new chat room
    const chatRoomData = {
      room_id: newDocId,
      customer_id: schedule.customer_id,
      customer_name: schedule.name,
      staff_id: loginUserId,
      staff_name: loginUserName,
      pickup_status: "1",
      isRePickup: schedule.isRePickup,
      address: schedule.address,
      phone: schedule.phone,
      date: new Date().toISOString().split('T')[0],
      created_at: serverTimestamp(),
    };

    chatRooms.push(chatRoomData); // ローカルストレージ保管用に足していく
    console.log("chatRoomData>", chatRoomData);
    
    const docRef = doc(db, 'chat_rooms', newDocId);
    await setDoc(docRef, chatRoomData);
    console.log('チャットルームが作成されました:', docRef.id);

    return chatRoomData; // 作成したデータを返す

  } catch (error) {
    console.error('エラーが発生しました:', error);
    throw error; // エラーを伝播させる
  }
};

  // 当日割り当てコースマスター取得
const getCustomerSchedule = async (documentId) => {
  try {
    const docRef = doc(db, 'pickup_routes', documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // 現在の曜日を取得
      const currentDay = getCurrentDayOfWeek();
      console.log("本日の曜日>",currentDay);
      // data.schedule[currentDay]で実行時の曜日に対応するスケジュールを取得
      const todaySchedule = data.schedule[currentDay];
      const chatRooms = [];

      if (!todaySchedule) {
        console.log(`本日(${currentDay})のスケジュールがありません`);
        return null;
      }

      // すべてのcreateRoomの処理が完了するのを待つ
      const createRoomPromises = todaySchedule.map((schedule, index) => {
        console.log(`For Each Schedule ${index + 1}:`, schedule.customer_id + schedule.name + " " + schedule.order);
        // createChatRoomの戻り値（Promise）を返す
        return createChatRoom(documentId, schedule, chatRooms);
      });

      // すべての処理が完了するのを待つ
      await Promise.all(createRoomPromises);

      // すべてのチャットルーム作成が完了してからlocalStorageに保存
      console.log("Add LocalStorage ChatRooms", chatRooms);
      localStorage.setItem('chatRooms', JSON.stringify(chatRooms));

      // コースマスター登録
      const newStaffData = {
        staff_id: loginUserId,
        staff_name: loginUserName,
        login_date: new Date().toISOString().split('T')[0]
      };
      updateOrCreateStaffData(data.kyoten_id, documentId, newStaffData);

      return todaySchedule;
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

  // ドロップダウンの選択変更時の処理
  const handleCourseChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedCourse(selectedValue);
    setRouteTextInput(selectedValue);
  };

  const handleSubmit = () => {
    if (!selectedCourse && !routeTextInput){
      console.log('なんも選んでへんさかいな、それはあかんわ');
      return;
    }

    if (routeTextInput === loginTodayRouteId){
      console.log('同じ選んでるさかいな、あかんで');
      alert('登録中のコースと同じコースを選択しています\n不具合がある場合は、再ログインしてからコースを設定してください。')
      return;
    }
   
    const newData = {
      date: getTodayDate(), // YYYY-MM-DD形式
      todayRoute: routeTextInput
    };
    localStorage.setItem('todayRoute', JSON.stringify(newData));

    dispatch(changeLoginUserData({userId:loginUserId,
      userName:loginUserName,
      userType:loginUserType,
      todayRouteId:routeTextInput}))

    console.log("Delete LocalStorage ChatRooms");
    localStorage.setItem('chatRooms', '');

    //曜日ごとのコース一覧を読んでチャットルーム立てる
    getCustomerSchedule(routeTextInput);

  };

  const handleLogout = () => {
    console.log('ログアウト処理');
    localStorage.setItem('userId', "");
    localStorage.setItem('userName', "");
    localStorage.setItem('userType', "");
    localStorage.setItem('todayRoute', '');
    localStorage.setItem('chatRooms', '');
    localStorage.setItem('selectRouteIds','')
    localStorage.setItem('isAuthenticated', 'false');
    signOut();
    window.location.reload();   
  };

  // 通知許可とFCMトークン取得
  const handleNotificationPermission = async () => {
    try {
      // 通知許可をリクエスト
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('通知が許可されました');
        
        // FCMメッセージングオブジェクトを取得
        const messaging = getMessaging(app);
        
        // FCMトークンを取得
        const token = await getToken(messaging, { 
          vapidKey:import.meta.env.VITE_APP_FIREBASE_VAPID_KEY
        });
        
        if (token) {
          console.log('FCMトークン取得成功:', token);
          
          // usersコレクションにトークンを保存
          const userCollectionName = loginUserType === 'customer' ? 'customer' : 'staff';
          const userDocRef = doc(db, userCollectionName, loginUserId);
          await updateDoc(userDocRef, {
            fcmToken: token,
            tokenUpdatedAt: serverTimestamp()
          });
          
          console.log('FCMトークンをFirestoreに保存しました');
          alert('通知の設定が完了しました');
        } else {
          console.log('FCMトークンの取得に失敗しました');
          alert('通知の設定に失敗しました。もう一度お試しください。');
        }
      } else {
        console.log('通知が拒否されました');
        alert('通知が拒否されました。ブラウザの設定から通知を許可してください。');
      }
    } catch (error) {
      console.error('通知設定エラー:', error);
      alert('通知の設定中にエラーが発生しました。');
    }
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
            <label className="text-base font-medium text-gray-700">{loginUserId}</label>
          </div>
          <div className="space-y-2">
            <label className="text-base font-medium text-gray-700">ユーザー名：</label>
            <label className="text-base font-medium text-gray-700">
              {loginUserType === 'customer' ? `${loginUserName} 様` : loginUserName}
            </label>
          </div>
          <div className="space-y-2">
            <label className="text-base font-medium text-gray-700">デバイス：</label>
            <label className="text-sm text-gray-600">{deviceInfo}</label>
          </div>
          <div className="space-y-2">
            <label className="text-base font-medium text-gray-700">PWAデバッグ情報：</label>
            <label className="text-xs text-gray-500 break-all">{pwaDebugInfo}</label>
          </div>

          {loginUserType !== 'customer' && (
            <>
              <div className="space-y-2">
                <label className="text-base font-medium text-gray-700">本日の担当コース：</label>
                <label className="text-base font-medium text-gray-700">{loginTodayRouteId}</label>
              </div>

              <div className="space-y-2">
                <label className="text-base font-medium text-gray-700">担当コース</label>
                <select
                  value={selectedCourse}
                  onChange={handleCourseChange}
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

              {/* テキストボックスを追加 */}
              <div className="space-y-2">
                <label className="text-base font-medium text-gray-700">選択したコース</label>
                <input
                  type="text"
                  value={routeTextInput}
                  onChange={(e) => setRouteTextInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="選択したコースが表示されます"
                />
              </div>

              <div className="pt-4 space-y-4">
                <button
                  onClick={handleSubmit}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  設定を保存
                </button>
              </div>
            </>
          )}

            <div className="pt-12 border-t mt-8">
              <ToggleSwitch
                label="ボトムメニューマージン有効"
                onChange={handleBottomMarginChange}
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleNotificationPermission}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                通知を許可する
              </button>
            </div>

            {/* PWAインストールボタン */}
            {showPWAButton && !isStandalone && (
              <div className="pt-4">
                <button
                  onClick={handlePWAInstall}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center gap-2"
                >
                  {isIOS ? <Smartphone className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  {isIOS ? 'ホーム画面に追加' : 'アプリをインストール'}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {isIOS 
                    ? 'ホーム画面からアプリのように起動できます' 
                    : 'ホーム画面にアプリアイコンを追加します'
                  }
                </p>
              </div>
            )}

            {/* 既にインストール済みの場合の表示 */}
            {isStandalone && (
              <div className="pt-4">
                <div className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-md flex items-center justify-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  アプリとして起動中
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  このアプリは既にホーム画面に追加されています
                </p>
              </div>
            )}
            
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
  );
};

export default Settings;