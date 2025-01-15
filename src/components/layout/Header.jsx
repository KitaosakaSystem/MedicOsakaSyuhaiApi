// src/components/layout/Header.jsx
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== '/';

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="bg-blue-600 shadow-sm">
      <div className="py-2 px-4">  {/* padding を調整 */}
        <div className="flex items-center">
          {showBackButton && (
            <button 
              onClick={handleBack}
              className="mr-3 text-white hover:bg-blue-500 rounded-full p-1"
            >
              <ChevronLeft size={20} />  {/* アイコンサイズを小さく */}
            </button>
          )}
          <h1 className="text-base text-white font-medium">
            メディック集配連絡システム
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Header;