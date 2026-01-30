import { LogOut, Settings, ShoppingCart } from 'lucide-react';
import { RiFileList3Fill } from "react-icons/ri";
import { GiCampCookingPot } from "react-icons/gi";
import { MdCelebration } from "react-icons/md";
import { MdAccountBalanceWallet } from "react-icons/md";
import { SiGoogleanalytics } from "react-icons/si";
import { GrAnnounce } from "react-icons/gr";
import { BiFoodMenu } from "react-icons/bi";
import { Link, useLocation } from 'react-router-dom';
import { MdDashboard } from "react-icons/md";

const Sidebar = ({ isSidebarOpen, onLogoutClick, onLinkClick }) => {

    const { pathname } = useLocation();

    const handleLinkClick = () => {
        if (onLinkClick) {
            onLinkClick();
        }
    };

    return (

        <aside className={` w-64 flex flex-col fixed h-full z-20 transition-all duration-200 ease-in-out ${isSidebarOpen ? '-translate-x-64' : 'translate-x-0'} md:translate-x-0`}>
            <div className="py-3 mb-4 rounded-b-lg bg-white">
                <div className='flex justify-center items-center '>
                    <img className='w-[100px] sm:w-2/4' src="/logo.png" alt="logo" />
                </div>
            </div>
            <div className='flex-1 overflow-y-scroll sidebar_scroll  shadow-md rounded-tr-lg bg-white'>
                <nav className="p-4">
                    <ul className="space-y-2">
                        <li>
                            <span className={`${pathname === '/dashboard/admin' ? 'relative -left-8 w-12 h-[4px] rounded-t-3xl rotate-90 flex top-[1.8rem] bg-[#D9291A]' : 'bg-white'} `}></span>
                            <Link to="/dashboard" className={`${pathname === '/dashboard/admin' ? 'bg-[#D9291A] text-white' : ' text-[#565656]'} flex items-center space-x-3 text-black hover:bg-red-700 hover:text-white p-3 rounded-lg font-medium`} onClick={handleLinkClick}>
                                <MdDashboard className="w-5 h-5" />
                                <span className=' md:text-xl text-sm'>Dashboard</span>
                            </Link>
                        </li>

                        <li>
                            <span className={`${pathname === '/dashboard/menu' ? 'relative -left-8 w-12 h-[4px] rounded-t-3xl rotate-90 flex top-[1.8rem] bg-[#D9291A]' : 'bg-white'} `}></span>
                            <Link to="/dashboard/menu" className={`px-3 ${pathname === '/dashboard/menu' ? 'bg-[#D9291A] text-white' : ' text-[#565656]'} flex items-center space-x-3 text-black hover:bg-red-700 hover:text-white p-3 rounded-lg font-medium`} onClick={handleLinkClick}>
                                <BiFoodMenu className="w-5 h-5" />
                                <span className='md:text-xl text-sm'>Menu</span>
                            </Link>
                        </li>


                        <li>
                            <span className={`${pathname === '/dashboard/Instant' ? 'relative -left-8 w-12 h-[4px] rounded-t-3xl rotate-90 flex top-[1.8rem] bg-[#D9291A]' : 'bg-white'} `}></span>
                            <Link to="/dashboard/Instant" className={`px-3 ${pathname === '/dashboard/Instant' ? 'bg-[#D9291A] text-white' : ' text-[#565656]'} flex items-center space-x-3 text-black hover:bg-red-800 hover:text-white p-3 rounded-lg font-medium`} onClick={handleLinkClick}>
                                <GiCampCookingPot className="w-5 h-5" />
                                <span className='md:text-xl text-sm'>Instant</span>
                            </Link>
                        </li>

                       
                        <li>
                            <span className={`${pathname === '/dashboard/Subscription' ? 'relative -left-8 w-12 h-[4px] rounded-t-3xl rotate-90 flex top-[1.8rem] bg-[#D9291A]' : 'bg-white'} `}></span>
                            <Link to="/dashboard/Subscription" className={`px-3 ${pathname === '/dashboard/Subscription' ? 'bg-[#D9291A] text-white' : ' text-[#565656]'} flex items-center space-x-3 text-black hover:bg-red-800 hover:text-white p-3 rounded-lg font-medium`} onClick={handleLinkClick}>
                                <RiFileList3Fill className="w-5 h-5" />
                                <span className='md:text-xl text-sm'>Subscription</span>
                            </Link>
                        </li>

                        <li>
                            <span className={`${pathname === '/dashboard/Event' ? 'relative -left-8 w-12 h-[4px] rounded-t-3xl rotate-90 flex top-[1.8rem] bg-[#D9291A]' : 'bg-white'} `}></span>
                            <Link to="/dashboard/Event" className={`px-3 ${pathname === '/dashboard/Event' ? 'bg-[#D9291A] text-white' : ' text-[#565656]'} flex items-center space-x-3 text-black hover:bg-red-800 hover:text-white p-3 rounded-lg font-medium`} onClick={handleLinkClick}>
                                <MdCelebration className="w-5 h-5" />
                                <span className='md:text-xl text-sm'>Event</span>
                            </Link>
                        </li>


                        <li>
                            <span className={`${pathname === '/dashboard/payment' ? 'relative -left-8 w-12 h-[4px] rounded-t-3xl rotate-90 flex top-[1.8rem] bg-[#D9291A]' : 'bg-white'} `}></span>
                            <Link to="/dashboard/payment" className={`px-3 ${pathname === '/dashboard/payment' ? 'bg-[#D9291A] text-white' : ' text-[#565656]'} flex items-center space-x-3 text-black hover:bg-red-700 hover:text-white p-3 rounded-lg font-medium`} onClick={handleLinkClick}>
                                <MdAccountBalanceWallet className="w-5 h-5" />
                                <span className='md:text-xl text-sm'>Account</span>
                            </Link>
                        </li>

                       

                        <li>
                            <span className={`${pathname === '/dashboard/analytic' ? 'relative -left-8 w-12 h-[4px] rounded-t-3xl rotate-90 flex top-[1.8rem] bg-[#D9291A]' : 'bg-white'} `}></span>
                            <Link to="/dashboard/analytic" className={`px-3 ${pathname === '/dashboard/analytic' ? 'bg-[#D9291A] text-white' : ' text-[#565656]'} flex items-center space-x-3 text-black hover:bg-red-700 hover:text-white p-3 rounded-lg font-medium`} onClick={handleLinkClick}>
                                <SiGoogleanalytics className="w-5 h-5" />
                                <span className='md:text-xl text-sm'>Analytics</span>
                            </Link>
                        </li>




                          <li>
                            <span className={`${pathname === '/dashboard/Promotions' ? 'relative -left-8 w-12 h-[4px] rounded-t-3xl rotate-90 flex top-[1.8rem] bg-[#D9291A]' : 'bg-white'} `}></span>
                            <Link to="/dashboard/Promotions" className={`px-3 ${pathname === '/dashboard/Promotions' ? 'bg-[#D9291A] text-white' : ' text-[#565656]'} flex items-center space-x-3 text-black hover:bg-red-700 hover:text-white p-3 rounded-lg font-medium`} onClick={handleLinkClick}>
                                <GrAnnounce className="w-5 h-5" />
                                <span className='md:text-xl text-sm'>Promotions</span>
                            </Link>
                        </li>


      
                    </ul>
                </nav>
            </div>
            <div className='rounded-b-lg  bg-white pl-4 pr-4 pb-4 border-t-2 border-gray-200'>
                <ul className="space-y-2 pt-4">
                    <li>
                        <span className={`${pathname === '/dashboard/setting' ? 'relative -left-8 w-12 h-[4px] rounded-t-3xl rotate-90 flex top-[1.8rem] bg-[#D9291A]' : 'bg-white'} `}></span>
                        <Link to="/dashboard/setting" className={`px-3 ${pathname === '/dashboard/setting' ? 'bg-[#D9291A] text-white' : ' text-[#565656]'} flex items-center space-x-3 text-black p-3 hover:bg-red-700 hover:text-white rounded-lg font-medium`} onClick={handleLinkClick}>
                            <Settings className="w-5 h-5" />
                            <span className='md:text-xl text-sm'>Settings</span>
                        </Link>
                    </li>
                    <li>
                        <div onClick={onLogoutClick} className="flex items-center space-x-3  hover:shadow-red-500/20 cursor-pointer hover:bg-[#D9291A] hover:text-white ease-in-out duration-200   p-3 rounded-lg font-medium text-lg text-black">
                            <LogOut className="w-5 h-5" />
                            <span >Logout</span>
                        </div>
                    </li>
                </ul>
            </div>
        </aside >

    )
}

export default Sidebar
