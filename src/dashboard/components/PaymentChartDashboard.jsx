import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useToken } from '../../context/StoreProvider';

const COLORS = ['#FF928A', '#FFC700'];

const PaymentChartDashboard = () => {
  const [paymentData, setPaymentData] = useState([]);
  const { token } = useToken();

  useEffect(() => {
    const dashboardData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_ORDERBASE_URL}/get-order/kitchen`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = response.data || {};
        const chartData = [
          { PaymentRequest: 'Online', value: Number(data.onlinePayments) || 0 },
          { PaymentRequest: 'COD', value: Number(data.codPayments) || 0 }
        ].filter(entry => entry.value > 0); // Filter out zero values

        setPaymentData(chartData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setPaymentData([
          { PaymentRequest: 'Online', value: 0 },
          { PaymentRequest: 'COD', value: 0 }
        ]);
      }
    };

    dashboardData();
  }, [token]);

  return (
    <div className="bg-white rounded-md" style={{ minHeight: '400px', width: '100%' }}>
      <h1 className="p-6 font-bold text-lg">Payment Method</h1>

      {paymentData.length > 0 && paymentData.some(entry => entry.value > 0) ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={paymentData}
              cx="50%"
              cy="50%"
              outerRadius={110}
              dataKey="value"
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {paymentData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center p-6">No payment data available</div>
      )}

      <div className="flex justify-start pl-5 gap-6 pb-6">
        {paymentData.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm">{entry.PaymentRequest}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentChartDashboard;