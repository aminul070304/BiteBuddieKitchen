import React, { useState } from 'react'
import {
    AreaChart, Area, LineChart, Line, PieChart, Pie,
    Cell, ResponsiveContainer, XAxis, YAxis, Tooltip
} from 'recharts'

import { IoChevronDownOutline } from 'react-icons/io5'

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('Month')
    const [selectedMonth, setSelectedMonth] = useState('December')

    const areaData = [
        { name: '5k', investment: 20, profit: 40 },
        { name: '10k', investment: 25, profit: 35 },
        { name: '15k', investment: 30, profit: 25 },
        { name: '20k', investment: 25, profit: 30 },
        { name: '25k', investment: 35, profit: 25 },
        { name: '30k', investment: 30, profit: 35 },
        { name: '35k', investment: 45, profit: 30 },
        { name: '40k', investment: 60, profit: 35 },
        { name: '45k', investment: 40, profit: 40 },
        { name: '50k', investment: 45, profit: 35 },
        { name: '55k', investment: 35, profit: 50 },
        { name: '60k', investment: 30, profit: 45 },
    ]

    const lineData = [
        { year: 2015, series1: 25, series2: 10 },
        { year: 2016, series1: 70, series2: 55 },
        { year: 2017, series1: 50, series2: 25 },
        { year: 2018, series1: 60, series2: 50 },
        { year: 2019, series1: 100, series2: 90 },
    ];

    const pieData = [
        { name: 'Advertisement', value: 30, color: '#2c3e50' },
        { name: 'Bill Expense', value: 15, color: '#e67e22' },
        { name: 'Investment', value: 20, color: '#e91e63' },
        { name: 'Others', value: 35, color: '#3498db' },
    ]

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    return (
        <div className="min-h-screen  ">
            <h1 className="text-lg sm:text-xl md:font-semibold font-bold mb-4 sm:mb-6">Analytics</h1>

            {/* Main Chart Section */}
            <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                    <div className="flex gap-2 overflow-x-auto">
                        {['Year', 'Month', 'Week'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 sm:px-4 py-1 rounded-md text-sm sm:text-base whitespace-nowrap ${activeTab === tab
                                    ? 'bg-[#FFC700] text-white'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <button
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1 border rounded-md text-sm sm:text-base"
                            onClick={() => document.getElementById('monthSelect').click()}
                        >
                            {selectedMonth} <IoChevronDownOutline />
                        </button>
                        <select
                            id="monthSelect"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        >
                            {months.map((month) => (
                                <option key={month} value={month}>
                                    {month}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="h-[200px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={areaData}>
                            <Area
                                type="monotone"
                                dataKey="investment"
                                stroke="#ff7f7f"
                                fill="#ff7f7f"
                                fillOpacity={0.3}
                            />
                            <XAxis />
                            <YAxis />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="profit"
                                stroke="#b794f4"
                                fill="#b794f4"
                                fillOpacity={0.3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-3 sm:mt-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff7f7f]" />
                        <span className="text-gray-600">Investment</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#b794f4]" />
                        <span className="text-gray-600">Profit</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Customer Chart */}
                <div className="bg-white p-4 sm:p-4 rounded-lg shadow-sm mt-4">
                    <h2 className="text-base sm:text-lg font-semibold mb-4">Customer </h2>
                    <div className="flex flex-col items-center justify-center">
                        <div className="h-[200px] w-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'New Customers', value: 34249, color: '#3b82f6' },
                                            { name: 'Repeated', value: 1420, color: '#93c5fd' },
                                        ]}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        startAngle={90}
                                        endAngle={-270}
                                        paddingAngle={10}
                                    >
                                        <Cell key="new" fill="#3b82f6" />
                                        <Cell key="repeated" fill="#93c5fd" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-4 flex gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                                <span className="text-sm text-gray-600">New Customers</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#93c5fd]" />
                                <span className="text-sm text-gray-600">Repeated</span>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-10 font-bold text-lg">
                            <div className="text-center">
                                <div>34,249</div>
                                <div className="text-xs text-gray-500">New Customers</div>
                            </div>
                            <div className="text-center">
                                <div>1,420</div>
                                <div className="text-xs text-gray-500">Repeated</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Analytics Card */}
                <div className="bg-white p-4 rounded-lg shadow-sm h-full flex flex-col w-full">
                    <h2 className="text-base sm:text-lg font-semibold mb-4 text-center sm:text-left">
                        Sales Analytics
                    </h2>

                    <div className="w-full flex-1 min-h-[250px] sm:min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="series1"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 3 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="series2"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/*  Expense Pie Chart */}
                <div className="bg-white p-4 sm:p-4 rounded-lg shadow-sm mt-4">
                    <h2 className="text-base sm:text-lg font-semibold mb-4"> Expense Chart</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="h-[200px] sm:h-[250px] w-full sm:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        labelLine={false}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col gap-2 w-full sm:w-1/2">
                            {pieData.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-sm"
                                        style={{ backgroundColor: item.color }}
                                    ></div>
                                    <span className="text-sm text-gray-700 font-medium">
                                        {item.value}% {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>


        </div>
    )
}

export default Analytics
