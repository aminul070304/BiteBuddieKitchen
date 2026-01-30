// import React, { useEffect, useState } from 'react'
// import { Trash2, Plus } from 'lucide-react'
// import { useToken } from '../../context/StoreProvider'
// import axios from 'axios'
// import toast from 'react-hot-toast';
// import { RxCross2 } from "react-icons/rx";

// const Gallery = () => {
//     const [imageMediaItems, setImageMediaItems] = useState([])
//     const [showPopup, setShowPopup] = useState(false)
//     const [selectedItem, setSelectedItem] = useState(null)
//     const [loading, setLoading] = useState(false)
//     const [selectedImage, setSelectedImage] = useState(null);

//     const { token } = useToken();
//     const baseUrl = import.meta.env.VITE_BASE_URL;

//     const handleFileUpload = async (event) => {
//         const files = event.target.files;
//         setLoading(true)
//         if (files.length > 0) {
//             const formData = new FormData()
//             Array.from(files).forEach(file => {
//                 formData.append('image', file)
//             })

//             try {
//                 const response = await axios.post(`${baseUrl}/gallery/add`, formData, {
//                     headers: {
//                         'Content-Type': 'multipart/form-data',
//                         Authorization: `Bearer ${token}`
//                     }
//                 })
//                 setImageMediaItems([...imageMediaItems, ...response.data.kitchenGallery.imageUrls])
//                 fetchMediaItems();
//                 toast.success(response.data.message)
//             } catch (error) {
//                 toast.error(error?.response?.data?.message)
//                 console.error('Error uploading files:', error)
//             } finally {
//                 setLoading(false)
//             }
//         }
//     }

//     const fetchMediaItems = async () => {
//         setLoading(true)
//         try {
//             const response = await axios.get(`${baseUrl}/gallery/images`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             })
//             setImageMediaItems(response.data.kitchenGallery.imageUrls)
//         } catch (error) {
//             console.error('Error fetching media items:', error)
//         } finally {
//             setLoading(false) // Set loading to false after fetching
//         }
//     }

//     useEffect(() => {
//         if (token) {
//             fetchMediaItems()
//         }
//     }, [token])

//     const confirmDelete = () => {
//         if (selectedItem) {
//             handleImageDelete(selectedItem);
//         } else {
//             toast.error('Image URL is missing');
//         }
//     };

//     const handleImageDelete = async (imageUrl) => {
//         setLoading(true)
//         try {
//             const response = await axios.delete(`${baseUrl}/gallery/delete`, {
//                 data: { imageUrl }, // Send the image URL in the request body
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${token}`
//                 }
//             });

//             // Update the state to remove the deleted image
//             setImageMediaItems(prevItems => prevItems.filter(item => item.imageUrl !== imageUrl));
//             setShowPopup(false)
//             setSelectedItem(null)
//             toast.success(response.data.message);
//             fetchMediaItems()
//         } catch (error) {
//             toast.error(error.response.data.message);
//             console.error('Error deleting image:', error);
//         } finally {
//             setLoading(false)
//         }
//     }

//     const openDeletePopup = (item) => {
//         setSelectedItem(item);
//         setShowPopup(true);
//     };

//     const handleImageClick = (image) => {
//         setSelectedImage(image);
//     };

//     const handleCloseModal = () => {
//         setSelectedImage(null);
//     };

//     return (
//         <div className="min-h-screen bg-[#F0F7F4] md:p-6">
//             <div className="max-w-7xl mx-auto">
//                 <h1 className="text-xl md:text-2xl font-bold mb-6">Gallery</h1>

//                 {/* Images Section */}
//                 <section className="mb-12">
//                     <h2 className=" text-sm md:text-xl md:font-semibold mb-4">Upload Kitchen Images</h2>
//                     <label className="relative bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-200 hover:border-gray-300 cursor-pointer size-24 md:size-28 flex items-center justify-center mb-4 ">
//                         <div className="flex flex-col items-center gap-2">
//                             <Plus className="md:size-10 text-gray-400" />
//                             <span className="md:text-sm text-[12px] text-gray-500">Upload Image</span>
//                         </div>
//                         <input
//                             type="file"
//                             accept="image/*"
//                             onChange={(e) => handleFileUpload(e)}
//                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer "
//                             multiple
//                         />
//                     </label>

//                     {loading ? (
//                         <div className="flex  items-center justify-center mt-4">
//                             <div className="loader">
//                                 <div></div>
//                                 <div></div>
//                                 <div></div>
//                             </div>
//                         </div>
//                     ) : (
//                         imageMediaItems.length > 0 ? (
//                             <div className="flex flex-wrap gap-5 justify-between ">
//                                 {imageMediaItems.map((item, i) => (
//                                     <div key={i} className="relative w-36 h-36 px-1 aspect-square  rounded-lg shadow-sm overflow-hidden group">
//                                         <img
//                                             src={item}
//                                             alt="Kitchen Gallery"
//                                             className="w-36 h-36 object-cover cursor-pointer"
//                                             onClick={() => handleImageClick(item)}
//                                         />
//                                         <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                                             <button
//                                                 onClick={() => openDeletePopup(item)}
//                                                 className=" bg-white rounded-full shadow-md hover:bg-gray-100"
//                                             >
//                                                 <Trash2 className="h-4 w-4 text-red-500" />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <p className="text-gray-500 text-center mt-2">No images.</p>
//                         ))}
//                 </section>

//                 {/* Videos Section */}
//                 <section>
//                     {/* <h2 className="text-xl font-semibold mb-4">Upload Kitchen Videos</h2> */}
//                     {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> */}
//                     {/* {videoItems.map((item) => (
//                             <div key={item.id} className="relative aspect-video bg-white rounded-lg shadow-sm overflow-hidden group">
//                                 <video
//                                     src={item.url}
//                                     className="w-full h-full object-cover"
//                                     controls
//                                 />
//                                 <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                                     <button
//                                         onClick={() => handleDelete(item.id)}
//                                         className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
//                                     >
//                                         <Trash2 className="h-4 w-4 text-red-500" />
//                                     </button>
//                                 </div>
//                             </div>
//                         ))} */}

//                     {/* Upload Video Button */}
//                     {/* <label className={`relative bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-200 hover:border-gray-300 cursor-pointer flex items-center justify-center ${videoItems.length > 0 ? 'aspect-video w-40 h-24' : 'aspect-video'}`}>
//                             <div className="flex flex-col items-center gap-2">
//                                 <Upload className={`${videoItems.length > 0 ? 'h-6 w-6' : 'h-8 w-8'} text-gray-400`} />
//                                 {videoItems.length === 0 && <span className="text-sm text-gray-500">Upload video</span>}
//                             </div>
//                             <input
//                                 type="file"
//                                 accept="video/*"
//                                 onChange={(e) => handleFileUpload(e, 'video')}
//                                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                             />
//                         </label> */}
//                     {/* </div> */}
//                 </section>

//                 {selectedImage && (
//                     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
//                         <div className="relative max-w-4xl md:h-[40rem] p-4 bg-white rounded-lg shadow-lg">
//                             <button
//                                 onClick={handleCloseModal}
//                                 className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
//                             >
//                                 <RxCross2 className='w-5 h-5' />
//                             </button>
//                             <img
//                                 src={selectedImage}
//                                 alt="galleryImage"
//                                 className="w-full h-full object-contain"
//                             />
//                         </div>
//                     </div>
//                 )}

//                 {/* Custom Popup */}
//                 {showPopup && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                         <div className="bg-white rounded-lg p-6 max-w-sm w-full">
//                             <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
//                             <p className="mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
//                             {selectedItem && (
//                                 <img src={selectedItem} alt="To be deleted" className="w-full h-40 object-cover rounded-md mb-4" />
//                             )}
//                             {selectedItem && selectedItem.type === 'video' && (
//                                 <video src={selectedItem.url} className="w-full h-40 object-cover rounded-md mb-4" controls />
//                             )}
//                             <div className="flex justify-end gap-4">
//                                 <button
//                                     onClick={() => setShowPopup(false)}
//                                     className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={confirmDelete}
//                                     className={`px-4 py-2 ${loading ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'} text-white rounded-md `}
//                                     disabled={loading}
//                                 >
//                                     {loading ? <span className="opacity-50">Deleting...</span> : 'Delete'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }

// export default Gallery
