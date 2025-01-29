// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, BrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import CustomerList from './pages/customers/CustomerList';
import Chat from './pages/chat/Chat';
import CourseList from './pages/course/CourseList';
import Settings from './pages/settings/Settings';
import Login from './pages/login/Login';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { changeLoginUserData } from './store/slice/loginUserDataSlice';
import { getTodayDate } from './utils/dateUtils';


const ProtectedRoute = ({ isAuthenticated }) => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const App = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // 初回レンダリング時にローカルストレージをチェック
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      const loginUserId = localStorage.getItem('userId');
      const setLoginTodayRoute =  localStorage.getItem('todayRoute');
      const userType =  localStorage.getItem('userType');
      
      //本日の担当コース処理
      const data = localStorage.getItem('todayRoute');
      if (data) {
        const todayRoute = JSON.parse(data);
        const todayDate = getTodayDate();

        console.log("today>",todayDate)

        if (todayRoute.date !== todayDate ){
          localStorage.removeItem('todayRoute');
          localStorage.removeItem('chatRooms'); //昨日のチャットルームなので消しておく
          console.log('日付が異なるため、データを削除しました');
        }
        
        // console.log(todayRoute);
        // console.log("todayRoute.date",todayRoute.date);
        // console.log("todayRoute.todayRoute",todayRoute.todayRoute)
      }
      console.log("ディスパッチー")
      dispatch(changeLoginUserData({userId:loginUserId,userName:'',todayRoute:setLoginTodayRoute,isReadColChatRoom:false}))
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    console.log("ro\\ログオーーーーーーーーーーーン");
  };

  return (
    <div>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <Login onLoginSuccess={handleLogin} />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />

            {/* <Route path="/" element={<CustomerList />} /> */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
              <Route path='/' element={<CustomerList />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/course" element={<CourseList />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />

          </Routes>
        </Layout>      
      </BrowserRouter>   
    </div>
  );
};

export default App;