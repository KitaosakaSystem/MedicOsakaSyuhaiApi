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

const Settings = () => {

  // actionを操作するための関数取得
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(changeText('設定'))
  })

  // 設定の状態管理
  const [darkMode, setDarkMode] = useState(false);
  const [sound, setSound] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState('');

  const courses = [
    { id: '1', name: '内科基礎コース' },
    { id: '2', name: '外科基礎コース' },
    { id: '3', name: '救急医療コース' },
    { id: '4', name: '総合診療コース' }
  ];

  const handleSubmit = () => {
    console.log('保存されたデータ:', { username, selectedCourse });
  };

  const handleLogout = () => {
    console.log('ログアウト処理');
  };

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ユーザー名:</label>
            <input
              type="text"
              value="北シ；福井　カズマ"
              disabled
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">担当コース</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">コースを選択</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
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