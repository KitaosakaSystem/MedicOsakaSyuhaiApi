import { useEffect, useState } from 'react';
import { MapPin, Clock, Building2, ChevronRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { changeText } from '../../store/slice/headerTextSlice';

const CourseList = () => {

    // actionを操作するための関数取得
    const dispatch = useDispatch();
    useEffect(() => {
      dispatch(changeText('コース担当一覧'))
    })

  // サンプルデータ
  const courses = [
    {
      id: 1,
      name: '東京エリアA',
      timeSlot: '午前',
      facilities: [
        { name: '東京中央病院', time: '9:00-10:00', status: '未訪問' },
        { name: '新宿メディカルセンター', time: '10:30-11:30', status: '完了' },
        { name: '渋谷クリニック', time: '13:00-14:00', status: '未訪問' }
      ]
    },
    {
      id: 2,
      name: '東京エリアB',
      timeSlot: '午後',
      facilities: [
        { name: '品川総合病院', time: '14:30-15:30', status: '未訪問' },
        { name: '大崎病院', time: '16:00-17:00', status: '未訪問' }
      ]
    },
    {
      id: 3,
      name: '横浜エリア',
      timeSlot: '終日',
      facilities: [
        { name: '横浜総合病院', time: '9:30-10:30', status: '未訪問' },
        { name: 'みなとみらい医療センター', time: '11:00-12:00', status: '未訪問' },
        { name: '関内クリニック', time: '14:00-15:00', status: '未訪問' }
      ]
    }
  ];

  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <div className="flex-1 flex flex-col bg-sky-50">
      {/* コースリスト */}
      <div className="flex-1 overflow-y-auto p-4">
        {courses.map(course => (
          <div 
            key={course.id}
            className="bg-white rounded-lg shadow mb-4 overflow-hidden"
          >
            {/* コースヘッダー */}
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setSelectedCourse(selectedCourse === course.id ? null : course.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <MapPin size={20} className="text-teal-600 mr-2" />
                    <h2 className="text-lg font-medium">{course.name}</h2>
                  </div>
                  <div className="flex items-center mt-2 text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm">{course.timeSlot}</span>
                    <Building2 size={16} className="ml-4 mr-2" />
                    <span className="text-sm">{course.facilities.length}施設</span>
                  </div>
                </div>
                <ChevronRight 
                  size={20} 
                  className={`text-gray-400 transition-transform ${
                    selectedCourse === course.id ? 'transform rotate-90' : ''
                  }`} 
                />
              </div>
            </div>

            {/* 施設リスト（展開時のみ表示） */}
            {selectedCourse === course.id && (
              <div className="border-t">
                {course.facilities.map((facility, index) => (
                  <div 
                    key={index}
                    className="p-4 border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{facility.name}</h3>
                        <div className="flex items-center mt-1 text-gray-600">
                          <Clock size={14} className="mr-2" />
                          <span className="text-sm">{facility.time}</span>
                        </div>
                      </div>
                      <span 
                        className={`px-3 py-1 rounded-full text-xs ${
                          facility.status === '完了' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {facility.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;