import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { changeText } from '../../store/slice/headerTextSlice';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate} from 'react-router-dom';
import { changeLoginUserData } from '../../store/slice/loginUserDataSlice';
import { useAuth } from '../../authservice/AuthContext';

const Login = ({ onLoginSuccess }) => {

    const navigate = useNavigate();

      // actionを操作するための関数取得
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(changeText('ログイン'))
    })

    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const validateUser = async (userId, password, collectionName) => {
        const usersRef = collection(db, collectionName);
        const q = query(usersRef, where('userid', '==', userId));
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.empty) {
          throw new Error('ユーザーIDが見つかりません');
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        // console.log(userDoc.data().name)
        // const bufLoginName = docSnap.data().name;
    
        // パスワードの検証
        // 注: 実際の実装では、パスワードはハッシュ化して保存・比較する必要があります
        // if (userData.password !== password) {
        //   throw new Error('パスワードが正しくありません');
        // }
    
        return userData;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ログイン処理をここに実装
        //Firebase Autentication　ログイン
        try {
            setError('');
            setLoading(true);
            await login(userId, password);
        } catch (error) {
            setError(error.message || 'ログインに失敗しました');
            throw new Error('ログインに失敗しました')
        }

        // Firestoreからユーザーを検索
        try {
            let userData;
            let userType;
        
            // ユーザーIDの桁数に応じてテーブルを切り替え
            if (userId.length === 4) {
                // 4桁の場合はCustomerテーブルを参照
                userData = await validateUser(userId, password, 'customer');
            } else if (userId.length === 7) {
                // 7桁の場合はstaffテーブルを参照
                userData = await validateUser(userId, password, 'staff');
            } else {
                setError('無効なユーザーIDです。4桁または7桁で入力してください。');
                return;
            }
    
            // ログイン成功時の処理
            localStorage.setItem('userId', userId);
            localStorage.setItem('userName', userData.name);
            localStorage.setItem('userType', userId.length === 4 ? 'customer' : 'staff');
            localStorage.setItem('kyotenId', userData.kyoten_id);
            localStorage.setItem('todayRoute', '');
            localStorage.setItem('selectRouteIds', '');
            localStorage.setItem('chatRooms', '');
            localStorage.setItem('bottomNaviMerge', 'false');
            localStorage.setItem('isAuthenticated', 'true');
            
            dispatch(changeLoginUserData({userId:userId,
                                            userName:userData.name, 
                                            userType:userId.length === 4 ? 'customer' : 'staff',
                                            kyotenId:userId.kyoten_id,
                                            todayRouteId:''
                                        }));   
            
            // ログイン成功後のリダイレクトなど
            // 例: window.location.href = '/dashboard';
            //navigate("/");
            setLoading(false);
            onLoginSuccess();
            console.log("推移");    
        } catch (error) {
            console.error('ログインエラー:', error);
            setError(error.message || 'ログイン処理中にエラーが発生しました');
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4 space-y-4">
                {/* ログインコンテンツを中央に配置 */}
                <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6">
                    {/* ロゴ部分 */}
                    <div className="text-center mb-6">
                    <h1 className="text-xl font-bold text-gray-800">
                        メディック集配連絡システム
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">
                        ログインしてください
                    </p>
                    </div>

                    {/* ログインフォーム */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ユーザーID入力 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="userId">
                        ユーザーID
                        </label>
                        <div className="relative">
                        <input
                            id="userId"
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="例: 7998"
                            required
                        />
                        </div>
                    </div>

                    {/* パスワード入力 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                        パスワード
                        </label>
                        <div className="relative">
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="パスワードを入力"
                            required
                        />
                        </div>
                    </div>

                    {/* ログインボタン */}
                    <div className="pt-2">
                        <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                        ログイン
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    </form>
                </div>
                </div>
            </div>
        </div>
    )
}

export default Login