import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Auth } from './pages/Auth';
import { Chat } from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { checkAuth, user, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Starting up...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* If user is already logged in, redirect them away from Auth page directly to Chat */}
        <Route path="/" element={user ? <Navigate to="/chat" /> : <Auth />} />
        
        {/* Protect the Chat Routes */}
        <Route element={<ProtectedRoute redirect="/" />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/c/:threadId" element={<Chat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
