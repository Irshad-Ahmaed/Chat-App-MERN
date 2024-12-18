import { useEffect, useState } from 'react'
import Navbar from './components/Navbar';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from 'lucide-react';
import {Toaster} from 'react-hot-toast';
import ProfilePage from './pages/ProfilePage';
import { useThemeStore } from './store/useThemeStore';
import SettingsPage from './pages/SettingsPage';


function App() {
  const {authUser, checkAuth, isCheckingAuth} = useAuthStore();
  const {theme} = useThemeStore();

  useEffect(()=>{
    checkAuth();
  }, [checkAuth]);

  console.log({authUser});

  if(isCheckingAuth && !authUser){
    return(
      <div className='flex items-center justify-center h-screen'>
        <Loader width={50} height={50} className="animate-spin transition-all" />
      </div>
    )
  }

  return (
    <div data-theme={theme}>
      <Navbar/>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/" />} />
        <Route path='/settings' element={<SettingsPage/>} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
