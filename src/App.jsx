// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, BrowserRouter, Link, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import CustomerList from './pages/customers/CustomerList';
import Chat from './pages/chat/Chat';
import CourseList from './pages/course/CourseList';
import Settings from './pages/settings/Settings';
import Login from './pages/login/Login';
import RegisterForm from './authservice/RegisterForm';
import StaffRegisterForm from './StaffRegisterForm';
import CustomerRegisterForm from './CustomerRegisterForm';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { changeLoginUserData } from './store/slice/loginUserDataSlice';
import { getTodayDate } from './utils/dateUtils';
import { AuthProvider } from './authservice/AuthContext';
import RouteUpdaterForm from './RouteUpdaterForm';
import RoutePrintComponent from './RoutePrintComponent';

// サイドバーのナビゲーション項目コンポーネント
const NavItem = ({ to, icon, text, isActive }) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-700 text-white' 
        : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span>{text}</span>
  </Link>
);

// 管理画面用サイドバーコンポーネント
const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // サイドバーのナビゲーション項目
  const navItems = [
    {
      to: '/register',
      icon: '📋',
      text: '登録ホーム'
    },
    {
      to: '/staff_register',
      icon: '👤',
      text: 'スタッフ登録'
    },
    {
      to: '/customer_register',
      icon: '🏢',
      text: '顧客登録'
    },
    {
      to: '/route_register',
      icon: '🚚',
      text: 'ルート更新'
    },
    {
      to: '/route_print',
      icon: '🖨️',
      text: 'コース確認表'
    }
  ];
  
  return (
    <div className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <h1 className="text-xl font-bold text-blue-800 mb-6">
          メディック集配システム
        </h1>
        
        <nav>
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              text={item.text}
              isActive={currentPath === item.to}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

// 管理画面レイアウトコンポーネント
const AdminLayout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-100">
    <AdminSidebar />
    <main className="ml-64 flex-1 p-6">
      {children}
    </main>
  </div>
);

const ProtectedRoute = ({ isAuthenticated }) => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // 初回レンダリング時にローカルストレージをチェックして、全ページで使うログインユーザーストアを更新しておく
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
      const loginUserId = localStorage.getItem('userId');
      const loginUserName = localStorage.getItem('userName');
      const loginUserType =  localStorage.getItem('userType');
      const loginKyotenId =   localStorage.getItem('kyotenId');
      
      //本日の担当コース処理---------------------------------------
      let todayRouteId = ''
      const data = localStorage.getItem('todayRoute');
      if (data) {
        const todayRoute = JSON.parse(data);
        const todayDate = getTodayDate();
        todayRouteId = todayRoute.todayRoute

        if (todayRoute.date !== todayDate ){
          localStorage.removeItem('todayRoute');
          localStorage.removeItem('chatRooms'); //昨日のチャットルームなので消しておく
          todayRouteId = ''
          console.log('日付が異なるため、データを削除しました');
        }
      }
      dispatch(changeLoginUserData({userId:loginUserId,
                                    userName:loginUserName,
                                    userType:loginUserType,
                                    kyotenId:loginKyotenId,
                                    todayRouteId:todayRouteId}))
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  return (
    <div>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Layoutを適用しないルート */}
            <Route path="/login" 
              element={
                !isAuthenticated ? (
                  <Login onLoginSuccess={handleLogin} />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
            
            {/* 管理画面用ルート - サイドバーあり */}
            <Route element={
              isAuthenticated ? (
                <AdminLayout><Outlet /></AdminLayout>
              ) : (
                <Navigate to="/login" />
              )
            }>
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/staff_register" element={<StaffRegisterForm />} />
              <Route path="/customer_register" element={<CustomerRegisterForm />} />
              <Route path="/route_register" element={<RouteUpdaterForm />} />
              <Route path="/route_print" element={<RoutePrintComponent />} />
            </Route>
            
            {/* メインアプリ用ルート - 既存レイアウト */}
            <Route element={<Layout><Outlet /></Layout>}>
              {/* 保護されたルート */}
              <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                <Route path='/' element={<CustomerList />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/course" element={<CourseList />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>   
    </div>
  );
};

export default App;