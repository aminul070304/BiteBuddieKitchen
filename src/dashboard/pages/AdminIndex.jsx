import { PieChart, Pie, Cell, LabelList } from 'recharts';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';


import { AiFillDollarCircle } from "react-icons/ai";
import { FaMoneyBillWaveAlt } from "react-icons/fa";
import { FaRegCircleCheck } from "react-icons/fa6";

import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
import { IoReloadCircleSharp } from "react-icons/io5";
import { RiFileList3Line } from "react-icons/ri";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useToken } from '../../context/StoreProvider';
import toast from 'react-hot-toast';
import OrderTypeChart from '../components/OrderTypeChart.jsx';
import PaymentChartDashboard from '../components/PaymentChartDashboard.jsx';


const orderData = [
  { month: 'Jan', orders: 450 },
  { month: 'Feb', orders: 550 },
  { month: 'Mar', orders: 400 },
  { month: 'Apr', orders: 350 },
  { month: 'May', orders: 580 },
  { month: 'Jun', orders: 450 },
  { month: 'Jul', orders: 400 },
  { month: 'Aug', orders: 608 },
  { month: 'Sep', orders: 500 },
  { month: 'Oct', orders: 300 },
  { month: 'Nov', orders: 200 },
  { month: 'Dec', orders: 500 },
];



const Dashboard = () => {
  const [ws, setWs] = useState(null);
  const [updatedOrders, setUpdatedOrders] = useState([]);
  const [isKitchenOpen, setIsKitchenOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ActiveOrders, setActiveOrders] = useState([]);
  const [prepTime, setPrepTime] = useState([]);
  // const [activeDropdown, setActiveDropdown] = useState(null);
  const [data, setData] = useState({
    preparing: 0,
    active: 0,
    delivered: 0,
    cancelled: 0,
    totalOrders: 0,

  });


  const { token } = useToken();

  const updateOrderPreferences = async (orderId, newTime) => {
    try {
      const numericTime = parseInt(newTime);
      const response = await axios.patch(
        `${import.meta.env.VITE_ORDERBASE_URL}/update-preparing-time/${orderId}`,
        {
          orderId,
          preparingtime: numericTime,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Preparation time updated");

      // ✅ Save to localStorage
      const stored = JSON.parse(localStorage.getItem("updatedOrders")) || [];
      const updated = [...new Set([...stored, orderId])];
      localStorage.setItem("updatedOrders", JSON.stringify(updated));

      setUpdatedOrders(updated);
      activeOrders();
    } catch (err) {
      console.error("Failed to update preparation time:", err.response?.data || err.message);
      toast.error("Failed to update preferences");
    }
  };

  // get api call to get all orders
  const activeOrders = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_ORDERBASE_URL}/active-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setActiveOrders(response.data.orders);
      // console.log("Active orders fetched successfully:", response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching orders");
    }
  };

  // get dashboardData data from api
  const dashboardData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_ORDERBASE_URL}/get-order/kitchen`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      //  console.log('Dashboard data response:', response.data); // Added console log
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };


  const fetchKitchenStatus = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_KITCHENBASE_URL}/get/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const status = response.data?.kitchen?.isOpen || false;
      setIsKitchenOpen(status);
      // console.log("Initial kitchen status:", status);
    } catch (error) {
      console.error("Error fetching kitchen status:", error);
      toast.error("Failed to load kitchen status");
    } finally {
      setLoading(false);
    }
  };

  const toggleKitchenStatus = async () => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_KITCHENBASE_URL}/toggle-open`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const newStatus = response.data.isOpen;
      setIsKitchenOpen(newStatus);
      // console.log("Toggled status:", newStatus);
      toast.success(`Kitchen is now ${newStatus ? "Open" : "Closed"}`);
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to toggle kitchen status");
    }
  };

  useEffect(() => {
    if (token) {
      dashboardData();
      fetchKitchenStatus();
      activeOrders();
      const stored = JSON.parse(localStorage.getItem("updatedOrders")) || [];
      setUpdatedOrders(stored);

    }
    return () => {
      if (ws) ws.close();
    };

  }, [token]);


  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);




  return (
    <div className="min-h-screen">
      <main>
        {/* Kitchen Toggle Button */}
        <div className="mb-6 bg-white rounded-md p-4 flex flex-col md:flex-row justify-between items-center">
          <div className="space-y-1">
            <p className="font-medium">
              {isKitchenOpen ? "You’re Live and Receiving Orders" : "Let’s Go Live!"}
            </p>
            <p className="text-[12px] text-gray-600">
              {isKitchenOpen
                ? "Customers can see your kitchen and place orders."
                : "You’re currently closed. Toggle on to start receiving orders."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Kitchen Status:</span>
            <button
              onClick={toggleKitchenStatus}
              className={`w-12 h-6 flex items-center rounded-full transition-colors duration-300 ${isKitchenOpen ? "bg-green-500" : "bg-gray-400"
                }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${isKitchenOpen ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
            <span className="text-sm">{isKitchenOpen ? "Open" : "Closed"}</span>
          </div>
        </div>

        <h1 className='font-semibold text-lg pb-4'>Today’s Statistics </h1>

        {/* Stats Grid */}
        <div className="flex overflow-x-auto space-x-4 mb-6 p-4 md:p-0 snap-x snap-mandatory scrollbar-hide ">



          <div className="bg-white p-6 rounded-lg  min-w-[270px] ">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-black mb-2">Today Orders</p>
                <h3 className="text-xl font-semibold">{data.totalOrders}</h3>
              </div>
              <span className="bg-red-100 p-2 rounded-lg">
                <RiFileList3Line className="text-red-600 text-xl" />
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg  min-w-[270px] ">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-black mb-2">Active Orders</p>
                <h3 className="text-xl font-semibold">{data.active}</h3>
              </div>
              <span className="bg-red-100 p-2 rounded-lg">
                <IoReloadCircleSharp className="text-red-500 text-xl" />
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg  min-w-[270px] ">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-black mb-2">Preparing Orders</p>
                <h3 className="text-xl font-semibold">{data.preparing}</h3>
              </div>
              <span className="bg-red-100 p-2 rounded-lg">
                <HiOutlineDotsCircleHorizontal className="text-red-700 text-xl" />
              </span>
            </div>
          </div>


          <div className="bg-white p-6 rounded-lg  min-w-[270px] ">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-black mb-2">Delivered Orders</p>
                <h3 className="text-xl font-semibold">{data.delivered}</h3>
              </div>
              <span className="bg-red-100 p-2 rounded-lg">
                <FaRegCircleCheck className="text-red-600 text-xl" />
              </span>
            </div>
          </div>




          <div className="bg-white p-6 rounded-lg  min-w-[270px] ">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-black mb-2">Online Payments</p>
                <h3 className="text-xl font-semibold">{data.onlinePayments}</h3>
              </div>
              <span className="bg-red-100 p-2 rounded-lg">
                <AiFillDollarCircle className="text-red-600 text-xl" />
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg  min-w-[270px] ">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-black mb-2">Cash on Delivery</p>
                <h3 className="text-xl font-semibold">{data.codPayments}</h3>
              </div>
              <span className="bg-red-100 p-2 rounded-lg">
                <FaMoneyBillWaveAlt className="text-red-600 text-xl" />
              </span>
            </div>
          </div>


        </div>

        {/* Charts Grid chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3  gap-6 md:mb-6">
          {/* Dynamic Payment method chart */}
          <PaymentChartDashboard />


          {/*Dynamic Order type chart */}
          <OrderTypeChart />

          {/* Orders Received Section */}
          <div className="p-4 rounded-lg bg-white border border-red-100 shadow-sm text-sm text-gray-800">
            <h1 className="font-bold pb-2 text-lg">Orders Today Received</h1>

            <div className="max-h-[380px] overflow-y-auto pr-2 space-y-4">
              {ActiveOrders
                .filter((order) => {
                  const orderDate = new Date(order.orderTime);
                  const today = new Date();
                  return orderDate.toDateString() === today.toDateString();
                })
                .map((order, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-[#FFE9E9] border shadow-sm text-sm text-gray-800 "
                  >
                    <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                      <span>
                        {new Date(order.orderTime).toLocaleDateString("en-GB")} |{" "}
                        {new Date(order.orderTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="bg-white text-xs font-medium px-2 py-1 rounded">
                        {order.orderType}
                      </span>
                    </div>

                    <div className="w-full text-sm font-medium mb-2">
                      <div className="flex justify-between text-gray-600 border-b pb-1">
                        <span>Items</span>
                        <span>Quantity</span>
                        <span>Amount</span>
                      </div>

                      {order.orderItems.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex justify-between mt-2">
                          <p className="font-semibold">{item.title.slice(0, 6)}..</p>
                          <p>{item.quantity}</p>
                          <p>₹{item.baseprice}</p>
                        </div>
                      ))}

                      <hr className="my-2 border-gray-300" />
                      <div className="flex justify-between font-semibold border-b">
                        <p>Total Amount + GST 5%</p>
                        <p>₹{order.amount}</p>
                      </div>
                    </div>

                    <div className="mt-3 text-[13px] leading-5">
                      <p className="font-semibold">{order.customerName}</p>
                      <p>{order.address}</p>
                      <p className="font-medium mt-1 text-black">+91 {order.phone}</p>
                    </div>

                    <div className="flex justify-between mt-3 font-medium text-sm">
                      <div>
                        <p >Payment Mode :</p>
                        <p className='pt-3 font-semibold'>{order.paymentType}</p>
                      </div>


                      <div className="flex flex-col gap-2">
                        <div>

                          <p>Preparation time</p>
                        </div>
                        <select
                          className="w-full p-2 rounded bg-[#FEFFBA] shadow-lg"
                          value={order.preparingtime}
                          onChange={(e) =>
                            updateOrderPreferences(order.orderId, e.target.value)
                          }
                          disabled={updatedOrders.includes(order.orderId)} // ⬅️ Disable if updated
                        >
                          <option value="20">20 mins</option>
                          <option value="25">25 mins</option>
                          <option value="30">30 mins</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>


        </div>

        {/* Orders Chart */}
        <h1 className='font-semibold text-lg pb-4'>Financial Overview</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm md:mt-0 mt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Orders</h3>
              <div className="flex items-center space-x-2">
                <span className="md:text-2xl font-semibold">650</span>
                <span className="text-green-500 text-sm">↑ 0.56%</span>
              </div>
            </div>
            <div className="text-right">
              <span className="md:text-2xl font-semibold">Rs 28,305</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={orderData}
                barSize={15}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#FFCD02" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* <OrdersChart/> */}


      </main>
    </div>
  );
};

export default Dashboard;