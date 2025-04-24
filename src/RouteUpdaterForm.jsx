// RouteUpdaterForm.jsx - ルート更新フォームコンポーネント
import React, { useState, useRef } from 'react';
import { getFirestore, doc, setDoc, getDoc, collection } from 'firebase/firestore';
import Papa from 'papaparse';

const RouteUpdaterForm = () => {
  // フォーム入力用の状態
  const [courseId, setCourseId] = useState('');
  const [kyotenCode, setKyotenCode] = useState('');
  const [routeKyotenId, setRouteKyotenId] = useState('');
  
  // 処理状態管理用の状態
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // CSV一括登録のための状態
  const [csvFile, setCsvFile] = useState(null);
  const [csvProcessing, setCsvProcessing] = useState(false);
  const [csvResults, setCsvResults] = useState({ success: 0, failed: 0, total: 0 });
  const [csvLogs, setCsvLogs] = useState([]);
  const fileInputRef = useRef(null);
  
  // Firebase Firestoreの参照
  const db = getFirestore();
  
  // 手動ルート更新の処理
  const handleManualUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      // 入力検証
      if (!courseId) {
        throw new Error('コースIDを入力してください');
      }
      
      if (!routeKyotenId) {
        throw new Error('拠点IDを入力してください');
      }
      
      // 拠点IDが数値であることを確認
      const kyotenIdNumber = parseInt(routeKyotenId);
      if (isNaN(kyotenIdNumber)) {
        throw new Error('拠点IDは数値を入力してください');
      }
      
      // ルートの更新（サンプルデータ）
      const docRef = doc(db, "pickup_routes", courseId);
      
      // スケジュールデータの作成（大阪府の住所を追加）
      const customerSchedule = [
        {
          customer_id: "7998",
          isRePickup: false,
          name: "メディック",
          order: 1,
          address: "大阪府大阪市北区梅田3-1-3",
          phone: "06-1234-5678"
        },
        {
          customer_id: "8340",
          isRePickup: false,
          name: "牧野",
          order: 2,
          address: "大阪府大阪市中央区心斎橋筋2-6-14",
          phone: "06-8765-4321"
        }
      ];
      
      // 全曜日に同じスケジュールを適用
      const scheduleData = {
        monday: customerSchedule,
        tuesday: customerSchedule,
        wednesday: customerSchedule,
        thursday: customerSchedule,
        friday: customerSchedule,
        saturday: customerSchedule
      };
      
      // データの更新（kyoten_idを数値型で保存）
      await setDoc(docRef, {
        kyoten_id: kyotenIdNumber,
        schedule: scheduleData
      }, { merge: true });
      
      // 成功状態の設定
      setSuccess(true);
      
      // フォームのリセット
      setCourseId('');
      setRouteKyotenId('');
      
    } catch (error) {
      console.error("Update error:", error);
      setError(error.message || 'ルート更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // CSVファイル選択の処理
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
    }
  };
  
  // CSVファイルを読み込んでバイナリとして返す（Shift-JIS対応のため）
  const readFileAsBinary = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };
  
  // CSV一括登録の処理
  const handleCsvUpload = async () => {
    if (!csvFile) {
      setError('CSVファイルを選択してください');
      return;
    }
    
    setCsvProcessing(true);
    setError('');
    setCsvLogs([]);
    setCsvResults({ success: 0, failed: 0, total: 0 });
    
    try {
      const buffer = await readFileAsBinary(csvFile);
      
      // Shift-JISをデコードするための処理
      const decoder = new TextDecoder('shift-jis');
      const text = decoder.decode(buffer);
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // 数値を自動的に変換
        complete: async (results) => {
          const { data } = results;
          
          if (!data || data.length === 0) {
            setError('CSVファイルにデータがありません');
            setCsvProcessing(false);
            return;
          }
          
          // ヘッダーチェック
          const firstRow = data[0];
          const requiredFields = ['course_id', 'customer_code', 'customer_name', 'kyoten_code', 'delivery_order'];
          const missingFields = requiredFields.filter(field => !firstRow.hasOwnProperty(field));
          
          if (missingFields.length > 0) {
            setError(`CSVファイルに必要なカラムがありません: ${missingFields.join(', ')}`);
            setCsvProcessing(false);
            return;
          }
          
          let successCount = 0;
          let failedCount = 0;
          const logs = [];
          
          // ルート情報を格納するオブジェクト
          const routesData = {};
          
          // 各コースIDごとのスケジュールとkyoten_idを格納するオブジェクト
          const courseData = {};
          
          // 一度CSVデータを解析して、各コースIDごとに顧客データを整理
          for (const row of data) {
            const courseId = row.course_id && String(row.course_id).trim();
            const kyotenCode = row.kyoten_code;
            
            if (!courseId) {
              continue;
            }
            
            // 拠点コードが数値であることを確認
            let kyotenCodeNumber = parseInt(kyotenCode);
            if (isNaN(kyotenCodeNumber)) {
              // 数値ではない場合はログに記録して次へ
              logs.push({
                courseId,
                status: '警告',
                message: `コース「${courseId}」の拠点コードが数値ではありません: ${kyotenCode}`
              });
              // デフォルト値として21を使用（または別の適切な値）
              kyotenCodeNumber = 21;
            }
            
            // ルートデータを追加
            if (!routesData[kyotenCodeNumber]) {
              routesData[kyotenCodeNumber] = {};
            }
            
            if (!routesData[kyotenCodeNumber][courseId]) {
              routesData[kyotenCodeNumber][courseId] = {
                staff_id: "", // CSVにスタッフ情報がなければ空白に
                staff_name: ""
              };
            }
            
            // コーススケジュールのオブジェクトを初期化
            if (!courseData[courseId]) {
              courseData[courseId] = {
                kyoten_id: kyotenCodeNumber,
                schedule: {
                  monday: [],
                  tuesday: [],
                  wednesday: [],
                  thursday: [],
                  friday: [],
                  saturday: []
                }
              };
            }
            
            // delivery_order を使用してorderフィールドを設定
            // 値が存在しない場合はデフォルト値として0を使用
            const orderValue = row.delivery_order !== undefined && row.delivery_order !== null
              ? parseInt(row.delivery_order)
              : 0;
            
            // 顧客データを作成（アドレスフィールドを含む）
            const customerData = {
              customer_id: row.customer_code,
              name: row.customer_name,
              isRePickup: row.saisyuhai_flag === 1, // 数値型に変換されているので === 1 で比較
              order: orderValue,  // start_dateの代わりにdelivery_orderを使用
              phone: row.phone || "", // CSVにphone列がある場合はそれを使用、なければ空白
              address: row.address || "" // CSVにaddress列がある場合はそれを使用、なければ空白
            };
            
            // 各曜日のスケジュールに顧客を追加
            if (row.monday_flag === 1) {
              courseData[courseId].schedule.monday.push({...customerData});
            }
            
            if (row.tuesday_flag === 1) {
              courseData[courseId].schedule.tuesday.push({...customerData});
            }
            
            if (row.wednesday_flag === 1) {
              courseData[courseId].schedule.wednesday.push({...customerData});
            }
            
            if (row.thursday_flag === 1) {
              courseData[courseId].schedule.thursday.push({...customerData});
            }
            
            if (row.friday_flag === 1) {
              courseData[courseId].schedule.friday.push({...customerData});
            }
            
            if (row.saturday_flag === 1) {
              courseData[courseId].schedule.saturday.push({...customerData});
            }
          }
          
          // 各拠点のルート情報を更新
          for (const kyotenId in routesData) {
            try {
              const routesDocRef = doc(db, "routes", kyotenId.toString());
              await setDoc(routesDocRef, routesData[kyotenId], { merge: true });
              logs.push({
                courseId: "全コース",
                status: '成功',
                message: `拠点コード「${kyotenId}」のルート情報を更新しました`
              });
              successCount++;
            } catch (error) {
              logs.push({
                courseId: "全コース",
                status: '失敗',
                message: `拠点コード「${kyotenId}」のルート情報更新に失敗: ${error.message}`
              });
              failedCount++;
            }
          }
          
          // 各コースのスケジュールを更新
          for (const courseId in courseData) {
            try {
              const pickupRouteRef = doc(db, "pickup_routes", courseId);
              
              // 曜日ごとにデータを並べ替え
              for (const day in courseData[courseId].schedule) {
                // orderフィールドに基づいて昇順にソート
                courseData[courseId].schedule[day].sort((a, b) => a.order - b.order);
              }
              
              // kyoten_idと一緒にスケジュール情報を更新
              await setDoc(pickupRouteRef, {
                kyoten_id: courseData[courseId].kyoten_id,
                schedule: courseData[courseId].schedule
              }, { merge: true });
              
              logs.push({
                courseId,
                status: '成功',
                message: `コース「${courseId}」を更新しました（拠点ID: ${courseData[courseId].kyoten_id}）`
              });
              successCount++;
            } catch (error) {
              logs.push({
                courseId,
                status: '失敗',
                message: `コース「${courseId}」の更新に失敗: ${error.message}`
              });
              failedCount++;
            }
          }
          
          setCsvResults({
            success: successCount,
            failed: failedCount,
            total: Object.keys(courseData).length + 1 // ルート情報 + 各コース
          });
          setCsvLogs(logs);
          
          // ファイル選択をリセット
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setCsvFile(null);
        },
        error: (error) => {
          setError(`CSVファイルの解析に失敗しました: ${error.message}`);
        }
      });
    } catch (error) {
      setError(`ファイルの読み込みに失敗しました: ${error.message}`);
    } finally {
      setCsvProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ルート更新
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="font-medium">更新完了!</span>
            <span className="block sm:inline"> コース「{courseId}」のルートが更新されました。</span>
          </div>
        )}
        
        {/* 手動ルート更新フォーム */}
        <form className="mt-8 space-y-6" onSubmit={handleManualUpdate}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                コースID (必須)
              </label>
              <input
                id="courseId"
                name="courseId"
                type="text"
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="例: C62"
              />
            </div>
            
            <div>
              <label htmlFor="routeKyotenId" className="block text-sm font-medium text-gray-700 mb-1">
                拠点ID (必須・数値)
              </label>
              <input
                id="routeKyotenId"
                name="routeKyotenId"
                type="number"
                required
                value={routeKyotenId}
                onChange={(e) => setRouteKyotenId(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="例: 21"
              />
              <p className="mt-1 text-xs text-gray-500">
                数値形式で入力してください
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? '処理中...' : 'テストデータで更新'}
            </button>
          </div>
          
          {success && (
            <div className="text-sm text-center mt-4">
              <button 
                onClick={() => setSuccess(false)} 
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                別のコースを更新する
              </button>
            </div>
          )}
          
          <div className="mt-4 bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-700">
              <span className="font-bold">注意: </span>
              このフォームでは、数値型の拠点ID (kyoten_id) を pickup_routes コレクションのドキュメントに保存します。
              拠点IDは数値として Firestore に保存されます。
            </p>
          </div>
        </form>
        
        {/* CSV一括更新セクション */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">CSV一括更新</h3>
          <p className="text-sm text-gray-600 mb-4">
            ルート情報のCSVファイルをアップロードして、複数のコースを一括更新できます。
          </p>
          
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSVファイルを選択
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                必須カラム: course_id, customer_code, customer_name, kyoten_code, delivery_order
              </p>
              <p className="mt-1 text-xs text-gray-500">
                曜日フラグ: monday_flag, tuesday_flag, wednesday_flag, thursday_flag, friday_flag, saturday_flag
              </p>
              <p className="mt-1 text-xs text-gray-500">
                オプションカラム: address, phone
              </p>
              <p className="mt-1 text-xs text-gray-700 font-medium">
                注意: CSVファイルはShift-JISエンコードで保存してください
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">重要な処理内容</h4>
              <ul className="list-disc pl-5 text-xs text-yellow-700 space-y-1">
                <li>CSVファイルの kyoten_code 値は数値型の kyoten_id としてFirestoreに保存されます</li>
                <li>CSVファイルの delivery_order 値は顧客データの order フィールドとして保存されます</li>
                <li>各コースは拠点コードに基づいてグループ化され、routes/ドキュメントに追加されます</li>
                <li>各コースのスケジュールは pickup_routes/ ドキュメントに保存されます</li>
                <li>各曜日のスケジュールは order フィールドに基づいて昇順にソートされます</li>
                <li>CSVファイルに address フィールドがある場合、その値が各曜日のスケジュールの顧客データに保存されます</li>
                <li>CSVファイルに phone フィールドがある場合、その値も各曜日のスケジュールの顧客データに保存されます</li>
              </ul>
            </div>
            
            <button
              type="button"
              onClick={handleCsvUpload}
              disabled={csvProcessing || !csvFile}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                csvProcessing || !csvFile ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              {csvProcessing ? '処理中...' : 'CSVから一括更新'}
            </button>
          </div>
          
          {/* CSV処理結果 */}
          {csvResults.total > 0 && (
            <div className="mt-4">
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">処理結果</h4>
                <div className="flex space-x-4 mb-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-500">合計:</span> {csvResults.total}件
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-green-500">成功:</span> {csvResults.success}件
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-red-500">失敗:</span> {csvResults.failed}件
                  </div>
                </div>
                
                {csvLogs.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">コースID</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">結果</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メッセージ</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {csvLogs.map((log, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap text-xs">{log.courseId}</td>
                            <td className={`px-3 py-2 whitespace-nowrap text-xs ${
                              log.status === '成功' ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {log.status}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{log.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteUpdaterForm;