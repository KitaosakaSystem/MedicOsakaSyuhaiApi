import { useNavigate } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';
import chatStore from '../../store/chatStore';

import { useDispatch, useSelector } from 'react-redux';
import { changeText } from '../../store/slice/headerTextSlice';
import { changeChatUserData } from '../../store/slice/chatUserDataSlice';
import { useEffect, useState } from 'react';

import { db } from '../../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { changeLoginUserData } from '../../store/slice/loginUserDataSlice';

const CustomerList = () => {

  const navigate = useNavigate();
  const setCurrentFacility = chatStore(state => state.setCurrentFacility);

  // store内の値を取得
  const loginUserId = useSelector(state => state.loginUserData.loginUserId);
  const loginUserName = useSelector(state => state.loginUserData.loginUserName);
  const setLoginTodayRoute = useSelector(state => state.loginUserData.loginTodayRoute);
  const isReadChatRoom = useSelector(state => state.loginUserData.isReadColChatRoom);

  // actionを操作するための関数取得
  const dispatch = useDispatch();
  useEffect(() => { 
    dispatch(changeText('62コース　顧客一覧'))
  },[])

  const [customers,setCustomers] = useState([]);
  const collectionRef = query(collection(db,"customer"))

  useEffect(() => {

    console.log('isREadColChatRoom', isReadChatRoom);

    if(isReadChatRoom){
      console.log("Call onSnapShotはコースに変更がないからぬけるよ");
      return;
    }

    onSnapshot(collectionRef,(querySnapshot) => {
      const customerResults = [];
      querySnapshot.docs.forEach((doc) => customerResults.push({
        customer_code: doc.id,
        customer:doc.data(),
      }));
      setCustomers(customerResults);     
    });

    dispatch(changeLoginUserData({userId:loginUserId,userName:loginUserName,todayRoute:setLoginTodayRoute,isReadColChatRoom:true}))
    console.log('Dispatch成功',isReadChatRoom)
  },[])

  // customers.map((doc) =>{
  //   console.log("顧客コード:" + doc.customer_code + " 顧客名:" + doc.customer.customer_name);
  // })

  // 顧客選択時のハンドラー
  const handleCustomerSelect = (customer) => {
    setCurrentFacility(customer);
    console.log("Customer.USerID",customer.customer.userid)
    dispatch(changeChatUserData({
      userId:customer.customer.userid,
      userName:customer.customer.name,
    }))
    navigate('/chat');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-4 space-y-4">
        {customers.map(customer => (
          <div 
            key={customer.customer_code}
            onClick={() => handleCustomerSelect(customer)}
            className="bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="p-4">
              {/* 施設名とステータス */}
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-medium">
                  {customer.customer_code + ' ' + customer.customer.name}
                </h2>
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
                <span className="text-sm">{customer.customer.address}</span>
              </div>

              {/* 電話番号 */}
              <div className="flex items-center text-gray-600 mb-2">
                <Phone size={16} className="mr-2" />
                <span className="text-sm">{customer.customer.phone}</span>
              </div>

              {/* 訪問スケジュール */}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerList;