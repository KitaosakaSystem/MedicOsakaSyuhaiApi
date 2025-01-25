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

  // 設定セクションの定義
  const settingSections = [
    {
      title: '一般設定',
      items: [
        {
          icon: Moon,
          label: 'ダークモード',
          type: 'toggle',
          value: darkMode,
          onChange: () => setDarkMode(!darkMode)
        },
        {
          icon: Languages,
          label: '言語',
          type: 'link',
          value: '日本語'
        }
      ]
    },
    {
      title: 'その他',
      items: [

        {
          icon: LogOut,
          label: 'ログアウト',
          type: 'button',
          className: 'text-red-600'
        }
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-sky-50">

      {/* 設定リスト */}
      <div className="flex-1 overflow-y-auto">
        {settingSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mt-6 mx-4">
            <h2 className="text-sm font-medium text-gray-600 mb-2 px-2">
              {section.title}
            </h2>
            <div className="bg-white rounded-lg shadow">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                
                return (
                  <div
                    key={itemIndex}
                    className={`
                      flex items-center justify-between p-4
                      ${itemIndex !== 0 ? 'border-t border-gray-100' : ''}
                      ${item.type === 'link' ? 'cursor-pointer hover:bg-gray-50' : ''}
                    `}
                  >
                    <div className="flex items-center">
                      <Icon size={20} className={item.className || 'text-gray-600'} />
                      <span className={`ml-3 ${item.className || 'text-gray-800'}`}>
                        {item.label}
                      </span>
                    </div>
                    
                    {item.type === 'toggle' ? (
                      <button
                        onClick={item.onChange}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full 
                          transition-colors focus:outline-none
                          ${item.value ? 'bg-teal-600' : 'bg-gray-200'}
                        `}
                      >
                        <span 
                          className={`
                            inline-block h-4 w-4 rounded-full bg-white transition-transform
                            ${item.value ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    ) : item.type === 'link' ? (
                      <div className="flex items-center text-gray-400">
                        {item.value && (
                          <span className="mr-2 text-sm">{item.value}</span>
                        )}
                        <ChevronRight size={20} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* バージョン情報 */}
        <div className="mt-6 mb-8 text-center text-gray-500 text-sm">
          バージョン 0.1.0
        </div>
      </div>
    </div>
  );
};

export default Settings;