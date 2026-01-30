import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import LogoutModal from '../pages/LogoutModal'
import { useToken } from '../../context/StoreProvider'

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isLogoutModelOpen, setIsLogoutModelOpen] = useState(false)
    const navigate = useNavigate()
    const { setToken } = useToken();

    const toggleSideBar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const handleLogout = () => {
        setToken('')
        localStorage.removeItem('kitchenToken')
        navigate('/')
    }

    return (
        <div className='min-w-screen min-h-screen bg-[#EAEAEA]'>
            <Sidebar isSidebarOpen={isSidebarOpen} onLogoutClick={() => setIsLogoutModelOpen(true)} onLinkClick={toggleSideBar} />
            <div className={`flex-1 transition-all duration-200 ease-in-out md:ml-64 ${isSidebarOpen ? 'ml-0' : 'ml-64'}`}>
                <Header toggleSideBar={toggleSideBar} />
                <div className='p-4'>
                    <div className='pt-[63px]'>
                        <Outlet />
                    </div>
                </div>
            </div>
            <LogoutModal isOpen={isLogoutModelOpen} onConfirm={handleLogout} onCancel={() => setIsLogoutModelOpen(false)} />
        </div>
    )
}

export default MainLayout
