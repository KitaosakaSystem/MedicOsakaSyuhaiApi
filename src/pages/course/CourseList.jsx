import { useEffect, useState } from 'react';
import { MapPin, Clock, Building2, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { changeText } from '../../store/slice/headerTextSlice';
import { doc, getDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebase';

const CourseList = () => {

  const loginUserType =  localStorage.getItem('userType');
  const loginKyotenId =   localStorage.getItem('kyotenId');
  // actionを操作するための関数取得
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changeText('コース担当一覧'))
  })

  const [routes, setRoutes] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    // ドキュメントの変更を監視
    const routeRef = doc(db, 'routes', loginKyotenId);
    const unsubscribe = onSnapshot(routeRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();

        // 現在の日付を取得（YYYY-MM-DD形式）
        const today = new Date().toISOString().split('T')[0];

        const newRoutes = Object.entries(data)
          .sort(([keyA], [keyB]) => {
            const numA = parseInt(keyA.slice(1));
            const numB = parseInt(keyB.slice(1));
            return numA - numB;
          })
          .map(([key, value]) => ({
            id: key.toUpperCase(),
            name: value.login_date === today ? value.staff_name : '', 
            status: value.login_date === today ? 'online' : 'offline'
          }));

        // 重複を避けながらデータを更新
        setRoutes(prevRoutes => {
          const uniqueRoutes = [...prevRoutes, ...newRoutes].reduce((acc, route) => {
            acc[route.id] = route;
            return acc;
          }, {});
          return Object.values(uniqueRoutes);
        });
      }
    }, (error) => {
      console.error("Error fetching document:", error);
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []); // 空の依存配列でコンポーネントのマウント時にのみ実行
  
  return (
    <>
      {loginUserType === 'customer' ? (
        <div>社員専用画面</div>
      ):(
        <div className="flex-1 flex flex-col bg-sky-50">
        {/* コースリスト */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">

          <div className="space-y-2 rounded-lg  mb-4 overflow-hidden">
            <label className="text-base font-medium text-gray-700">拠点コード {loginKyotenId}</label>
          </div>

          {routes.map(route => (
            <div 
              key={route.id}
              className="bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="p-2">

                {/* 施設名とステータス */}
                <div className="flex justify-between items-start mb-1">
                  <h2 className="text-base font-medium">
                    {route.id + '>' + route.name}
                  </h2>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs ${
                      route.status === 'online' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {route.status === 'online' ? 'オンライン' : 'オフライン'}
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </>
  );
}

export default CourseList;