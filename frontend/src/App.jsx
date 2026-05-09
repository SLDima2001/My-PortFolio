import React from 'react'
import { Routes,Route } from 'react-router-dom'
import Home from '/pages/Home.jsx'
import AdminLogin from '/pages/AdminLogin.jsx'
import AdminDashboard from '/pages/AdminDashboard.jsx'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  )
}

export default App