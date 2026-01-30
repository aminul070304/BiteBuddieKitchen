import axios from 'axios';
import { MenuIcon, Search } from 'lucide-react';
import { FaBell } from "react-icons/fa";
import { useEffect, useRef, useState } from 'react';
import { useToken } from '../../context/StoreProvider';
import toast from 'react-hot-toast';

const Header = ({ toggleSideBar }) => {

  const [kitchenUser, setKitchenUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const audioRef = useRef(null);
  const { token } = useToken();
  const [prevOrderIds, setPrevOrderIds] = useState([]);


  // Kitchen profile api
  const fetchKitchenDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_KITCHENBASE_URL}/get/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setKitchenUser(response.data.kitchen);
    } catch (error) {
      console.error("Error fetching kitchen details:", error);
    }
  };

  // Fetch all orders for the kitchen 
  const getAllOrders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ORDERBASE_URL}/kitchenorders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fetchedOrders = response.data.orders;
      setOrders(fetchedOrders);
      // console.log("Instant order fetched successfully:", response.data);

      const newOrder = fetchedOrders.find(
        order => !prevOrderIds.includes(order._id)
      );

      if (newOrder) {
        playNotificationSound();
      }

      setPrevOrderIds(fetchedOrders.map(order => order._id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching orders");
    }
  };

  const playNotificationSound = () => {
  if (audioRef.current) {
    // audioRef.current.play(); // ✅ UNCOMMENT THIS LINE to play the sound
    setTimeout(() => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Rewind for next play
    }, 10000); // Stop after 10 seconds
  }
};



  useEffect(() => {
    const interval = setInterval(getAllOrders, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (token) {
      fetchKitchenDetails();
      getAllOrders();
    }
  }, [token]);


  return (
    <div className="fixed w-full md:w-[calc(100vw-250px)] z-50">
      {/* Header */}
      <header className="rounded-b-lg flex">
        <div className="flex items-center justify-between bg-white flex-1 rounded-b-lg mx-4 shadow-md">
          <button
            onClick={toggleSideBar}
            className="text-gray-600 hover:text-gray-900 lg:hidden"
          >
            <MenuIcon className="w-6 h-6 text-black ml-2" />
          </button>
          <div className="hidden md:block ml-4 flex-1 max-w-xl relative">
            <Search className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400" />
            <input
              type="search"
              placeholder="Search"
              className="w-full px-4 py-2 pr-10 bg-gray-50 border border-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
            />
          </div>
          <div className="relative right-3">
            <button
              className="text-black block">
              <FaBell className="w-6 md:w-7 h-7 text-gray-500" />
            </button>
            <audio ref={audioRef} src="/sounds/voice.mp3" preload="auto" />
          </div>
        </div>

        <div className="flex items-center  px-10 py-3 rounded-b-lg bg-white shadow-md">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center space-x-2">
                {kitchenUser && kitchenUser.imageUrl ? (
                  <img src={kitchenUser.imageUrl} alt="Admin" className="size-10 rounded-full bg-black" />
                ) : (
                  <div className="rounded-full bg-black flex items-center justify-center">
                    <img src="" alt="kitchen" className=" size-10 rounded-full" />
                  </div>
                )}
                <div className="text-left">
                  {kitchenUser && (
                    <div className="text-xs md:text-sm md:font-bold text-black uppercase">
                      {(kitchenUser.kitchenName) || ''}
                    </div>
                  )}
                  <div className="text-xs text-black">Kitchen Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;