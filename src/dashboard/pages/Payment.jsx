import axios from 'axios';
import { useToken } from '../../context/StoreProvider';
import { useEffect, useState, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { BsFillCreditCardFill } from 'react-icons/bs';
import { DayPicker } from 'react-day-picker';
import { isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek } from 'date-fns';

const Payment = () => {
  const { token } = useToken();
  const [kitchenBalance, setKitchenBalance] = useState({});
  const [accountTransactions, setAccountTransactions] = useState([]);
  const [accountDateRange, setAccountDateRange] = useState(undefined);
  const [filteredBalanceTransactions, setFilteredBalanceTransactions] = useState([]);
  const [filteredDisplayTransactions, setFilteredDisplayTransactions] = useState([]);
  const [isOpenAccount, setIsOpenAccount] = useState(false);
  const [selectedAccountFilter, setSelectedAccountFilter] = useState('Today');
  const [accountCustomDate, setAccountCustomDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('Today');
  const [filteredBalance, setFilteredBalance] = useState(0);
  const [orderSummary, setOrderSummary] = useState({
    codOrderAmount: 0,
    onlineOrderAmount: 0,
    takeawayOrderAmount: 0,
    deliveryOrderAmount: 0,
    totalGST: 0,
  });
  const options = ['Today', 'All', 'Credit', 'Payout'];
  const accountFilterOptions = ['Today', 'This Week', 'This Month', 'Select date'];
  const dropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);

const calculateFilteredBalance = (transactions) => {
  return transactions.reduce((balance, txn) => {
    if (txn.type === 'Credit') {
      return balance + txn.amount;
    }
    return balance; // Ignore Debit and Payout
  }, 0);
};



  const calculateOrderSummary = (transactions) => {
    return transactions.reduce(
      (summary, txn) => {
        const orderDetails = txn.orderDetails || {};
        const amount = orderDetails.subtotal || 0;
        const gst = orderDetails.gstAmount || 0;
        const paymentType = orderDetails.paymentType;
        const orderType = orderDetails.orderType;

        return {
          codOrderAmount:
            paymentType === "COD"
              ? summary.codOrderAmount + amount + gst
              : summary.codOrderAmount,
          onlineOrderAmount:
            paymentType !== "COD"
              ? summary.onlineOrderAmount + amount + gst
              : summary.onlineOrderAmount,
          takeawayOrderAmount:
            orderType === "Takeaway"
              ? summary.takeawayOrderAmount + amount + gst
              : summary.takeawayOrderAmount,
          deliveryOrderAmount:
            orderType === "Instant" &&
              (paymentType === "Online" || paymentType === "COD")
              ? summary.deliveryOrderAmount + amount + gst
              : summary.deliveryOrderAmount,

          totalGST: summary.totalGST + gst,
        };
      },
      {
        codOrderAmount: 0,
        onlineOrderAmount: 0,
        takeawayOrderAmount: 0,
        deliveryOrderAmount: 0,
        totalGST: 0,
      }
    );
  };

  const applyAccountFilter = (filter, transactions, selectedDate) => {
    let filtered = transactions;

    if (filter === 'Today') {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      filtered = transactions.filter((txn) => {
        const txnDate = new Date(txn.createdAt);
        return isWithinInterval(txnDate, { start: startOfToday, end: endOfToday });
      });
    } else if (filter === 'This Week') {
      const today = new Date();
      const startOfWeekDate = startOfWeek(today, { weekStartsOn: 0 });
      const endOfWeek = endOfDay(today);

      filtered = transactions.filter((txn) => {
        const txnDate = new Date(txn.createdAt);
        return isWithinInterval(txnDate, { start: startOfWeekDate, end: endOfWeek });
      });
    } else if (filter === 'This Month') {
      const today = new Date();
      const startOfThisMonth = startOfMonth(today);
      const endOfThisMonth = endOfMonth(today);

      filtered = transactions.filter((txn) => {
        const txnDate = new Date(txn.createdAt);
        return isWithinInterval(txnDate, { start: startOfThisMonth, end: endOfThisMonth });
      });
    } else if (filter !== 'Today' && filter !== 'This Week' && filter !== 'This Month') {
      const selected = startOfDay(new Date(selectedDate));
      const endOfSelectedDay = endOfDay(new Date(selectedDate));

      filtered = transactions.filter((txn) => {
        const txnDate = new Date(txn.createdAt);
        return isWithinInterval(txnDate, { start: selected, end: endOfSelectedDay });
      });
    }

    setFilteredBalanceTransactions(filtered);
    setFilteredBalance(calculateFilteredBalance(filtered));
    setOrderSummary(calculateOrderSummary(filtered));
  };

  const applyTransactionTypeFilter = (type, transactions) => {
    let filtered = transactions;

    if (type === 'All') {
      setFilteredDisplayTransactions(transactions);
    } else if (type === 'Today') {
      const today = new Date();
      const start = startOfDay(today);
      const end = endOfDay(today);
      filtered = transactions.filter((txn) => {
        const txnDate = new Date(txn.createdAt);
        return isWithinInterval(txnDate, { start, end });
      });
      setFilteredDisplayTransactions(filtered);
    } else {
      filtered = transactions.filter((txn) => txn.type === type);
      setFilteredDisplayTransactions(filtered);
    }
  };

  const handleAccountFilterSelect = (filter) => {
    setSelectedAccountFilter(filter);
    setIsOpenAccount(false);
    if (filter !== 'Select date') {
      applyAccountFilter(filter, accountTransactions, accountCustomDate);
      applyTransactionTypeFilter(selected, accountTransactions);
    }
  };

  const formatAccountDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleAccountDateChange = (range) => {
    setAccountDateRange(range);

    if (!range?.from || !range?.to || range.from.getTime() === range.to.getTime()) return;

    const from = startOfDay(new Date(range.from));
    const to = endOfDay(new Date(range.to));

    const filtered = accountTransactions.filter((txn) => {
      const txnDate = new Date(txn.createdAt);
      return isWithinInterval(txnDate, { start: from, end: to });
    });

    const label = `${formatAccountDate(from)} - ${formatAccountDate(to)}`;

    setSelectedAccountFilter(label);
    setFilteredBalanceTransactions(filtered);
    setFilteredBalance(calculateFilteredBalance(filtered));
    setOrderSummary(calculateOrderSummary(filtered));
    setIsOpenAccount(false);
    setTimeout(() => {
      setAccountDateRange(undefined);
    }, 0);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsOpenAccount(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTimeAgo = (dateString) => {
    const processedDate = new Date(dateString);
    const currentDate = new Date();
    const timeDifference = currentDate - processedDate;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) return 'Today';
    if (daysDifference === 1) return '1 day ago';
    return `${daysDifference} days ago`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${day} ${month} ${year}, ${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const fetchKitchenAccount = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_KITCHENBASE_URL}/account-page`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { kitchen, transactions } = response.data;
      // console.log("Kitchen Info:", kitchen);
      // console.log("Transactions:", transactions);

      setKitchenBalance(kitchen);
      setAccountTransactions(transactions);
      setFilteredBalanceTransactions(transactions);
      setFilteredBalance(calculateFilteredBalance(transactions));
      setOrderSummary(calculateOrderSummary(transactions));

      // Default today filter for both balance & recent transactions
      applyAccountFilter('Today', transactions, accountCustomDate);
      applyTransactionTypeFilter('Today', transactions);
    } catch (error) {
      console.error('Error fetching kitchen account details:', error);
    }
  };

  useEffect(() => {
    fetchKitchenAccount();
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    applyTransactionTypeFilter(option, accountTransactions);
  };

  return (
    <div className="max-w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="font-semibold text-xl">Account</h1>
        </div>
        <div className="relative inline-block text-left" ref={accountDropdownRef}>
          <button
            onClick={() => setIsOpenAccount(!isOpenAccount)}
            className="inline-flex items-center justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            {selectedAccountFilter}
            <FaChevronDown className="ml-2 h-4 w-4" />
          </button>

          {isOpenAccount && (
            <div className="absolute z-10 mt-2 w-90 right-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {accountFilterOptions.map((option) =>
                  option !== 'Select date' ? (
                    <button
                      key={option}
                      onClick={() => handleAccountFilterSelect(option)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {option}
                    </button>
                  ) : (
                    <div key="select-date" className="m-2 py-2">
                      <DayPicker
                        mode="range"
                        selected={accountDateRange}
                        onSelect={handleAccountDateChange}
                        numberOfMonths={1}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 mb-6 rounded-xl gap-5">
        <div className="bg-[#FEFFBA] rounded-xl p-4">
          <h2 className="md:text-base md:font-semibold font-medium text-xs mb-1 uppercase">
            earnings of {kitchenBalance.kitchenName}
          </h2>
          <p className="md:text-3xl sm:text-2xl text-base font-bold mb-4 text-green-500">
            ₹ {filteredBalance.toFixed(2)}
          </p>
        </div>

        <div className="bg-[#FEFFBA] rounded-xl p-4">
          <p className="md:text-base md:font-semibold font-medium text-xs mb-1 uppercase">
            Earnings (Unsettled)  balance of {kitchenBalance.kitchenName}
          </p>
          <p className="md:text-3xl sm:text-2xl text-base font-bold mb-4 text-green-500">
            ₹ {kitchenBalance.walletbalance?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h1 className="text-lg font-semibold">Cash on Delivery (COD)</h1>
            <p className="text-sm text-gray-600">
              Total revenue collected directly from customers at the time of delivery.
            </p>
            <div className="flex justify-between items-end mt-2">
              <p className="text-xl font-bold mb-3">₹{orderSummary.codOrderAmount.toFixed(2)}</p>
              <img src="/COD.png" alt="COD" className="w-24 h-24" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md">
            <h1 className="text-lg font-semibold mb-1">Online Payments</h1>
            <p className="text-sm text-gray-600 mb-2">
              Earnings received through UPI, cards, or digital wallets.
            </p>
            <div className="flex justify-between items-end mt-2">
              <p className="text-xl font-bold mb-3">₹{orderSummary.onlineOrderAmount.toFixed(2)}</p>
              <img src="/OnlinePayments.png" alt="Online Payments" className="w-24 h-24" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md">
            <h1 className="text-lg font-semibold mb-1">Takeaway Orders</h1>
            <p className="text-sm text-gray-600 mb-2">
              Orders picked up by customers directly from your kitchen.
            </p>
            <div className="flex justify-between items-end mt-2">
              <p className="text-xl font-bold mb-3">₹{orderSummary.takeawayOrderAmount.toFixed(2)}</p>
              <img src="/TakeawayOrders.png" alt="Takeaway Orders" className="w-24 h-24" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-md">
            <h1 className="text-lg font-semibold mb-1">Delivery Orders</h1>
            <p className="text-sm text-gray-600 mb-2">
              Food delivered to customers through delivery partners.
            </p>
            <div className="flex justify-between items-end mt-2">
              <p className="text-xl font-bold mb-3">₹{orderSummary.deliveryOrderAmount.toFixed(2)}</p>
              <img src="/DeliveryOrders.png" alt="Delivery Orders" className="w-24 h-24" />
            </div>
          </div>

          <div className="bg-[#FEFFBA] rounded-md p-4 shadow-md md:col-span-2">
            <h1 className="text-lg font-semibold mb-1">Total GST Amount Collected</h1>
            <p className="text-sm text-gray-700 mb-2">
              This is the total GST amount collected from customer orders.
            </p>
            <div className="flex justify-between items-end mt-2">
              <p className="text-xl font-bold mb-3">₹{orderSummary.totalGST.toFixed(2)}</p>
              <img src="/TotalGST.png" alt="GST Amount" className="w-2/4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center my-2">
            <p className="text-lg font-semibold">Recent Transactions</p>
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-between gap-2 w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-[#D8D8D8] duration-200 ease-in-out text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>{selected}</span>
                <FaChevronDown className="text-gray-500" />
              </button>

              {isOpen && (
                <div className="origin-top-left absolute -left-0 mt-2 w-24 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    {options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelect(option)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto sidebar_scroll">
            {filteredDisplayTransactions.length > 0 ? (
              filteredDisplayTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full font-bold flex items-center justify-center text-gray-600 bg-[#D8D8D8]">
                      <BsFillCreditCardFill className="text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{getTimeAgo(transaction.createdAt)}</p>
                      <p className="font-medium">{transaction.type}</p>
                      <p className="text-xs text-gray-400">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                  <span className="font-semibold md:text-lg text-sm">₹ {Number(transaction.amount).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-10 font-medium">No transactions</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;