// import React, { useEffect, useState } from 'react';
// import { Pencil, Plus, Trash2, X } from 'lucide-react';
// import { FaCheck } from "react-icons/fa6";
// import { useToken } from '../../context/StoreProvider';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { FaPeopleGroup } from "react-icons/fa6";

// const Drivers = () => {
//   const [deliveryPersons, setDeliveryPersons] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showAssignModal, setShowAssignModal] = useState(false); // New state for assign modal
//   const [currentPage, setCurrentPage] = useState(1);
//   const { token } = useToken();
//   const [formData, setFormData] = useState({
//     name: '',
//     phone: '',
//     email: '',
//     imageUrl: null,
//   });
//   const [imagePreview, setImagePreview] = useState(null);
//   const [formErrors, setFormErrors] = useState({});
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [selectedDriverId, setSelectedDriverId] = useState(null);
//   const [editFormData, setEditFormData] = useState({
//     name: '',
//     phone: '',
//     email: '',
//     imageUrl: null,
//   });
//   const [editImagePreview, setEditImagePreview] = useState(null);
//   const [editFormErrors, setEditFormErrors] = useState({});
//   const [isFormChanged, setIsFormChanged] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [driverStatus, setDriverStatus] = useState({}); // Track driver status (Assign Order/Engaged)

//   const fetchDrivers = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/driver/drivers`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setDeliveryPersons(response.data.drivers);
//       console.log('Fetched drivers:', response.data.drivers);
//       // Initialize driver status as "Assign Order" for all drivers
//       const initialStatus = response.data.drivers.reduce((acc, driver) => {
//         acc[driver._id] = 'Assign Order';
//         return acc;
//       }, {});
//       setDriverStatus(initialStatus);
//     } catch (error) {
//       toast.error(error.response.data.message);
//       console.error('Error fetching drivers:', error);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       fetchDrivers();
//     }
//   }, [token]);

//   // Pagination
//   const personsPerPage = 9;
//   const totalPages = Math.ceil(deliveryPersons.length / personsPerPage);
//   const indexOfLastPerson = currentPage * personsPerPage;
//   const indexOfFirstPerson = indexOfLastPerson - personsPerPage;
//   const currentPersons = deliveryPersons.slice(indexOfFirstPerson, indexOfLastPerson);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const handleInputChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === 'imageUrl' && files[0]) {
//       setFormData((prevData) => ({
//         ...prevData,
//         imageUrl: files[0],
//       }));
//       setImagePreview(URL.createObjectURL(files[0]));
//     } else {
//       setFormData((prevData) => ({
//         ...prevData,
//         [name]: value,
//       }));
//     }
//   };

//   const handleEditInputChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === 'imageUrl' && files[0]) {
//       setEditFormData((prevData) => ({
//         ...prevData,
//         imageUrl: files[0],
//       }));
//       setEditImagePreview(URL.createObjectURL(files[0]));
//     } else {
//       setEditFormData((prevData) => ({
//         ...prevData,
//         [name]: value,
//       }));
//     }
//     setIsFormChanged(true);
//   };

//   const validateForm = () => {
//     const errors = {};
//     if (!formData.name.trim()) errors.name = "Name is required";
//     if (!formData.phone.trim() && !formData.email.trim()) errors.contact = "Either phone or email is required";
//     if (formData.phone && deliveryPersons.some((p) => p.phone === formData.phone))
//       errors.phone = "Phone number must be unique";
//     if (formData.email && deliveryPersons.some((p) => p.email === formData.email)) {
//     errors.email = "Email is already in use";
//   }
//     if (!formData.imageUrl) errors.imageUrl = "Image is required";
//     return errors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     const errors = validateForm();
//     if (Object.keys(errors).length === 0) {
//       const formDataToSend = new FormData();
//       formDataToSend.append('name', formData.name);
//       formDataToSend.append('phone', formData.phone);
//       formDataToSend.append('email', formData.email);
//       formDataToSend.append('imageUrl', formData.imageUrl);

//       try {
//         const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/driver/register`, formDataToSend, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setDeliveryPersons([...deliveryPersons, response.data.driver]);
//         setShowModal(false);
//         toast.success(response.data.message);
//         setFormData({ name: '', phone: '', email: '', imageUrl: null });
//         setImagePreview(null);
//         setFormErrors({});
//         fetchDrivers();
//       } catch (error) {
//         toast.error(error.response.data.message);
//         console.error('Error creating driver:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     } else {
//       setFormErrors(errors);
//     }
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     const formDataToSend = new FormData();
//     formDataToSend.append('name', editFormData.name);
//     formDataToSend.append('phone', editFormData.phone);
//     formDataToSend.append('email', editFormData.email);
//     if (editFormData.imageUrl) {
//       formDataToSend.append('image', editFormData.imageUrl);
//     }

//     try {
//       const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/driver/${selectedDriverId}`, formDataToSend, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setDeliveryPersons(deliveryPersons.map((person) =>
//         person._id === selectedDriverId ? response.data.driver : person
//       ));
//       setShowEditModal(false);
//       toast.success(response.data.message);
//       setEditFormData({ name: '', phone: '', email: '', imageUrl: null });
//       setEditImagePreview(null);
//       setEditFormErrors({});
//       fetchDrivers();
//     } catch (error) {
//       toast.error(error.response.data.message);
//       console.error('Error updating driver:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDelete = (driver) => {
//     setSelectedDriver(driver);
//     setSelectedDriverId(driver._id);
//     setShowDeleteModal(true);
//   };

//   const handleEdit = (driver) => {
//     setSelectedDriver(driver);
//     setSelectedDriverId(driver._id);
//     setEditFormData({
//       name: driver.name,
//       phone: driver.phone,
//       email: driver.email,
//       imageUrl: null,
//     });
//     setEditImagePreview(driver.imageUrl);
//     setShowEditModal(true);
//     setIsFormChanged(false);
//   };

//   const confirmDelete = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/driver/delete-driver/${selectedDriver._id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setDeliveryPersons(deliveryPersons.filter((person) => person._id !== selectedDriver._id));
//       toast.success(response.data.message);
//       setShowDeleteModal(false);
//       setSelectedDriverId(null);
//     } catch (error) {
//       toast.error(error.response?.data?.message);
//       console.error('Error deleting driver:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // New function to handle Assign Order click
//   const handleAssignOrder = (driver) => {
//     setSelectedDriver(driver);
//     setSelectedDriverId(driver._id);
//     setDriverStatus((prevStatus) => ({
//       ...prevStatus,
//       [driver._id]: 'Engaged',
//     }));
//     setShowAssignModal(true);
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       phone: '',
//       email: '',
//       imageUrl: null,
//     });
//     setImagePreview(null);
//     setFormErrors({});
//   };

//   return (
//     <div className="min-h-screen  md:p-6">
//       <div className="max-w-9xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-sm md:text-2xl font-bold flex justify-center gap-2 items-center">
//             <span><FaPeopleGroup /></span>Delivery Persons
//           </h1>
//           <div className='flex justify-end gap-5'>
//             <button
//               onClick={() => setShowModal(true)}
//               className="bg-[#D9291A] text-white px-2 md:px-4 py-2 text-sm md:text-base rounded-lg hover:bg-red-700 flex items-center gap-2"
//             >
//               <Plus className="w-4 h-4" />
//               Add New Driver
//             </button>
//           </div>
//         </div>

//         {deliveryPersons.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
//             {currentPersons.map((person, i) => (
//               <div
//                 key={i}
//                 onClick={() => {
//                   setSelectedDriverId(person._id);
//                   setSelectedDriver(person);
//                 }}
//                 className={`bg-white rounded-lg shadow-sm p-6 group relative ${selectedDriverId === person?._id ? 'border-2 border-red-200' : ''}`}
                
//               >
//                 {person?.imageUrl ? (
//                   <img src={person.imageUrl} alt={person.name} className="w-48 h-48 m-auto rounded-lg mb-4" />
                  
//                 ) : (
//                   <p className="text-gray-600 text-center mb-4">No image available</p>
//                 )}
//                 <h3 className="text-lg font-semibold text-center mb-1">{person?.name}</h3>
                
//                 <p className="text-gray-600 text-center mb-1">{person?.phone}</p>
//                 <p className="text-gray-600 text-center mb-1 truncate">{person?.email}</p>
//                 <p className="text-gray-600 text-center mb-1 truncate">{person?._id}</p>
                

//                 {/* Assign Order / Engaged Button */}
//                 <div className="flex justify-center mt-4">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleAssignOrder(person);
//                     }}
//                     className={`px-4 py-2 rounded-lg text-white ${driverStatus[person._id] === 'Assign Order' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'}`}
//                     disabled={driverStatus[person._id] === 'Engaged'}
//                   >
//                     {driverStatus[person._id]}
//                   </button>
//                 </div>

//                 <div className='absolute top-2 right-2 flex gap-2'>
//                   <button
//                     onClick={(e) => { e.stopPropagation(); handleEdit(person); }}
//                     className="p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
//                   >
//                     <Pencil className="w-4 h-4 text-blue-500" />
//                   </button>
//                   <button
//                     onClick={(e) => { e.stopPropagation(); handleDelete(person); }}
//                     className="p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
//                   >
//                     <Trash2 className="w-4 h-4 text-red-500" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p className="text-center text-gray-600">No drivers available.</p>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex justify-center mt-8 gap-2">
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//               <button
//                 key={page}
//                 onClick={() => handlePageChange(page)}
//                 className={`px-4 py-2 rounded-lg ${currentPage === page
//                   ? 'bg-blue-500 text-white'
//                   : 'bg-white text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 {page}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Add New Person Modal */}
//         {showModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg w-full max-w-md">
//               <div className="flex justify-between items-center p-6 border-b">
//                 <h2 className="text-xl font-semibold">Add New Delivery Person</h2>
//                 <button
//                   onClick={() => {
//                     setShowModal(false);
//                     setFormErrors({});
//                     resetForm();
//                   }}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
//               <form onSubmit={handleSubmit} className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Name
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Phone Number
//                   </label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleInputChange}
//                     maxLength={10}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1 ">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Driver Image
//                   </label>
//                   <input
//                     type="file"
//                     name="imageUrl"
//                     onChange={handleInputChange}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   {formErrors.imageUrl && <p className="text-red-200 text-xs mt-1">{formErrors.imageUrl}</p>}
//                 </div>
//                 {imagePreview && (
//                   <div className="mt-4">
//                     <img src={imagePreview} alt="Preview" className="w-32 h-32 m-auto rounded-lg" />
//                   </div>
//                 )}
//                 <div className="flex justify-end gap-2 mt-6">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowModal(false);
//                       setFormErrors({});
//                       resetForm();
//                     }}
//                     className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-4 py-2 bg-[#d5750a] text-white rounded-lg hover:bg-[#d5750a]"
//                   >
//                     {isLoading ? (
//                       <div className="w-6 h-6 border-4 border-t-[#dfac72] border-gray-300 rounded-full animate-spin"></div>
//                     ) : (
//                       'Add Person'
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Edit Person Modal */}
//         {showEditModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg w-full max-w-md">
//               <div className="flex justify-between items-center p-6 border-b">
//                 <h2 className="text-xl font-semibold">Edit Delivery Person</h2>
//                 <button
//                   onClick={() => setShowEditModal(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
//               <form onSubmit={handleUpdate} className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Name
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={editFormData.name}
//                     onChange={handleEditInputChange}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   {editFormErrors.name && <p className="text-red-500 text-xs mt-1">{editFormErrors.name}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Phone Number
//                   </label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={editFormData.phone}
//                     onChange={handleEditInputChange}
//                     maxLength={10}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   {editFormErrors.phone && <p className="text-red-500 text-xs mt-1">{editFormErrors.phone}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={editFormData.email}
//                     onChange={handleEditInputChange}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Driver Image
//                   </label>
//                   <input
//                     type="file"
//                     name="imageUrl"
//                     onChange={handleEditInputChange}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   {editFormErrors.imageUrl && <p className="text-red-500 text-xs mt-1">{editFormErrors.imageUrl}</p>}
//                 </div>
//                 {editImagePreview && (
//                   <div className="mt-4">
//                     <img src={editImagePreview} alt="Preview" className="w-32 h-32 m-auto rounded-lg" />
//                   </div>
//                 )}
//                 <div className="flex justify-end gap-2 mt-6">
//                   <button
//                     type="button"
//                     onClick={() => setShowEditModal(false)}
//                     className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className={`px-4 py-2 bg-[#d5750a] text-white rounded-lg hover:bg-[#d5750a] ${!isFormChanged ? 'opacity-50 cursor-not-allowed' : ''}`}
//                     disabled={!isFormChanged}
//                   >
//                     {isLoading ? (
//                       <div className="w-6 h-6 border-4 border-t-[#d8a469] border-gray-300 rounded-full animate-spin"></div>
//                     ) : (
//                       'Update'
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Delete Confirmation Modal */}
//         {showDeleteModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg w-full max-w-md">
//               <div className="flex justify-between items-center p-6 border-b">
//                 <h2 className="text-xl font-semibold">Remove Driver?</h2>
//                 <button
//                   onClick={() => setShowDeleteModal(false)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
//               <div className="p-6">
//                 <p className=''>Removing this driver will prevent future order assignments</p>
//                 <div className="flex justify-end gap-2 mt-6">
//                   <button
//                     onClick={() => setShowDeleteModal(false)}
//                     className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={confirmDelete}
//                     className={`px-4 py-2 text-white rounded-lg ${isLoading ? 'bg-red-400' : 'bg-red-500 hover:bg-red-600'}`}
//                     disabled={isLoading}
//                   >
//                     {isLoading ? (
//                       <div className="w-6 h-6 border-4 border-t-[#e2b581] border-gray-300 rounded-full animate-spin"></div>
//                     ) : (
//                       'Yes, Remove Driver'
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Assign Order Modal */}
//         {showAssignModal && selectedDriver && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
//               <button
//                 onClick={() => setShowAssignModal(false)}
//                 className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//               <div className="text-center">
//                 <h2 className="text-xl font-semibold mb-4">Driver Assigned Successfully</h2>
//                 <div className="flex justify-center mb-4">
//                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
//                     <FaCheck className='w-6 h-6' />
//                   </div>
//                 </div>
//                 <div className="mb-4">
//                   <h3 className="font-semibold">DRIVER INFO</h3>
//                   <p>{selectedDriver.name}</p>
//                   <p>Contact no.: {selectedDriver.phone}</p>
//                   <p>Driver ID#: {selectedDriver._id}</p>
//                 </div>
               
               
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Drivers;