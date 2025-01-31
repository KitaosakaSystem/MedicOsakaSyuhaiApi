import { useEffect, useState } from 'react';
import { MapPin, Clock, Building2, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { changeText } from '../../store/slice/headerTextSlice';

const CourseList = () => {

  const loginUserType = useSelector(state => state.loginUserData.loginUserType);

  // actionを操作するための関数取得
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changeText('コース担当一覧'))
  })

  // サンプルデータ
  const routes = [
    {
      id: 'C61',
      name: 'システム：福井',
      status: 'online'
    },
    {
      id: 'C62',
      name: '',
      status: 'offline'
    },
    {
      id: 'C63',
      name: '北営業：中野　良一',
      status: 'online'
    },
    // スクロールをテストするためのダミーデータ
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `C6${i + 4}`,
      name: `北営業：${i + 1}`,
      status: i % 2 === 0 ? 'online' : 'offline'
    }))
  ];

  const [selectedCourse, setSelectedCourse] = useState(null);

  const [selectedId, setSelectedId] = useState('21');
  const customerIds = ['21', '22', '23'];

  return (
    <>
      {loginUserType === 'customer' ? (
        <div>社員専用画面</div>
      ):(
        <div className="flex-1 flex flex-col bg-sky-50">
        {/* コースリスト */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">

          <div className="space-y-2 rounded-lg  mb-4 overflow-hidden">
            <label className="text-base font-medium text-gray-700">拠点コード</label>
              <select 
                value={selectedId} 
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {customerIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
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