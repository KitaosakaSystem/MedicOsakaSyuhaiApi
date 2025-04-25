// firebase-messaging-sw.js
// publicフォルダに配置してください

// Firebase App (the core Firebase SDK) を読み込む
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase設定
// Service Workerでは環境変数を直接使用できないため、実際の値を直接記述する必要があります。
// セキュリティ上、Firebase設定は公開されても問題ない値なので、直接記述します：
firebase.initializeApp({
  apiKey: "AIzaSyDzhwAG1mmxOs7JWZvcgPIZBbT3VfGPYNM",
  authDomain: "medicwebsyuhaiosaka.firebaseapp.com",
  projectId: "medicwebsyuhaiosaka",
  storageBucket: "medicwebsyuhaiosaka.firebasestorage.app",
  messagingSenderId: "763522370957",
  appId: "1:763522370957:web:f5dadae9a9b16c6c5a01c4"
});

// Firebase Messagingの初期化
const messaging = firebase.messaging();

// バックグラウンドメッセージハンドラー
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] バックグラウンドメッセージを受信:', payload);
  
  // カスタム通知のタイトルとオプションを設定
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico', // アプリのアイコンパス
    badge: '/badge.png', // バッジアイコンパス（あれば）
    data: payload.data  // 追加データ
  };

  // 通知を表示
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 通知のクリックイベントハンドラー
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] 通知がクリックされました:', event);
  
  event.notification.close();
  
  // 通知がクリックされたときにアプリを開く
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 既にアプリが開いている場合はそのウィンドウにフォーカス
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // アプリが開いていない場合は新しいウィンドウを開く
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});