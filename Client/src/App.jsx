import React from 'react'
import { Navigate, Route,Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import Navbar from './components/Navbar'
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/useThemeStore'
const App = () => {

const { authUser,checkAuth,isCheckingAuth,onlineUsers} = useAuthStore()
const {theme} = useThemeStore()
console.log(onlineUsers);

useEffect(() => {
  checkAuth()
}, [checkAuth])
console.log({authUser})
if (isCheckingAuth && !authUser) return (
  <span className="loading loading-spinner loading-md flex items-center justify-center"></span>
)

  return (

    <div data-theme={theme}>
      <Navbar/>
<Routes>
<Route path='/' element={authUser?<HomePage/> : <Navigate to="/login"/>}/>
<Route path='/signup' element={!authUser?<SignUpPage/>:<Navigate to="/"/>}/>
<Route path='/login' element={!authUser?<LoginPage/>:<Navigate to="/"/>}/>
<Route path='/profile' element={authUser?<ProfilePage/>: <Navigate to="/login"/>}/>
<Route path='/settings' element={<SettingsPage/>}/>




</Routes>
<Toaster/>
    </div>
  )
}

export default App