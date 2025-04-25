import React, { useState } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

const FCMTestPage = () => {
  const [documentId, setDocumentId] = useState('');
  const [fcmToken, setFcmToken] = useState('');
  const [message, setMessage] = useState({
    title: 'テスト通知',
    body: 'これはテストメッセージです'
  });
  const [senderId, setSenderId] = useState('test-sender');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Google App ScriptのURL（実際のIDに置き換えてください）
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbyp9SBtFJuPija45FB2rffvUs_Y6SIw9DhB6DRWzSGRL5bH4dz9Q9e5CFuCEAr2O3_ybg/exec';

  // FCMトークンを取得
  const fetchFCMToken = async () => {
    if (!documentId) {
      setError('ドキュメントIDを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setFcmToken('');

    try {
      // コレクションを判定（4桁ならcustomer、7桁ならstaff）
      const collectionName = documentId.length === 4 ? 'customer' : 'staff';
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const token = docSnap.data().fcmToken;
        if (token) {
          setFcmToken(token);
          setSuccess(`FCMトークンを取得しました (${collectionName}コレクション)`);
        } else {
          setError('このユーザーのFCMトークンが見つかりません');
        }
      } else {
        setError(`${collectionName}コレクションにドキュメントが見つかりません`);
      }
    } catch (error) {
      console.error('Error fetching FCM token:', error);
      setError('FCMトークンの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // Google App Script経由でテスト通知を送信
  const sendTestNotification = async () => {
    if (!fcmToken) {
      setError('まずFCMトークンを取得してください');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Google App ScriptにPOSTリクエストを送信
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          action: 'sendNotification',
          messageId: `test-${Date.now()}`, // テスト用のメッセージID
          senderId: senderId,
          receiverId: documentId,
          messageText: message.body,
          // カスタムオーバーライド用に追加
          customTitle: message.title,
          customBody: message.body,
          targetToken: fcmToken
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('GAS response:', data);

      if (data.success) {
        setSuccess('テスト通知を送信しました');
      } else {
        throw new Error(data.error || '通知の送信に失敗しました');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError(`通知の送信中にエラーが発生しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">FCM テスト通知 (Google App Script経由)</h1>
        
        {/* ドキュメントID入力 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ドキュメントID (4桁: customer / 7桁: staff)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 0001 または 0000001"
            />
            <button
              onClick={fetchFCMToken}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? '取得中...' : 'トークン取得'}
            </button>
          </div>
        </div>

        {/* FCMトークン表示 */}
        {fcmToken && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FCMトークン
            </label>
            <div className="p-3 bg-gray-100 rounded-md break-all text-sm font-mono">
              {fcmToken}
            </div>
          </div>
        )}

        {/* 送信者ID入力 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            送信者ID
          </label>
          <input
            type="text"
            value={senderId}
            onChange={(e) => setSenderId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="送信者のID（テスト用）"
          />
        </div>

        {/* メッセージ入力 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            通知タイトル
          </label>
          <input
            type="text"
            value={message.title}
            onChange={(e) => setMessage({ ...message, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="通知のタイトル"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            通知本文
          </label>
          <textarea
            value={message.body}
            onChange={(e) => setMessage({ ...message, body: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="通知の本文"
          />
        </div>

        {/* 送信ボタン */}
        <button
          onClick={sendTestNotification}
          disabled={loading || !fcmToken}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
        >
          {loading ? '送信中...' : 'テスト通知を送信 (GAS経由)'}
        </button>

        {/* エラーメッセージ */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* 成功メッセージ */}
        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* 注意事項 */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">注意事項:</h3>
          <ul className="text-sm text-yellow-700 list-disc list-inside">
            <li>このテスト機能はGoogle App Scriptを利用して通知を送信します</li>
            <li>Google App Scriptのデプロイメントが必要です</li>
            <li>GAS側でCORSの設定が必要です</li>
            <li>本番環境では適切な認証とセキュリティ対策が必要です</li>
          </ul>
        </div>

        {/* デバッグ情報 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-800 mb-2">デバッグ情報:</h3>
          <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
            {JSON.stringify({
              documentId,
              fcmToken: fcmToken ? `${fcmToken.substring(0, 20)}...` : null,
              senderId,
              messageTitle: message.title,
              messageBody: message.body,
              gasUrl: GAS_URL
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FCMTestPage;