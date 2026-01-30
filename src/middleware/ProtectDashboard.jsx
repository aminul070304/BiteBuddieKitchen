import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectDashboard = () => {

  const userInfo = {
    name: 'Indian Cottage',
    role: 'admin'
  }
  const kitchenToken = localStorage.getItem('kitchenToken')

  if (userInfo && kitchenToken) {
    return <Outlet />
  } else {
    return <Navigate to='/' />
  }
}

export default ProtectDashboard
