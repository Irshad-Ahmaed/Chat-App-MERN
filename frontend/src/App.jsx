import { useEffect, useState } from 'react'
import Navbar from './components/Navbar';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const {authUser, checkAuth} = useAuthStore();

  useEffect(()=>{
    checkAuth();
  }, [checkAuth]);

  console.log({authUser});

  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/login' element={<LoginPage />} />
      </Routes>
    </div>
  )
}

export default App
