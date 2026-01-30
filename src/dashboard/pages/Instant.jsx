import { useState, useEffect } from "react";
import { Filter, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import axios from "axios";
import { useToken } from "../../context/StoreProvider";
import { useOrderWebSocket } from "../../context/OrderWebSocketProvider";
import toast from "react-hot-toast";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiAnticlockwiseRotation } from "react-icons/gi";

const Instant = () => {
  const [filters, setFilters] = useState({
    date: new Date(),
    status: [],
    slot: [],
  });
  const [tempFilters, setTempFilters] = useState({
    date: new Date(),
    status: [],
    slot: [],
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { token } = useToken();
  const { orders, setOrders, isConnected } = useOrderWebSocket(); // Use global context
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  const [orderToCancel, setOrderToCancel] = useState(null);

  const convertDateFormat = (dateInput) => {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const filteredOrders = orders
    .filter((order) => {
      const orderDate = convertDateFormat(order.orderTime);
      const filterDate = convertDateFormat(filters.date);
      const dateMatch = orderDate === filterDate;
      const statusMatch =
        filters.status.length === 0 ||
        filters.status.includes(order.orderStatus);
      return dateMatch && statusMatch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getStatusFlow = (orderType) => {
    const type = orderType?.toLowerCase();
    if (type === "instant") {
      return ["active", "preparing", "prepared"];
    } else if (type === "takeaway") {
      return ["active", "preparing", "prepared", "delivered"];
    }
    return [];
  };

  const handleUpdateStatus = (orderId, newStatus, orderType) => {
    if (newStatus === "cancelled") {
      setOrderToCancel(orderId);
      setShowCancelModal(true);
      return;
    }
    const type = orderType?.toLowerCase();
    if (type === "instant") {
      handleUpdateStatusinstant(orderId, newStatus);
    } else if (type === "takeaway") {
      handleUpdateStatustakeaway(orderId, newStatus);
    } else {
      toast.error("Unknown order type");
    }
  };

  const resetFilters = () => {
    setFilters({
      date: new Date(),
      status: [],
      slot: [],
    });
    setTempFilters({
      date: new Date(),
      status: [],
      slot: [],
    });
    setActiveDropdown(null);
    setCurrentPage(1);
  };

  const handleStatusSelect = (status) => {
    setTempFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const applyFilters = (filterType) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: tempFilters[filterType],
    }));
    setActiveDropdown(null);
    setCurrentPage(1);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-rose-100 text-rose-700";
      case "cancelled":
        return "bg-red-300 text-red-700";
      case "prepared":
        return "bg-purple-100 text-purple-700";
      case "preparing":
        return "bg-yellow-100 text-yellow-700";
      case "delivered":
        return "bg-green-300 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
      setOrders(response.data.orders);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching orders");
    }
  };

  useEffect(() => {
    if (token) {
      getAllOrders();
      const intervalId = setInterval(() => getAllOrders(), 30000);
      return () => clearInterval(intervalId);
    }
  }, [token]);

  const getNextStatusOption = (currentStatus, orderType) => {
    const flow = getStatusFlow(orderType);
    const currentIndex = flow.indexOf(currentStatus?.toLowerCase());
    if (currentIndex === -1 || currentIndex === flow.length - 1) {
      return null;
    }
    return flow[currentIndex + 1];
  };

  const handleUpdateStatustakeaway = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_ORDERBASE_URL}/preparing/${orderId}`,
        { newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      getAllOrders();
      toast.success(response.data.message || "Order status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating order status");
    }
  };

  const handleUpdateStatusinstant = async (orderId, newStatus) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_ORDERBASE_URL}/preparing/${orderId}`,
        { newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      getAllOrders();
      toast.success(response.data.message || "Order status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating order status");
    }
  };

  const statusUpperCase = (status) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A";

  const handleCancelSubmit = async () => {
    if (!orderToCancel) return;
    if (!cancelMessage.trim()) {
      toast.error("Please enter a cancellation message before confirming.");
      return;
    }
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_ORDERBASE_URL}/preparing/${orderToCancel}`,
        { newStatus: "cancelled", cancelReason: cancelMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      getAllOrders();
      setShowCancelModal(false);
      setCancelMessage("");
      setOrderToCancel(null);
      toast.success(response.data.message || "Order cancelled successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error cancelling order");
    }
  };

  const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => setSelectedOrder(null);

  const handleCancelCloseModal = () => {
    setShowCancelModal(false);
    setCancelMessage("");
    setOrderToCancel(null);
  };

  return (
    <>
      <div className="max-w-full mx-auto">
        <h1 className="pb-2 font-bold text-lg md:font-semibold">Order List</h1>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm mb-6 w-full">
          <div className="flex flex-wrap items-center border-b border-gray-200">
            <div className="p-4 border-r border-gray-200">
              <Filter className="w-5 h-5 text-gray-500" />
            </div>
            <div className="p-4 border-r border-gray-200">Filter By</div>
            
            {/* Date Filter */}
            <div className="relative p-4 border-r border-gray-200">
              <button
                onClick={() => toggleDropdown("date")}
                className="flex items-center gap-2 text-gray-700"
              >
                {filters.date ? formatDate(filters.date) : "Date"}
                <ChevronDown className="w-4 h-4" />
              </button>

              {activeDropdown === "date" && (
                <div className="absolute top-full -left-32 md:left-0 mt-0 md:mt-2 bg-white rounded-lg shadow-lg z-10 p-4">
                  <DayPicker
                    mode="single"
                    selected={tempFilters.date}
                    onSelect={(date) =>
                      setTempFilters((prev) => ({ ...prev, date }))
                    }
                  />
                  <button
                    onClick={() => applyFilters("date")}
                    className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    Apply Now
                  </button>
                </div>
              )}
            </div>

            {/* Order Status Filter */}
            <div className="relative p-4 border-r border-gray-200">
              <button
                onClick={() => toggleDropdown("status")}
                className="flex items-center gap-2 text-gray-700"
              >
                {filters.status.length > 0
                  ? filters.status.join(", ")
                  : "Order Status"}
                <ChevronDown className="w-4 h-4" />
              </button>

              {activeDropdown === "status" && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg z-10 p-4 min-w-[200px]">
                  <div className="space-y-2">
                    {["active", "preparing", "prepared", "cancelled", "delivered"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusSelect(status)}
                          className={`w-full px-4 py-2 text-left rounded-md ${
                            tempFilters.status.includes(status)
                              ? "bg-blue-100"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {statusUpperCase(status)}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => applyFilters("status")}
                    className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    Apply Now
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={resetFilters}
              className="p-4 text-red-500 hover:text-red-600 flex items-center gap-2 border br-2"
            >
              <GiAnticlockwiseRotation />
              Reset Filter
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className={`w-full ${isMobile ? "overflow-x-auto" : "overflow-x-auto"}`}>
            {currentOrders.length > 0 ? (
              <table className="w-full mb-9 border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-center text-sm font-medium bg-[#ea871e] border text-white whitespace-nowrap">
                      Customer ID
                    </th>
                    <th className="px-2 py-1 text-center text-sm font-medium bg-[#ea871e] border text-white whitespace-nowrap">
                      Customer name
                    </th>
                    <th className="px-2 py-1 text-center text-sm font-medium bg-[#ea871e] border text-white whitespace-nowrap">
                      Order Time
                    </th>
                    <th className="px-2 py-1 text-center text-sm font-medium bg-[#ea871e] border text-white whitespace-nowrap">
                      Amount
                    </th>
                    <th className="px-2 py-1 text-center text-sm font-medium bg-[#ea871e] border text-white whitespace-nowrap">
                      Pickup OTP
                    </th>
                    <th className="px-2 py-1 text-center text-sm font-medium bg-[#ea871e] border text-white whitespace-nowrap">
                      Order details
                    </th>
                    <th className="px-2 py-1 text-center text-sm font-medium bg-[#ea871e] border text-white whitespace-nowrap">
                      Delivery Type
                    </th>
                    <th className="px-2 py-1 text-center text-sm font-medium bg-[#ea871e] border text-white whitespace-nowrap">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-center">
                  {currentOrders.map((order) => {
                    const nextStatus = getNextStatusOption(
                      order.orderStatus,
                      order.orderType
                    );

                    return (
                      <tr key={order.orderId}>
                        <td className="px-2 py-8 text-sm text-gray-900 whitespace-nowrap">
                          {order.customerId
                            ? `...${order.customerId.slice(-6)}`
                            : "No orderId"}
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {order.customerName || "No CustomerName"}
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {order.orderTime
                            ? new Date(order.orderTime).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: true,
                                }
                              )
                            : "No Time"}
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {order.amount}
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {order.staticOtp}
                        </td>
                        <td
                          className="px-2 py-2 text-sm text-[#324EDF] hover:underline whitespace-nowrap cursor-pointer"
                          onClick={() => handleViewDetails(order)}
                        >
                          View
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {order.orderType}
                        </td>
                        <td className="px-3 py-2 my-6 text-sm whitespace-nowrap">
                          {order.orderStatus.toLowerCase() === "delivered" ||
                          order.orderStatus.toLowerCase() === "cancelled" ? (
                            <span
                              className={`px-4 py-2 rounded text-xs ${getStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {statusUpperCase(order.orderStatus)}
                            </span>
                          ) : nextStatus ? (
                            <div className="relative">
                              <button
                                className={`my-6 px-4 py-2 rounded-lg text-xs ${getStatusColor(
                                  order.orderStatus
                                )} hover:bg-rose-200 transition-colors`}
                                onClick={() => toggleDropdown(order.orderId)}
                              >
                                {statusUpperCase(order.orderStatus)}
                                <ChevronDown className="w-3 h-3 ml-1 inline" />
                              </button>
                              {activeDropdown === order.orderId && (
                                <div className="absolute top-14 left-0 flex flex-col bg-white rounded-lg shadow-lg z-10">
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(
                                        order.orderId,
                                        nextStatus,
                                        order.orderType
                                      )
                                    }
                                    className="w-full px-4 py-2 text-left text-xs hover:rounded-lg hover:bg-teal-100"
                                  >
                                    {statusUpperCase(nextStatus)}
                                  </button>
                                  {order.orderStatus.toLowerCase() === "active" && (
                                    <button
                                      onClick={() =>
                                        handleUpdateStatus(
                                          order.orderId,
                                          "cancelled",
                                          order.orderType
                                        )
                                      }
                                      className="w-full px-4 py-2 text-left text-xs hover:rounded-lg hover:bg-red-700 hover:text-white text-red-500"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span
                              className={`px-4 py-2 my-6 rounded text-xs ${getStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {statusUpperCase(order.orderStatus)}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Today orders not available.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredOrders.length > 0 && (
            <div className="md:px-6 px-4 py-8 border-t border-gray-200 flex justify-between items-center">
              <div className="md:text-lg sm:text-base text-sm font-semibold">
                Total Orders:{" "}
                {
                  filteredOrders.filter((order) =>
                    [
                      "active",
                      "preparing",
                      "prepared",
                      "delivered",
                    ].includes(order.orderStatus.toLowerCase())
                  ).length
                }
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
                >
                  <FaChevronLeft />
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal for Order Details */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-2">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-4 sm:p-6 relative overflow-y-auto max-h-[90vh]">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-2">
                <p className="text-sm font-medium break-words">
                  <span className="underline underline-offset-4">Order Id:</span>{" "}
                  {selectedOrder.orderId}
                </p>
                <p className="text-sm font-medium">
                  Order Time:{" "}
                  {selectedOrder.orderTime
                    ? new Date(selectedOrder.orderTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })
                    : "N/A"}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-base font-semibold">
                  Customer name:{" "}
                  <span className="font-bold uppercase">{selectedOrder.customerName}</span>
                </p>
                <p className="text-sm">
                  Phone no:{" "}
                  <span className="font-semibold text-black">
                    +91 {selectedOrder.phone || "N/A"}
                  </span>
                </p>
                <p className="text-sm">
                  Share Pickup OTP with Delivery Partner:{" "}
                  <span className="font-bold">{selectedOrder.staticOtp || "NO Data"}</span>
                </p>
              </div>

              <hr className="my-2 border-dotted border-black" />

              <div className="text-sm">
                <p className="font-semibold mb-2">Order details</p>
                {selectedOrder.orderItems?.map((item, idx) => (
                  <p key={idx}>
                    {item.title}<span className="ml-1">x {item.quantity}</span>
                  </p>
                ))}
              </div>

              <hr className="my-2 border-dotted border-black" />

              <div className="text-sm">
                <p className="font-semibold mb-2">Note</p>
                {selectedOrder.note || 'No User Notes'}
              </div>

              <hr className="my-2 border-dotted border-black" />

              <div className="text-sm mb-4">
                <p className="font-semibold">
                  Total items
                  <span className="ml-1">
                    x {selectedOrder.orderItems?.length || 0}
                  </span>
                </p>
                <p className="mt-1">
                  Delivery location:{" "}
                  <span className="font-medium">{selectedOrder.address || "No Data"}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-2 text-sm font-medium">
                <div>
                  Sub total:{" "}
                  <span className="font-semibold">₹{selectedOrder.amount}</span>
                </div>
                <div>
                  Payment method: {selectedOrder.paymentType || "No data"}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-6 gap-4">
                <div>
                  <h1 className="font-semibold mb-1">Driver details:</h1>
                  <div className="text-sm">
                    <p>Driver Name: <span className="font-bold">{selectedOrder.driverName || "Driver Not Assigned"}</span></p>
                    <p>Driver Phone: <span className="font-bold">{selectedOrder.driverPhone || "Driver Not Assigned"}</span></p>
                  </div>
                </div>
                <div className="w-full sm:w-auto">
                  <button
                    onClick={closeModal}
                    className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4">Cancel Order</h2>
              <textarea
                value={cancelMessage}
                onChange={(e) => setCancelMessage(e.target.value)}
                className="w-full border rounded p-2 text-sm mb-4"
                rows="4"
                placeholder="Enter cancellation message..."
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={handleCancelCloseModal}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={handleCancelSubmit}
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Instant;