import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useToken } from '../../context/StoreProvider';
import toast from 'react-hot-toast';
import { FaPlus } from 'react-icons/fa6';

const Menu = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingMenu, setIsCreatingMenu] = useState(false);
  const [images, setImages] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [disabledItems, setDisabledItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [open, setOpen] = useState(false);
  const [actionMode, setActionMode] = useState(null);
  const dropdownRef = useRef(null);

  const { token } = useToken();

  const [newMenuItem, setNewMenuItem] = useState({
    title: '',
    baseprice: '',
    description: '',
    category: '',
    imageUrl: '',
    mealTime: ['Lunch'],
    dishtype: 'Veg',
  });

  const imageChange = (e) => {
    setImages(e.target.files[0]);
  };



  const closeMenu = () => {
    setIsCreatingMenu(false);
    setNewMenuItem({
      title: '',
      baseprice: '',
      description: '',
      category: '',
      dishtype: 'Veg',
      mealTime: ['Lunch'],
    });
    setImages(null);
    setError('');
  };


  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };



  // Menu Add api
  const handleCreateMenu = async (e) => {
    e.preventDefault();
    if (!newMenuItem.title || !newMenuItem.baseprice || !newMenuItem.description) {
      setError('Title, Base Price, and Description are required!');
      return;
    }

    if (!images) {
      setError('Please upload an item image!');
      return;
    }

    const wordCount = newMenuItem.description.trim().split(/\s+/).length;
    if (wordCount < 30) {
      setError('Description must be at least 30 words long.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', newMenuItem.title);
    formData.append('baseprice', newMenuItem.baseprice);
    formData.append('description', newMenuItem.description);
    formData.append('category', newMenuItem.category);
    formData.append('dishtype', newMenuItem.dishtype);
    formData.append('mealTime', JSON.stringify(newMenuItem.mealTime));
    formData.append('image', images);

    try {
      const response = await axios.post(`${import.meta.env.VITE_MENUBASE_URL}/create-request`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // setMenuItems((prev) => [...prev, response.data.newFood]);
      closeMenu();
      setNewMenuItem({
        title: '',
        baseprice: '',
        description: '',
        category: '',
        dishtype: 'Veg',
        mealTime: ['Lunch'],
      });
      setImages(null);
      fetchMenuItems();
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating menu item');
      console.log('Error saving menu item:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch menu items api
  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_MENUBASE_URL}/menu/approved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const foods = response.data;
      setMenuItems(foods);
      // console.log('Fetched menu items:', foods);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to fetch menu items');
    }
  };


  // menu edit api
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', editingItem.title);
    formData.append('baseprice', editingItem.baseprice);
    formData.append('description', editingItem.description);
    formData.append('category', editingItem.category);

    formData.append('dishtype', editingItem.dishtype);
    formData.append('mealTime', editingItem.mealTime);
    if (images) {
      formData.append('image', images);
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_MENUBASE_URL}/request-edit/${editingItem._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchMenuItems();
      toast.success(response.data.message);
      setIsEditOpen(false);
      setEditingItem(null);
      setImages(null);
    } catch (error) {
      console.log('Error updating menu item:', error);
      toast.error(error.response?.data?.message || 'Error updating menu item');
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  // delete one selectedItem api
  const handleSingleDeleteItem = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_MENUBASE_URL}/deleteOneItem/${selectedItem._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMenuItems((prev) => prev.filter((item) => item._id !== selectedItem._id));
      setIsDeleteOpen(false);
      setSelectedItem(null);
      toast.success(response.data.message);
      await fetchMenuItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error.response?.data?.message || 'Error deleting menu item');
    } finally {
      setLoading(false);
    }
  };

  // delete all selectedItem api
  const handleAllDeleteItem = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const itemsToDelete = Object.keys(selectedItems).filter((id) => selectedItems[id]);

      if (itemsToDelete.length === 0) {
        toast.error("No items selected for deletion.");
        setLoading(false);
        return;
      }

      const response = await axios.delete(
        `${import.meta.env.VITE_MENUBASE_URL}/deleteAllItems`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            menuIds: itemsToDelete,
          },
        }
      );

      // Remove deleted items from UI
      setMenuItems((prev) => prev.filter(item => !itemsToDelete.includes(item._id)));
      setSelectedItems({});
      setSelectAll(false);
      setIsDeleteOpen(false);
      setSelectedItem(null);
      setDisabledItems({});
      setActionMode(null);
      toast.success(`${response.data.deletedCount} item(s) deleted successfully.`);
      await fetchMenuItems();
    } catch (error) {
      console.error('Error deleting all items:', error);
      toast.error(error.response?.data?.message || 'Error deleting all menu items');
    } finally {
      setLoading(false);
    }
  };

  // Toggle disibale enable item availability api
  const handleToggleAvailable = async (itemId) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_MENUBASE_URL}/toggleDisable/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newAvailability = response.data.isAvailable;

      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemId ? { ...item, isAvailable: newAvailability } : item
        )
      );

      if (selectedItem && selectedItem._id === itemId) {
        setSelectedItem((prev) => ({
          ...prev,
          isAvailable: newAvailability,
        }));
      }

      toast.success(`Item ${newAvailability ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to update item availability: ${error.response?.data?.message || 'Unknown error'}`);
    }
  };

  // disabled all items api
  const handleDisableAllItems = async () => {
    setLoading(true);
    try {
      const itemsToDisable = Object.keys(selectedItems).filter((id) => selectedItems[id]);

      const response = await axios.patch(
        `${import.meta.env.VITE_MENUBASE_URL}/disableAllItems`,
        {
          menuIds: itemsToDisable,
          isAvailable: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`${response.data.modifiedCount} item(s) disabled successfully`);

      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          itemsToDisable.includes(item._id) ? { ...item, isAvailable: false } : item
        )
      );

      setSelectedItems({});
      setSelectAll(false);
      setActionMode(null);
    } catch (error) {
      console.error('Error enabling items:', error);
      toast.error(error.response?.data?.message || 'Error enabling selected items');
    } finally {
      setLoading(false);
    }
  };


  // enable all items api
  const handleEnableAllItems = async () => {
    setLoading(true);
    try {
      const itemsToDisable = Object.keys(selectedItems).filter((id) => selectedItems[id]);

      const response = await axios.patch(
        `${import.meta.env.VITE_MENUBASE_URL}/disableAllItems`,
        {
          menuIds: itemsToDisable,
          isAvailable: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`${response.data.modifiedCount} item(s) disabled successfully`);

      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          itemsToDisable.includes(item._id) ? { ...item, isAvailable: true } : item
        )
      );

      setSelectedItems({});
      setSelectAll(false);
      setActionMode(null);
    } catch (error) {
      console.error('Error disabling items:', error);
      toast.error(error.response?.data?.message || 'Error disabling selected items');
    } finally {
      setLoading(false);
    }
  };

  const handleItemCheckboxChange = (itemId, checked) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: checked,
    }));
  };

  useEffect(() => {
    if (selectAll) {
      const newSelectedItems = {};
      menuItems.forEach((item) => {
        newSelectedItems[item._id] = true;
      });
      setSelectedItems(newSelectedItems);
    } else {
      setSelectedItems({});
    }
  }, [selectAll, menuItems]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const convertNewlinesToBr = (text) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center ">
          <h1 className="text-lg font-semibold md:font-semibold">Menu Items</h1>
        </div>

        <div className="flex items-center justify-end gap-4 relative" ref={dropdownRef}>
          {(actionMode === 'delete' || actionMode === 'disable' || actionMode === 'enable') && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="selectAllCheckbox"
                checked={selectAll}
                onChange={() => setSelectAll(!selectAll)}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
              />
              <label htmlFor="selectAllCheckbox" className="text-gray-700 text-lg cursor-pointer">
                Select All
              </label>
            </div>
          )}

          <div
            className="flex flex-col items-center justify-center gap-1 w-6 h-8 mb-2 cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            <span className="w-1 h-1 bg-black rounded-full"></span>
            <span className="w-1 h-1 bg-black rounded-full"></span>
            <span className="w-1 h-1 bg-black rounded-full"></span>
          </div>

          {open && (
            <div className="absolute top-8 right-0 w-40 bg-white border rounded shadow-md z-10">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setActionMode('disable');
                  setOpen(false);
                }}
              >
                Disable item
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setActionMode('enable');
                  setOpen(false);
                }}
              >
                Enable item
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setActionMode('delete');
                  setOpen(false);
                }}
              >
                Delete item
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 order-1 md:order-2">
          <div className="bg-white rounded-lg shadow-sm p-2 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">All Items</h3>
              <button
                className="flex items-center justify-center gap-2 w-40 sm:w-48 md:w-40 h-10 sm:h-12 px-4 bg-white border border-black rounded-xl text-black font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 hover:bg-green-600 hover:text-white active:scale-95 hover:border-none"
                onClick={() => setIsCreatingMenu(true)}
                aria-label="Add items"
              >
                <FaPlus className="text-base sm:text-lg md:text-xl" />
                <span>Add Items</span>
              </button>
            </div>

            <div className="flex items-start justify-between mb-4 text-gray-500">
              <span className="md:text-base text-sm">Items</span>
              <span className="md:text-base text-sm">Final price</span>
            </div>

            <div className="space-y-2 md:space-y-2 overflow-y-auto pr-2" style={{ maxHeight: '580px' }}>
              {menuItems.length > 0 ? (
                menuItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedItem(item)}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${selectedItem?._id === item._id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''} ${!item.isAvailable ? 'bg-gray-100 opacity-60' : ''}`}
                  >
                    <div className='flex items-center'>
                      {(actionMode === 'delete' || actionMode === 'disable' || actionMode === 'enable') && (
                        <input
                          type="checkbox"
                          checked={!!selectedItems[item._id]}
                          onChange={(e) => handleItemCheckboxChange(item._id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 mr-2"
                        />
                      )}
                      <span className="text-gray-600 sm:text-base md:text-xl text-xs capitalize">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-gray-600 sm:text-base md:text-xl text-xs">
                      ₹{item.baseprice}
                    </span>
                  </div>
                ))
              ) : (
                <p>No items available.</p>
              )}
            </div>

            {(actionMode === 'delete' || actionMode === 'disable' || actionMode === 'enable') && (
              <div className="flex justify-end items-center gap-3 mt-12">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                  onClick={() => {
                    setActionMode(null);
                    setSelectedItems({});
                    setSelectAll(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  className={`px-4 py-2 flex items-center gap-2 text-white rounded-md ${actionMode === 'delete'
                    ? 'bg-red-500'
                    : actionMode === 'disable'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                    }`}
                  onClick={
                    actionMode === 'delete'
                      ? handleAllDeleteItem
                      : actionMode === 'disable'
                        ? handleDisableAllItems
                        : handleEnableAllItems
                  }
                  disabled={!Object.values(selectedItems).some((checked) => checked) || loading}
                >
                  {loading ? (
                    <div>
                      {actionMode === 'delete'
                        ? 'Deleting Selected Items...'
                        : actionMode === 'disable'
                          ? 'Disabling Selected Items...'
                          : 'Enabling Selected Items...'}
                    </div>
                  ) : (
                    <>
                      {actionMode === 'delete'
                        ? 'Delete Selected'
                        : actionMode === 'disable'
                          ? 'Disable Selected'
                          : 'Enable Selected'}
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 relative">
            {selectedItem ? (
              <>
                <div className="flex flex-col items-start mb-6 pt-10">
                  <div className="absolute top-4 right-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={selectedItem.isAvailable}
                        onChange={() => handleToggleAvailable(selectedItem._id)}
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#FFEFB7] transition-colors duration-300"></div>
                      <div className="absolute w-5 h-5 bg-white rounded-full border border-gray-300 peer-checked:bg-green-500 peer-checked:border-green-500 peer-checked:translate-x-5 transition-all duration-300 top-0.5 left-0.5"></div>
                    </label>
                  </div>
                  <h3 className="text-lg font-medium mb-2 border border-[#D9291A] w-full rounded-lg py-1 p-4 capitalize">{selectedItem.title}</h3>
                  <div className="text-lg font-medium mb-2 border border-[#D9291A] w-full rounded-lg py-1 p-4">₹ {selectedItem.baseprice}</div>
                  <div className="text-base font-medium mb-2 border border-[#D9291A] w-full rounded-lg py-1 p-4">{selectedItem.dishtype}</div>
                  <div className="text-base font-medium mb-2 border border-[#D9291A] w-full rounded-lg py-1 p-4">{selectedItem.mealTime.join(',')}</div>
                </div>

                <div className="mb-6">
                  <h4 className="block text-xl font-bold text-black mb-2">Description</h4>
                  <p className="text-base text-gray-800 p-4 text-justify border border-[#D9291A] w-full rounded-lg">
                    {convertNewlinesToBr(selectedItem.description)}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="w-full h-60 rounded-md overflow-hidden">
                    {selectedItem.imageUrl ? (
                      <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                        No image available
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-6 gap-5">
                    <button
                      className="bg-[#D9291A] px-3 rounded text-white py-2"
                      onClick={() => handleOpenDelete(selectedItem)}
                    >
                      Delete Menu
                    </button>
                    <button
                      className="bg-[#FFC700] px-6 rounded text-black py-2"
                      onClick={() => handleEditItem(selectedItem)}
                    >
                      Edit
                    </button>
                  </div>
                </div>

              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <h4 className="mb-5">No menu item selected.</h4>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* menu Creating */}
      {isCreatingMenu && (
        <div className="inset-0 fixed left-0 md:left-52 bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded-md w-[88%] md:w-1/2 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Item</h2>
            {error && (
              <div className="px-2 py-3 bg-red-400 text-white rounded-lg mb-4 text-center">
                {error}
              </div>
            )}
            {loading && (
              <div className="px-2 py-3 bg-green-400 text-white rounded-lg mb-4 text-center">
                Loading...
              </div>
            )}
            <input
              type="text"
              name="title"
              placeholder="Item name"
              value={newMenuItem.title}
              onChange={(e) => setNewMenuItem({ ...newMenuItem, title: e.target.value })}
              className="w-full mb-3 p-2 border-2 border-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
            />
            <input
              type="number"
              name="baseprice"
              placeholder="Item price"
              value={newMenuItem.baseprice}
              onChange={(e) => setNewMenuItem({ ...newMenuItem, baseprice: e.target.value })}
              className="w-full mb-3 p-2 border-2 border-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
            />
            <textarea
              name="description"
              placeholder="Item description"
              value={newMenuItem.description}
              onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
              className="w-full mb-3 p-2 border-2 border-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
            />
            <input
              type="text"
              name="category"
              placeholder="Category (e.g., Indian, Chinese)"
              value={newMenuItem.category}
              onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
              className="w-full mb-3 p-2 border-2 border-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
            />
            <input
              type="file"
              name="imageUrl"
              onChange={imageChange}
              className="w-full mb-3 p-2 border-2 border-red-600 rounded-md"
              required
            />
            <div className="mb-3">
              <div className="flex gap-4">
                <label>
                  <input
                    type="radio"
                    name="type"
                    value="Veg"
                    checked={newMenuItem.dishtype === 'Veg'}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, dishtype: e.target.value })}
                    className="mr-1"
                  />
                  Veg
                </label>
                <label>
                  <input
                    type="radio"
                    name="type"
                    value="Non-Veg"
                    checked={newMenuItem.dishtype === 'Non-Veg'}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, dishtype: e.target.value })}
                    className="mr-1"
                  />
                  Non-Veg
                </label>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex gap-4">
                <label>
                  <input
                    type="checkbox"
                    name="lunch"
                    checked={newMenuItem.mealTime.includes('Lunch')}
                    onChange={(e) =>
                      setNewMenuItem({
                        ...newMenuItem,
                        mealTime: e.target.checked
                          ? [...newMenuItem.mealTime, 'Lunch']
                          : newMenuItem.mealTime.filter((type) => type !== 'Lunch'),
                      })
                    }
                    className="mr-1"
                  />
                  Lunch
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="dinner"
                    checked={newMenuItem.mealTime.includes('Dinner')}
                    onChange={(e) =>
                      setNewMenuItem({
                        ...newMenuItem,
                        mealTime: e.target.checked
                          ? [...newMenuItem.mealTime, 'Dinner']
                          : newMenuItem.mealTime.filter((type) => type !== 'Dinner'),
                      })
                    }
                    className="mr-1"
                  />
                  Dinner
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="breakfast"
                    checked={newMenuItem.mealTime.includes('Breakfast')}
                    onChange={(e) =>
                      setNewMenuItem({
                        ...newMenuItem,
                        mealTime: e.target.checked
                          ? [...newMenuItem.mealTime, 'Breakfast']
                          : newMenuItem.mealTime.filter((type) => type !== 'Breakfast'),
                      })
                    }
                    className="mr-1"
                  />
                  Breakfast
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="snacks"
                    checked={newMenuItem.mealTime.includes('Snacks')}
                    onChange={(e) =>
                      setNewMenuItem({
                        ...newMenuItem,
                        mealTime: e.target.checked
                          ? [...newMenuItem.mealTime, 'Snacks']
                          : newMenuItem.mealTime.filter((type) => type !== 'Snacks'),
                      })
                    }
                    className="mr-1"
                  />
                  Snacks
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                onClick={closeMenu}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 ${loading ? 'cursor-not-allowed opacity-50' : ''} bg-yellow-500 text-white rounded-md`}
                onClick={handleCreateMenu}
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-t-[#7cf336] border-white rounded-full animate-spin"></div>
                ) : (
                  'Add to Menu'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Menu Edit */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-[90%] md:w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Item</h3>
            {loading && (
              <div className="px-2 py-3 bg-green-400 text-white rounded-lg mb-4 text-center">
                Loading...
              </div>
            )}
            <input
              type="text"
              value={editingItem.title}
              onChange={(e) => {
                setEditingItem({ ...editingItem, title: e.target.value });
                setIsUpdating(true);
              }}
              className="w-full mb-1 md:mb-3 p-2 border "
            />
            <input
              type="number"
              value={editingItem.baseprice}
              onChange={(e) => {
                setEditingItem({ ...editingItem, baseprice: e.target.value });
                setIsUpdating(true);
              }}
              className="w-full mb-1 md:mb-3 p-2 border"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={editingItem.description}
              onChange={(e) => {
                setEditingItem({ ...editingItem, description: e.target.value });
                setIsUpdating(true);
              }}
              className="w-full mb-1 md:mb-3 p-2 border"
            />
            <div className="mb-3">
              <div className="flex gap-4">
                <label>
                  <input
                    type="radio"
                    name="type"
                    value="Veg"
                    checked={editingItem.dishtype === 'Veg'}
                    onChange={(e) => {
                      setEditingItem({ ...editingItem, dishtype: e.target.value });
                      setIsUpdating(true);
                    }}
                  />
                  Veg
                </label>
                <label>
                  <input
                    type="radio"
                    name="type"
                    value="Non-Veg"
                    checked={editingItem.dishtype === 'Non-Veg'}
                    onChange={(e) => {
                      setEditingItem({ ...editingItem, dishtype: e.target.value });
                      setIsUpdating(true);
                    }}
                  />
                  Non-Veg
                </label>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex gap-4">
                <label>
                  <input
                    type="checkbox"
                    name="lunch"
                    checked={editingItem.mealTime.includes('Lunch')}
                    onChange={(e) => {
                      setEditingItem({
                        ...editingItem,
                        mealTime: e.target.checked
                          ? [...editingItem.mealTime, 'Lunch']
                          : editingItem.mealTime.filter((type) => type !== 'Lunch'),
                      });
                      setIsUpdating(true);
                    }}
                    className="mr-1"
                  />
                  Lunch
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="dinner"
                    checked={editingItem.mealTime.includes('Dinner')}
                    onChange={(e) => {
                      setEditingItem({
                        ...editingItem,
                        mealTime: e.target.checked
                          ? [...editingItem.mealTime, 'Dinner']
                          : editingItem.mealTime.filter((type) => type !== 'Dinner'),
                      });
                      setIsUpdating(true);
                    }}
                    className="mr-1"
                  />
                  Dinner
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="breakfast"
                    checked={editingItem.mealTime.includes('Breakfast')}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        mealTime: e.target.checked
                          ? [...editingItem.mealTime, 'Breakfast']
                          : editingItem.mealTime.filter((type) => type !== 'Breakfast'),
                      })
                    }
                    className="mr-1"
                  />
                  Breakfast
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="snacks"
                    checked={editingItem.mealTime.includes('Snacks')}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        mealTime: e.target.checked
                          ? [...editingItem.mealTime, 'Snacks']
                          : editingItem.mealTime.filter((type) => type !== 'Snacks'),
                      })
                    }
                    className="mr-1"
                  />
                  Snacks
                </label>
              </div>
            </div>
            <input
              type="file"
              name="image"
              onChange={imageChange}
              className="w-full mb-1 md:mb-3 p-2 border"
            />
            {editingItem && (
              <div className="mb-6">
                {editingItem.imageUrl ? (
                  <img
                    src={editingItem.imageUrl}
                    alt={editingItem.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                    No image available
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingItem(null);
                  setImages(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-md text-white ${isUpdating ? 'bg-green-500' : 'bg-gray-300 cursor-not-allowed'}`}
                onClick={handleUpdateItem}
                disabled={!isUpdating}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      {/* menu Delete Confirmation */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            {loading && (
              <div className="px-2 py-3 bg-red-400 text-white rounded-lg mb-4 text-center">
                Deleting...
              </div>
            )}
            <p>
              Are you sure you want to delete{' '}
              <span className="text-red-700 text-xl">{selectedItem.title}</span>?
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                onClick={() => setIsDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={handleSingleDeleteItem}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;    