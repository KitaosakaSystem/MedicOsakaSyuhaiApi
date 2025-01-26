import React, { useState , useEffect } from 'react';
import { 
  Bell, 
  Moon, 
  Smartphone, 
  Lock,
  ChevronRight, 
  Volume2,
  Languages,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { changeText } from '../../store/slice/headerTextSlice';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Settings = () => {

  // ヘッダー書き換え
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changeText('設定'))   
  })

  //社員に設定されたコースの検索--------------------------------------------
  const [loginName, setLoginName] = useState("");
  const [todayRoute,setTodayRoute] = useState("");
  const [routeNames, setRouteNames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // 初回レンダリング時にローカルストレージをチェック
    setTodayRoute(localStorage.getItem('todayRoute'));

    const fetchData = async () => {
      try {
        const docRef = doc(db, 'staff', '0002580');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log("検索",docSnap.data().name);
          setLoginName(docSnap.data().name);        
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

  // 設定の状態管理
  const [customers,setCustomers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleSubmit = () => {
    console.log('保存されたデータ:', { selectedCourse });
    localStorage.setItem('todayRoute', selectedCourse);
    setTodayRoute(localStorage.getItem('todayRoute'));
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