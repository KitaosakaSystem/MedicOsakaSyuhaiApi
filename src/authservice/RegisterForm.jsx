// RegisterForm.js - 登録フォームコンポーネント
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [customId, setCustomId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredId, setRegisteredId] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await signup(customId, password);
      setSuccess(true);
      setRegisteredId(customId);
      setCustomId('');
      setPassword('');
    } catch (error) {
      setError(error.message || 'アカウント作成に失敗しました');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            アカウント登録
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="font-medium">登録完了!</span>
            <span className="block sm:inline"> 「{registeredId}」の登録が完了しました。</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="customId" className="block text-sm font-medium text-gray-700 mb-1">
                ユーザーID
              </label>
              <input
                id="customId"
                name="customId"
                type="text"
                required
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="ユーザーIDを入力"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="パスワードを入力"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? '処理中...' : '登録する'}
            </button>
          </div>
          
          <div className="text-sm text-center mt-4">
            <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              すでにアカウントをお持ちの方はログイン
            </a>
          </div>
          
          {success && (
            <div className="text-sm text-center mt-4">
              <button 
                onClick={() => setSuccess(false)} 
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                別のアカウントを登録する
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;