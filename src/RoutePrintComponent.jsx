// RoutePrintComponent.jsx - ルート印刷用コンポーネント
import React, { useState, useEffect, useRef } from 'react';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const RoutePrintComponent = () => {
  // 状態の定義
  const [courseId, setCourseId] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coursesList, setCoursesList] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  // 印刷用のref
  const printRef = useRef(null);
  
  // 現在の日付
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}年${String(currentDate.getMonth() + 1).padStart(2, '0')}月${String(currentDate.getDate()).padStart(2, '0')}日`;

  // Firestoreの参照
  const db = getFirestore();
  
  // コンポーネントマウント時にコース一覧を取得
  useEffect(() => {
    fetchCoursesList();
  }, []);
  
  // コース一覧の取得
  const fetchCoursesList = async () => {
    try {
      setLoadingCourses(true);
      
      const coursesCollectionRef = collection(db, "pickup_routes");
      const querySnapshot = await getDocs(coursesCollectionRef);
      
      const courses = [];
      querySnapshot.forEach((doc) => {
        courses.push(doc.id);
      });
      
      // コースIDをソートして設定
      courses.sort();
      setCoursesList(courses);
      
    } catch (error) {
      console.error("Error fetching courses list:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  // ルートデータの取得
  const fetchRouteData = async () => {
    if (!courseId) {
      setError('コースIDを入力してください');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 指定されたコースIDのドキュメントを取得
      const docRef = doc(db, "pickup_routes", courseId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // データを正規化して保存
        const data = docSnap.data();
        setRouteData(normalizeScheduleData(data));
      } else {
        setError(`コースID「${courseId}」のルートデータが見つかりません`);
        setRouteData(null);
      }
    } catch (error) {
      console.error("Error fetching route data:", error);
      setError(`データの取得中にエラーが発生しました: ${error.message}`);
      setRouteData(null);
    } finally {
      setLoading(false);
    }
  };

  // スケジュールデータを正規化する関数
  const normalizeScheduleData = (data) => {
    if (!data || !data.schedule) return data;
    
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const customerMap = new Map();
    
    // 各曜日ごとに存在する顧客を正確に記録
    weekdays.forEach(day => {
      // その曜日のスケジュールがない場合はスキップ
      if (!data.schedule[day] || !Array.isArray(data.schedule[day])) {
        return;
      }
      
      // その曜日に存在する顧客を処理
      data.schedule[day].forEach(customer => {
        const id = String(customer.customer_id);
        
        // 顧客データをまだ保存していなければ初期化
        if (!customerMap.has(id)) {
          customerMap.set(id, {
            customer_id: id,
            name: customer.name || '',
            order: customer.order || 0,
            isRePickup: Boolean(customer.isRePickup),
            address: customer.address || '',
            phone: customer.phone || '',
            days: {
              monday: false,
              tuesday: false,
              wednesday: false,
              thursday: false,
              friday: false,
              saturday: false
            }
          });
        }
        
        // その曜日のフラグを設定
        customerMap.get(id).days[day] = true;
      });
    });
    
    // 通常集荷と再集荷顧客を分離
    const normalCustomers = [];
    const rePickupCustomers = [];
    
    customerMap.forEach(customer => {
      if (customer.isRePickup) {
        rePickupCustomers.push(customer);
      } else {
        normalCustomers.push(customer);
      }
    });
    
    // orderでソート
    normalCustomers.sort((a, b) => Number(a.order) - Number(b.order));
    rePickupCustomers.sort((a, b) => Number(a.order) - Number(b.order));
    
    // 日付順ではなく、連番にする
    normalCustomers.forEach((customer, index) => {
      customer.displayOrder = index + 1;
    });
    
    // 再集荷は51からスタート
    rePickupCustomers.forEach((customer, index) => {
      customer.displayOrder = 51 + index;
    });
    
    console.log('Normalized customers:', normalCustomers);
    console.log('Re-pickup customers:', rePickupCustomers);
    
    return {
      ...data,
      normalizedCustomers: normalCustomers,
      rePickupCustomers: rePickupCustomers
    };
  };

  // 印刷処理
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* 入力フォーム - 印刷時に非表示 */}
      <div className="p-6 bg-white rounded-lg shadow-md mb-8 print:hidden">
        <h1 className="text-2xl font-bold mb-4">コース確認表＿FIRESTORE読み込み</h1>
        
        <div className="mb-4">
          <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
            コースID
          </label>
          <div className="flex space-x-2">
            <input
              id="courseId"
              type="text"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="例: C62"
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              disabled={loadingCourses}
            >
              <option value="">コースを選択</option>
              {coursesList.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
          {loadingCourses && (
            <p className="mt-1 text-xs text-gray-500">コース一覧を読み込み中...</p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={fetchRouteData}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? '読み込み中...' : 'データ取得'}
            </button>
            
            <button
              onClick={fetchCoursesList}
              disabled={loadingCourses}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
              title="コース一覧を更新する"
            >
              ↻ 一覧更新
            </button>
          </div>
          
          {routeData && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              印刷
            </button>
          )}
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      {/* 印刷用コンテンツ */}
      {routeData && (
        <div ref={printRef} className="p-6 bg-white print:p-0">
          <style dangerouslySetInnerHTML={{
            __html: `
              @media print {
                body { font-family: 'MS Gothic', sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid black; padding: 5px; text-align: center; }
                th { background-color: #f0f0f0; }
                .title { text-align: center; font-size: 32px; margin: 20px 0; }
                .info { margin: 20px 0; font-size: 24px; }
                .check { font-family: 'MS Gothic'; }
              }
            `
          }} />
          
          <div className="title text-center text-3xl font-bold my-5">
            メディック web集配連絡システム　コース確認表
          </div>
          
          <div className="info my-5 text-xl">
            申請日: {formattedDate}<br />
            コース名: {courseId}<br />
          </div>
          
          {/* 通常集荷顧客テーブル */}
          <table className="w-full border-collapse mt-5">
            <thead>
              <tr>
                <th className="border border-gray-400 p-2 bg-gray-100">集配順</th>
                <th className="border border-gray-400 p-2 bg-gray-100">顧客コード</th>
                <th className="border border-gray-400 p-2 bg-gray-100">顧客名</th>
                <th className="border border-gray-400 p-2 bg-gray-100">月</th>
                <th className="border border-gray-400 p-2 bg-gray-100">火</th>
                <th className="border border-gray-400 p-2 bg-gray-100">水</th>
                <th className="border border-gray-400 p-2 bg-gray-100">木</th>
                <th className="border border-gray-400 p-2 bg-gray-100">金</th>
                <th className="border border-gray-400 p-2 bg-gray-100">土</th>
              </tr>
            </thead>
            <tbody>
              {routeData.normalizedCustomers.map((customer, index) => (
                <tr key={`normal-${index}`}>
                  <td className="border border-gray-400 p-2 text-center">{customer.order}</td>
                  <td className="border border-gray-400 p-2 text-center">{customer.customer_id}</td>
                  <td className="border border-gray-400 p-2 text-left">{customer.name}</td>
                  <td className="border border-gray-400 p-2 text-center">{customer.days.monday ? '✓' : ''}</td>
                  <td className="border border-gray-400 p-2 text-center">{customer.days.tuesday ? '✓' : ''}</td>
                  <td className="border border-gray-400 p-2 text-center">{customer.days.wednesday ? '✓' : ''}</td>
                  <td className="border border-gray-400 p-2 text-center">{customer.days.thursday ? '✓' : ''}</td>
                  <td className="border border-gray-400 p-2 text-center">{customer.days.friday ? '✓' : ''}</td>
                  <td className="border border-gray-400 p-2 text-center">{customer.days.saturday ? '✓' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* 再集荷顧客テーブル - 再集荷顧客がいる場合のみ表示 */}
          {routeData.rePickupCustomers.length > 0 && (
            <>
              <div className="info my-5 text-xl">
                別集配コースの再集配割り当て<br />
              </div>
              
              <table className="w-full border-collapse mt-5">
                <thead>
                  <tr>
                    <th className="border border-gray-400 p-2 bg-gray-100">集配順</th>
                    <th className="border border-gray-400 p-2 bg-gray-100">顧客コード</th>
                    <th className="border border-gray-400 p-2 bg-gray-100">顧客名</th>
                    <th className="border border-gray-400 p-2 bg-gray-100">月</th>
                    <th className="border border-gray-400 p-2 bg-gray-100">火</th>
                    <th className="border border-gray-400 p-2 bg-gray-100">水</th>
                    <th className="border border-gray-400 p-2 bg-gray-100">木</th>
                    <th className="border border-gray-400 p-2 bg-gray-100">金</th>
                    <th className="border border-gray-400 p-2 bg-gray-100">土</th>
                  </tr>
                </thead>
                <tbody>
                  {routeData.rePickupCustomers.map((customer, index) => (
                    <tr key={`repickup-${index}`}>
                      <td className="border border-gray-400 p-2 text-center">{customer.displayOrder}</td>
                      <td className="border border-gray-400 p-2 text-center">{customer.customer_id}</td>
                      <td className="border border-gray-400 p-2 text-left">{customer.name.padEnd(30, '　')}</td>
                      <td className="border border-gray-400 p-2 text-center">{customer.days.monday ? '✓' : ''}</td>
                      <td className="border border-gray-400 p-2 text-center">{customer.days.tuesday ? '✓' : ''}</td>
                      <td className="border border-gray-400 p-2 text-center">{customer.days.wednesday ? '✓' : ''}</td>
                      <td className="border border-gray-400 p-2 text-center">{customer.days.thursday ? '✓' : ''}</td>
                      <td className="border border-gray-400 p-2 text-center">{customer.days.friday ? '✓' : ''}</td>
                      <td className="border border-gray-400 p-2 text-center">{customer.days.saturday ? '✓' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          
          {/* 署名欄 */}
          <div className="mt-10 text-right">
            システム課_登録者: ________________ 印
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePrintComponent;