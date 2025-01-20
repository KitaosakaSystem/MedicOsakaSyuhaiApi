// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import CustomerList from './pages/customers/CustomerList';
import Chat from './pages/chat/Chat';
import CourseList from './pages/course/CourseList';
import Settings from './pages/settings/Settings';
import Login from './pages/login/Login';

const App = () => {
  return (
    <Login />
    // <Router>
    //   <Layout>
    //     <Routes>
    //       <Route path="/" element={<Login />} />
    //       <Route path="/chat" element={<Chat />} />
    //       <Route path="/course" element={<CourseList />} />
    //       <Route path="/settings" element={<Settings />} />
    //     </Routes>
    //   </Layout>
    // </Router>
  );
};

export default App;