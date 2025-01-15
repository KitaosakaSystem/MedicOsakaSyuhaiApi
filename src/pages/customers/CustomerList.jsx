import { useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin, Phone } from 'lucide-react';
import chatStore from '../../store/chatStore';

const CustomerList = () => {
  const navigate = useNavigate();
  const setCurrentFacility = chatStore(state => state.setCurrentFacility);

  // サンプルデータ
  const customers = [
    {
      id: 1,
      name: '東京中央病院',
      address: '東京都新宿区西新宿6-7-1',
      phone: '03-1234-5678',
      schedule: '月・水・金',
      visitTime: '14:00-15:00',
      status: 'online'
    },
    {
      id: 2,
      name: '横浜総合病院',
      address: '神奈川県横浜市西区みなとみらい3-1-1',
      phone: '045-1234-5678',
      schedule: '火・木',
      visitTime: '15:00-16:00',
      status: 'offline'
    },
    {
      id: 3,
      name: '千葉メディカルセンター',
      address: '千葉県千葉市中央区新千葉1-1-1',
      phone: '043-1234-5678',
      schedule: '月・木',
      visitTime: '13:00-14:00',
      status: 'online'
    },
    // スクロールをテストするためのダミーデータ
    ...Array.from({ length: 10 }, (_, i) => ({
      id: i + 4,
      name: `医療施設${i + 1}`,
      address: `東京都港区南麻布${i + 1}-${i + 1}-${i + 1}`,
      phone: `03-9999-${String(i + 1).padStart(4, '0')}`,
      schedule: '月・水・金',
      visitTime: '09:00-10:00',
      status: i % 2 === 0 ? 'online' : 'offline'
    }))
  ];

  // 顧客選択時のハンドラー
  const handleCustomerSelect = (customer) => {
    setCurrentFacility(customer);
    navigate('/chat');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-teal-600 shadow-sm">
        <div className="p-4">
          <h1 className="text-lg font-medium text-white">62コース　顧客一覧</h1>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {customers.map(customer => (
          <div 
            key={customer.id}
            onClick={() => handleCustomerSelect(customer)}
            className="bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="p-4">
              {/* 施設名とステータス */}
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-medium">{customer.name}</h2>
                <span 
                  className={`px-2 py-1 rounded-full text-xs ${
                    customer.status === 'online' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {customer.status === 'online' ? 'オンライン' : 'オフライン'}
                </span>
              </div>

              {/* 住所 */}
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin size={16} className="mr-2" />
                <span className="text-sm">{customer.address}</span>
              </div>

              {/* 電話番号 */}
              <div className="flex items-center text-gray-600 mb-2">
                <Phone size={16} className="mr-2" />
                <span className="text-sm">{customer.phone}</span>
              </div>

              {/* 訪問スケジュール */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">訪問日：{customer.schedule}</p>
                    <p className="text-sm text-gray-600">時間帯：{customer.visitTime}</p>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerList;