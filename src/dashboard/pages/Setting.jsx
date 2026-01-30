import axios from "axios";
import { useEffect, useState } from "react";
import { useToken } from "../../context/StoreProvider";
import toast from "react-hot-toast";
import { RiUploadCloud2Fill } from "react-icons/ri";

const Setting = () => {
  const [selected, setSelected] = useState();
  const [showTextbox, setShowTextbox] = useState(true);
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [paymentSettled, setPaymentSettled] = useState([]);
  const [activeTab, setActiveTab] = useState("Business Profile");
  const [formData, setFormData] = useState({
    kitchenName: "",
    address: "",
    city: "",
    state: "",
    createdAt: "",
    services: [],
    cuisines: [],
    phone: "",
    contactEmail: "",
    bankAccount: "",
    ifscCode: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const { token } = useToken();

  // Fetch Kitchen Details api
  const fetchKitchenDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_KITCHENBASE_URL}/get/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const kitchen = response.data.kitchen;
      setPaymentSettled(response.data.settlements);
      setFormData({
        kitchenName: kitchen.kitchenName || "",
        address: `${kitchen.address.roadName}, ${kitchen.address.city}, ${kitchen.address.state}`,
        city: kitchen.address.city || "",
        state: kitchen.address.state || "",
        createdAt: kitchen.createdAt || "",
        services: kitchen.kitchentype || [],
        cuisines: kitchen.cuisines || [],
        phone: kitchen.phone || "",
        contactEmail: kitchen.contactEmail || "",
        bankAccount: kitchen.banknumber || "",
        ifscCode: kitchen.ifsccode || "",
        image: kitchen.imageUrl || "",
      });
    } catch (error) {
      console.error(
        "Error fetching kitchen details:",
        error.response?.data,
        error.message
      );
      toast.error("Failed to fetch kitchen details");
    } finally {
      setLoading(false);
    }
  };

  // Contact Support api
  const handleSupportSubmit = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_QUERRIES_URL}/create`,
        {
          description,
          tag: selected, // 👈 include category as tag
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Query submitted!");
      setDescription("");
      setSelected("Select Category");
      setShowTextbox(false);
    } catch (err) {
      console.error("Submit error:", err.response?.data, err.message);
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  // Image Upload api
  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }
    const formDataImg = new FormData();
    formDataImg.append("image", selectedImage);
    try {
      setIsImageUploading(true);
      await axios.put(
        `${import.meta.env.VITE_KITCHENBASE_URL}/update/image`,
        formDataImg,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Image updated successfully");
      setSelectedImage(null);
      await fetchKitchenDetails(); // Refresh to show updated image
    } catch (err) {
      console.error("Image upload failed:", err.response?.data, err.message);
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setIsImageUploading(false);
    }
  };

  // Handle Image Selection api
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
    }
  };

  // Phone number Update api
  const handlePhoneUpdate = async () => {
    if (!/^\d{10}$/.test(formData.phone)) {
      toast.error("Phone number must be 10 digits");
      return;
    }
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_KITCHENBASE_URL}/update/phone`,
        { phone: formData.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || "Phone number updated");
    } catch (err) {
      console.error("Phone update failed:", err.response?.data, err.message);
      toast.error(
        err.response?.data?.message || "Failed to update phone number"
      );
    }
  };

  useEffect(() => {
    if (token) {
      fetchKitchenDetails();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100vh]">
        <div className="w-6 h-6 bg-red-500 animate-pulse rounded-full"></div>
      </div>
    );
  }

  const formatDateTime = (dateinput) => {
    const date = new Date(dateinput);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="md:w-64 bg-white shadow-sm rounded-lg">
        {["Business Profile", "Payouts", "Legal", "Contact Support"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 md:py-6 py-4 hover:bg-red-700 hover:text-white ${
                activeTab === tab
                  ? "bg-yellow-100 font-semibold text-lg duration-100 ease-in-out "
                  : ""
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      <div className="flex-1 p-4 bg-white md:ml-4 shadow-sm rounded-lg mt-4 md:mt-0">
        {activeTab === "Business Profile" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-b pb-1">
              Business Profile
            </h2>
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 group">
              <img
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : `${formData.image}?t=${Date.now()}`
                }
                alt="Kitchen profile"
                loading="lazy"
                className={`w-full h-full object-cover ${
                  isImageUploading ? "opacity-50" : ""
                }`}
              />
              {isImageUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                </div>
              )}
              {!isImageUploading && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <RiUploadCloud2Fill />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {selectedImage && !isImageUploading && (
              <div className="flex gap-2">
                <button
                  onClick={handleImageUpload}
                  className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                >
                  Upload Image
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            )}
            <p className="capitalize">
              <strong>Kitchen Name:</strong>{" "}
              {formData.kitchenName || "No Kitchen Name"}
            </p>
            <p className="capitalize">
              <strong>Service Types:</strong>{" "}
              {formData.services.length > 0
                ? formData.services.join(", ")
                : "No services available"}
            </p>
            <p className="capitalize">
              <strong>Location:</strong> {formData.address || "No Address"}
            </p>
            <p className="capitalize">
              <strong>Cuisines:</strong>{" "}
              {formData.cuisines.length > 0
                ? formData.cuisines.join(", ")
                : "No cuisines specified"}
            </p>
            <p>
              <strong>Email:</strong> {formData.contactEmail || "No Email"}
            </p>
            <div className="mb-4 flex items-center">
              <label className="block text-sm pr-2 font-bold">
                Phone Number:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="border p-1 text-sm rounded w-40"
                />
                <button
                  onClick={handlePhoneUpdate}
                  className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Payouts" && (
          <div className="space-y-4 mt-6">
            <h2 className="text-xl font-bold">Payout Summary</h2>
            <p>
              <strong>Last Payout Date:</strong>{" "}
              {paymentSettled?.length > 0 && paymentSettled[0]?.createdAt
                ? new Date(paymentSettled[0].createdAt).toLocaleString()
                : "No Payout Date"}
            </p>
            <p>
              <strong>Last Payout Amount:</strong> ₹{" "}
              {paymentSettled.amount || "0"}.00
            </p>
            <h2 className="text-xl font-bold">Bank Account Details</h2>
            <p>
              <strong>Account Number:</strong>{" "}
              {formData.bankAccount || "No Account Number"}
            </p>
            <p>
              <strong>IFSC Code:</strong> {formData.ifscCode || "No Ifscode"}
            </p>
          </div>
        )}

        {activeTab === "Legal" && (
          <div className="p-4 space-y-4">
            <h5 className="font-semibold">Legal & Policy</h5>

            <p className="text-sm">
              <a
                href="/policyBiteBuddie.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm   hover:text-blue-800 hover:underline"
              >
                View Privacy Policy
              </a>
            </p>

            <p className="text-sm">
              <a
                href="/BiteBuddieTerms_&_Conditions.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm   hover:text-blue-800 hover:underline"
              >
                View Terms & Conditions
              </a>
            </p>
          </div>
        )}

        {activeTab === "Contact Support" && (
          <div className="p-4 space-y-4">
            <p className="text-lg font-semibold">Contact Support</p>

            <div className="w-full">
              <label className="block text-gray-700 font-medium mb-2">
                Select Your Category
              </label>
              <select
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setShowTextbox(true); // 👈 Show textbox when a category is selected
                }}
                className="w-full p-3 border border-gray-200 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#D9291A]"
              >
                <option value="Select Category">Select Category</option>
                <option value="Payout Delay">Payout Delay</option>
                <option value="Delivery">Delivery</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Driver">Driver</option>
              </select>
            </div>

            {showTextbox && (
              <div className="space-y-4">
                <label className="block text-gray-700 font-medium">
                  Write your message
                </label>
                <textarea
                  className="w-full p-2 my-2 border rounded bg-gray-100"
                  rows={6}
                  placeholder="Type your custom reason or query..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSupportSubmit}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Setting;
