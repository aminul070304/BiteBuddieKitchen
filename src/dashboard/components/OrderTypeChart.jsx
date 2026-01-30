import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';
import { useToken } from '../../context/StoreProvider';

const OrderTypeChart = () => {
  const [ordertype, setOrdertype] = useState([
    { name: 'Home Delivery', value: 0 },
    { name: 'Takeaway', value: 0 },
  ]);
  const { token } = useToken();

  // const fetchOrderTypeData = async () => {
  //   try {
  //     const response = await axios.get(`${import.meta.env.VITE_ORDERBASE_URL}/kitchenorders`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     const orders = response.data.orders || [];
  //     console.log(orders)

  //     const { homeDelivery, takeaway } = orders.reduce(
  //       (acc, order) => {
  //         const type = order.orderType;
  //         if (type === 'Instant') {
  //           acc.homeDelivery += 1;
  //         } else if (type === 'Takeaway') {
  //           acc.takeaway += 1;
  //         }
  //         return acc;
  //       },
  //       { homeDelivery: 0, takeaway: 0 }
  //     );

  //     const total = homeDelivery + takeaway;
  //     const homeDeliveryPercent = total ? (homeDelivery / total) * 100 : 0;
  //     const takeawayPercent = total ? (takeaway / total) * 100 : 0;

  //     setOrdertype([
  //       { name: 'Home Delivery', value: Number(homeDeliveryPercent.toFixed(2)) },
  //       { name: 'Takeaway', value: Number(takeawayPercent.toFixed(2)) },
  //     ]);
  //   } catch (error) {
  //     console.error('Error fetching order data:', error);
  //   }
  // };

  const fetchOrderTypeData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_ORDERBASE_URL}/kitchenorders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orders = response.data.orders || [];
      // console.log(orders)

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const todayOrders = orders.filter((order) => {
        const createdAt = new Date(order.orderTime);
        return createdAt >= todayStart && createdAt < todayEnd;
      });

      const { homeDelivery, takeaway } = todayOrders.reduce(
        (acc, order) => {
          const type = order.orderType;
          if (type === 'Instant') {
            acc.homeDelivery += 1;
          } else if (type === 'Takeaway') {
            acc.takeaway += 1;
          }
          return acc;
        },
        { homeDelivery: 0, takeaway: 0 }
      );

      const total = homeDelivery + takeaway;
      const homeDeliveryPercent = total ? (homeDelivery / total) * 100 : 0;
      const takeawayPercent = total ? (takeaway / total) * 100 : 0;

      setOrdertype([
        { name: 'Home Delivery', value: Number(homeDeliveryPercent.toFixed(2)) },
        { name: 'Takeaway', value: Number(takeawayPercent.toFixed(2)) },
      ]);
    } catch (error) {
      console.error('Error fetching order data:', error);
    }
  };

  useEffect(() => {
    fetchOrderTypeData();
  }, []);

  const colors = ['#FFC700', '#FF928A'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-4">Order type </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={ordertype}
            margin={{ top: 20, right: 30, left: 23, bottom: 5 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <YAxis dataKey="name" type="category" />
            <Tooltip formatter={(value) => `${value}%`} />
            <Bar dataKey="value" isAnimationActive={false}>
              {ordertype.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
              <LabelList
                dataKey="value"
                content={({ x, y, width, height, value }) => {
                  return (
                    <text
                      x={x + width / 1.6}
                      y={y + height / 2}
                      fill="#ffffff"
                      fontSize={14}
                      fontWeight="semibold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {value}%
                    </text>
                  );
                }}
              />

            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-gray-700 italic text-sm">
        <p>
          <strong>{ordertype[0].value}%</strong> orders were delivered to
          customers via home delivery.
        </p>
        <p>
          <strong>{ordertype[1].value}%</strong> customers chose takeaway from
          the restaurant.
        </p>
      </div>
    </div>
  );
};

export default OrderTypeChart;
