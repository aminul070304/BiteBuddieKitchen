import axios from 'axios'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useToken } from '../../context/StoreProvider'
import toast from 'react-hot-toast'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredCustomers = customers.filter(customer =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const dateA = new Date(a.registeredDate);
    const dateB = new Date(b.registeredDate);
    if (sortOrder === 'newest') {
      return dateB - dateA;
    }
    return dateA - dateB;
  })

  const customersPerPage = 8
  const totalPages = Math.ceil(sortedCustomers.length / customersPerPage)
  const indexOfLastCustomer = currentPage * customersPerPage
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage
  const currentCustomers = sortedCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer)

  const { token } = useToken();

  const getCustomers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/kitchen/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setCustomers(response.data.users);
    } catch (error) {
      toast.error(error.response.data.message)
      console.error(error);
    }
  }

  useEffect(() => {
    if (token) {
      getCustomers()
    }
  }, [token])

  const CustomrNameUpperCase = (customerName) => {
    return customerName.charAt(0).toUpperCase() + customerName.slice(1)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#F0F7F4]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by</span>
            <select
              className="border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {currentCustomers.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium bg-[#d5750a] text-white border uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium bg-[#d5750a] text-white border uppercase tracking-wider">Phone Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium bg-[#d5750a] text-white border uppercase tracking-wider">Registered Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium bg-[#d5750a] text-white border uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium bg-[#d5750a] text-white border uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCustomers.map((customer, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{CustomrNameUpperCase(customer.customerName)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.registeredDate}</td>
                    <td className="px-6 py-4 whitespace-wrap text-sm text-gray-500">{customer.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-4 py-1 inline-flex text-sm leading-5 font-semibold rounded-md border-2 ${customer.status === 'Active' ? 'bg-green-100 text-green-800 border-green-800' : 'bg-red-100 border-red-800 text-red-800'
                        }`}>
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No customers available
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing {indexOfFirstCustomer + 1}-{Math.min(indexOfLastCustomer, sortedCustomers.length)} of {sortedCustomers.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded-md ${currentPage === page ? 'bg-[#d5750a] text-white' : 'hover:bg-gray-100'
                }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Customers
