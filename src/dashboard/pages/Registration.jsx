import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { Check } from "lucide-react";
import axios from "axios";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import { toast } from "react-hot-toast";
import { useToken } from "../../context/StoreProvider";

const Registration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [cities, setCities] = useState([]);
  const [imageUploading, setImageUploading] = useState(false); // New state for upload loading
  const location = useLocation();
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(userLocation || { lat: 20.3474, lng: 85.8864 });
  const [mapZoom, setMapZoom] = useState(12);

  const fileInputRef = useRef(null);
  const phoneNumber = location.state?.phone || "";
  const [formData, setFormData] = useState({
    ownerName: "",
    kitchenName: "",
    imageUrl: "", // Changed from `image` to `imageUrl` to store Cloudinary URL
    latitude: null,
    longitude: null,
    address: {
      roadName: "",
      city: "",
      state: "",
      pincode: "",
    },
    contactEmail: "",
    mobileNumber: phoneNumber || "",
    cityName: "",
    locationId: "",
    whatsapp: "",
    usesSameMobileForWhatsapp: true,
    workingDays: [],
    hasSameTimings: true,
    workingHours: [
      {
        day: "",
        openingTime: "",
        closingTime: "",
      },
    ],
    panname: "",
    panNumber: "",
    gstNumber: "",
    ifsccode: "",
    banknumber: "",
    licenseDetails: "",
    documents: {
      panImage: null,
    },
    isChecked: false,
    mealTimeSlots: [
      { name: "Breakfast", startTime: "", endTime: "", isSelected: false },
      { name: "Lunch", startTime: "", endTime: "", isSelected: false },
      { name: "Snacks", startTime: "", endTime: "", isSelected: false },
      { name: "Dinner", startTime: "", endTime: "", isSelected: false },
    ],
    kitchentype: [],
    cuisines: [],
    isOpen: true,
    deliverytype: ["Bitebuddie Delivery"],
  });

  const [cuisines, setCuisines] = useState(["Indian", "Chinese", "Italian"]);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newCuisine, setNewCuisine] = useState("");
  const [errors, setErrors] = useState({});
  const { registerToken } = useToken();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [placesReady, setPlacesReady] = useState(false);
  let debounceTimer = useRef(null);

  // Fetch cities from API
  const fetchCities = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_CITYBASE_URL}/locations`);
      if (response.data.data) {
        setCities(response.data.data);
        // console.log("City list:", response.data.data);
      } else {
        toast.error("No cities found");
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Failed to load cities");
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  // Handlers for Meal Time Slots
  const handleMealSlotCheckboxChange = (mealName) => {
    setFormData((prev) => ({
      ...prev,
      mealTimeSlots: prev.mealTimeSlots.map((slot) =>
        slot.name === mealName
          ? { ...slot, isSelected: !slot.isSelected }
          : slot
      ),
    }));
  };

  const handleMealSlotTimeChange = (mealName, field, value) => {
    setFormData((prev) => ({
      ...prev,
      mealTimeSlots: prev.mealTimeSlots.map((slot) =>
        slot.name === mealName ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  // Handlers for Cuisines
  const handleCuisineChange = (cuisine) => {
    setFormData((prev) => {
      const updatedCuisines = prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((item) => item !== cuisine)
        : [...prev.cuisines, cuisine];
      return { ...prev, cuisines: updatedCuisines };
    });
  };

  const handleSelectAllCuisines = () => {
    setFormData((prev) => ({
      ...prev,
      cuisines: prev.cuisines.length === cuisines.length ? [] : [...cuisines],
    }));
  };

  const handleAddCuisine = () => {
    if (newCuisine.trim() && !cuisines.includes(newCuisine.trim())) {
      setCuisines([...cuisines, newCuisine.trim()]);
      setFormData((prev) => ({
        ...prev,
        cuisines: [...prev.cuisines, newCuisine.trim()],
      }));
      setNewCuisine("");
      setShowAddInput(false);
    }
  };

  // Handlers for Service Types
  const handleServiceTypeChange = (serviceType) => {
    setFormData((prev) => ({
      ...prev,
      kitchentype: prev.kitchentype.includes(serviceType)
        ? prev.kitchentype.filter((item) => item !== serviceType)
        : [...prev.kitchentype, serviceType],
    }));
  };

  const handleSelectAllServiceTypes = () => {
    const allServiceTypes = [
      "Instant",
    ];
    setFormData((prev) => ({
      ...prev,
      kitchentype:
        prev.kitchentype.length === allServiceTypes.length
          ? []
          : [...allServiceTypes],
    }));
  };

  // Handlers for Working Days
  const handleCheckboxChange = (day) => {
    setFormData((prev) => {
      const updatedDays = prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day];
      const updatedHours = updatedDays.map((d, index) => ({
        day: d,
        openingTime: prev.workingHours[index]?.openingTime || "",
        closingTime: prev.workingHours[index]?.closingTime || "",
      }));
      return {
        ...prev,
        workingDays: updatedDays,
        workingHours: updatedHours,
      };
    });
  };

  const selectAllDays = () => {
    const allDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    setFormData((prev) => {
      const isAllSelected = prev.workingDays.length === allDays.length;
      const updatedDays = isAllSelected ? [] : allDays;
      const updatedHours = updatedDays.map((day) => ({
        day,
        openingTime: prev.workingHours[0]?.openingTime || "",
        closingTime: prev.workingHours[0]?.closingTime || "",
      }));
      return {
        ...prev,
        workingDays: updatedDays,
        workingHours: updatedHours,
      };
    });
  };

  // Image Upload Handler
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PNG, JPEG, or JPG files are allowed");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setImageUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("image", file);

      const response = await axios.post(
        `${import.meta.env.VITE_KITCHENBASE_URL}/upload`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${registerToken}`,
          },
        }
      );

      if (response.status === 200) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: response.data.kitchen.imageUrl,
        }));
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.response?.data?.message || "Failed to upload image");
      setFormData((prev) => ({ ...prev, imageUrl: "" }));
    } finally {
      setImageUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProceed = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      if (currentStep < 3) {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (currentStep === 1) {
      if (!formData.ownerName.trim()) errors.ownerName = "Owner Name is required";
      if (!formData.kitchenName.trim()) errors.kitchenName = "Kitchen Name is required";
      if (!formData.address.roadName.trim()) errors.address = "Road Name is required";
      if (!formData.contactEmail.trim()) errors.contactEmail = "Email is required";
      if (!formData.mobileNumber.trim()) errors.mobileNumber = "Mobile Number is required";
      if (!formData.cityName.trim()) errors.city = "City is required";
      if (!formData.imageUrl) errors.imageUrl = "Kitchen image is required"; // Added validation
      if (formData.workingDays.length === 0) errors.workingDays = "At least one working day is required";
      if (formData.hasSameTimings) {
        if (!formData.workingHours[0]?.openingTime.trim()) errors.openingTime = "Open Time is required";
        if (!formData.workingHours[0]?.closingTime.trim()) errors.closingTime = "Close Time is required";
      } else {
        formData.workingDays.forEach((day, index) => {
          if (!formData.workingHours[index]?.openingTime.trim())
            errors[`openingTime_${day}`] = `${day} Open Time is required`;
          if (!formData.workingHours[index]?.closingTime.trim())
            errors[`closingTime_${day}`] = `${day} Close Time is required`;
        });
      }

      if (formData.mealTimeSlots.every((slot) => !slot.isSelected))
        errors.mealTimeSlots = "At least one meal time slot must be selected";
      formData.mealTimeSlots.forEach((slot) => {
        if (slot.isSelected) {
          if (!slot.startTime.trim())
            errors[`startTime_${slot.name}`] = `${slot.name} Start Time is required`;
          if (!slot.endTime.trim())
            errors[`endTime_${slot.name}`] = `${slot.name} End Time is required`;
        }
      });
      if (formData.cuisines.length === 0)
        errors.cuisines = "At least one cuisine must be selected";
      if (formData.kitchentype.length === 0)
        errors.kitchentype = "At least one service type must be selected";
    }
    if (currentStep === 2) {
      if (!formData.panname.trim()) errors.panname = "PAN Name is required";
      if (!formData.panNumber.trim()) errors.panNumber = "PAN Number is required";
      if (!formData.gstNumber.trim()) errors.gstNumber = "GSTIN is required";
      if (!formData.ifsccode.trim()) errors.ifsccode = "IFSC Code is required";
      if (!formData.banknumber.trim()) errors.banknumber = "Bank Account is required";
      if (!formData.licenseDetails.trim()) errors.licenseDetails = "FSSAI Number is required";
    }
    if (currentStep === 3) {
      if (!formData.isChecked) errors.isChecked = "You must accept the terms and conditions";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pre-submission validation
    if (!formData.workingDays.length) {
      toast.error("At least one working day is required");
      return;
    }
    if (formData.mealTimeSlots.every((slot) => !slot.isSelected)) {
      toast.error("At least one meal time slot must be selected");
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      toast.error("Location coordinates are required");
      return;
    }
    if (!formData.kitchentype.length) {
      toast.error("At least one service type is required");
      return;
    }
    if (!formData.cuisines.length) {
      toast.error("At least one cuisine is required");
      return;
    }
    if (!formData.imageUrl) {
      toast.error("Kitchen image is required");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("ownerName", formData.ownerName);
      formDataToSend.append("kitchenName", formData.kitchenName);
      formDataToSend.append("phone", phoneNumber);
      formDataToSend.append("latitude", formData.latitude);
      formDataToSend.append("longitude", formData.longitude);
      formDataToSend.append("contactEmail", formData.contactEmail);
      formDataToSend.append("whatsapp", formData.usesSameMobileForWhatsapp ? formData.mobileNumber : formData.whatsapp);
      formDataToSend.append("isOpen", formData.isOpen);
      formDataToSend.append("hasSameTimings", formData.hasSameTimings);
      formDataToSend.append("kitchentype", JSON.stringify(formData.kitchentype));
      formDataToSend.append("deliverytype", JSON.stringify(formData.deliverytype));
      formDataToSend.append("cuisines", JSON.stringify(formData.cuisines));
      formDataToSend.append("workingDays", JSON.stringify(formData.workingDays));
      formDataToSend.append(
        "workingHours",
        JSON.stringify(
          formData.workingDays.map((day, index) => ({
            day,
            openingTime: formData.workingHours[index]?.openingTime || "00:00",
            closingTime: formData.workingHours[index]?.closingTime || "23:59",
          }))
        )
      );
      formDataToSend.append(
        "mealTimeSlots",
        JSON.stringify(
          formData.mealTimeSlots
            .filter((slot) => slot.isSelected)
            .map(({ name, startTime, endTime }) => ({
              name,
              startTime: startTime || "00:00",
              endTime: endTime || "23:59",
            }))
        )
      );
      formDataToSend.append("panname", formData.panname);
      formDataToSend.append("panNumber", formData.panNumber);
      formDataToSend.append("gstNumber", formData.gstNumber);
      formDataToSend.append("ifsccode", formData.ifsccode);
      formDataToSend.append("banknumber", formData.banknumber);
      formDataToSend.append("licenseDetails", formData.licenseDetails);
      formDataToSend.append("imageUrl", formData.imageUrl); // Use imageUrl
      formDataToSend.append("address[roadName]", formData.address.roadName);
      formDataToSend.append("address[city]", formData.address.city);
      formDataToSend.append("address[state]", formData.address.state);
      formDataToSend.append("address[pincode]", formData.address.pincode);
      formDataToSend.append("locationId", formData.locationId)
      formDataToSend.append("cityName", formData.cityName)



      const response = await axios.post(
        `${import.meta.env.VITE_KITCHENBASE_URL}/register`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${registerToken}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        navigate("/");
        toast.success(response.data.message);
      }

      // console.log(response.data)
    } catch (error) {
      console.error("Error registering kitchen:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      toast.error(error.response?.data?.message || "Failed to register kitchen");
    }
  };

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      // Optionally set initial form data to user's location
      if (!formData.latitude && !formData.longitude) {
        setFormData((prev) => ({
          ...prev,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        }));
      }
    }
  }, [userLocation]);

  const handleMapClick = (event) => {
    if (event && event.detail.latLng) {
      const lat = event.detail.latLng.lat;
      const lng = event.detail.latLng.lng;
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
      setMapCenter({ lat, lng });
    }
  };

  const handleContinueClick = async () => {
    try {
      const payload = {
        latitude: formData.latitude,
        longitude: formData.longitude,
        phone: phoneNumber,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_KITCHENBASE_URL}/latlng`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${registerToken}`,
          },
        }
      );
      if (response.status === 200) {
        setShowAddressInput(true);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Failed to save location:", error);
      toast.error(error.response?.data?.message || "Failed to save location");
    }
  };

  const handleLocationInputClick = () => {
    setShowMap(true);
  };

  const handleAddressSubmit = async () => {
    try {
      const userAddress = {
        roadName: formData.address.roadName,
        city: formData.address.city,
        state: formData.address.state,
        pincode: formData.address.pincode,
        phone: phoneNumber,
      };
      const response = await axios.post(
        `${import.meta.env.VITE_KITCHENBASE_URL}/address`,
        userAddress,
        {
          headers: {
            Authorization: `Bearer ${registerToken}`,
          },
        }
      );
      if (response.status === 200) {
        const savedAddress = response.data.address;
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            ...savedAddress,
          },
        }));
        setShowAddressInput(false);
        setShowMap(false);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Failed to save address:", error);
      toast.error(error.response?.data?.message || "Failed to save address");
    }
  };

  const handleTermsCheckboxChange = () => {
    setFormData((prev) => ({
      ...prev,
      isChecked: !prev.isChecked,
    }));
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setErrors({});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  // const handleSearchLocation = async () => {
  //   const input = document.getElementById("locationSearch");
  //   if (!input || !input.value) return;

  //   try {
  //     const res = await fetch(
  //       `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
  //         input.value
  //       )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
  //     );
  //     const data = await res.json();

  //     if (data.status === "OK") {
  //       const { lat, lng } = data.results[0].geometry.location;

  //       setFormData((prev) => ({
  //         ...prev,
  //         latitude: lat,
  //         longitude: lng,
  //       }));

  //       if (mapRef.current) {
  //         mapRef.current.setCenter({ lat, lng });
  //         mapRef.current.setZoom(14);
  //       }
  //     } else {
  //       toast.error("Location not found. Try another search.");
  //     }
  //   } catch (err) {
  //     console.error("Geocoding error:", err);
  //   }
  // };

  // Fetch place predictions (autocomplete API)
  // const fetchSuggestions = async (input) => {
  //   if (!input) {
  //     setSuggestions([]);
  //     return;
  //   }

  //   try {
  //     const res = await fetch(
  //       `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
  //         input
  //       )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
  //     );
  //     const data = await res.json();

  //     if (data.status === "OK") {
  //       setSuggestions(data.predictions);
  //     } else {
  //       setSuggestions([]);
  //     }
  //   } catch (err) {
  //     console.error("Autocomplete error:", err);
  //   }
  // };

  // Handle typing with debounce
  // const handleMapInputChange = (e) => {
  //   const value = e.target.value;
  //   setSearchValue(value);

  //   if (debounceTimer.current) clearTimeout(debounceTimer.current);

  //   debounceTimer.current = setTimeout(() => {
  //     fetchSuggestions(value);
  //   }, 3000); // 3 sec debounce
  // };

  // Handle selecting suggestion
  // const handleSuggestionClick = async (placeId, description) => {
  //   setSearchValue(description);
  //   setSuggestions([]);

  //   try {
  //     // Get place details (to get lat/lng)
  //     const res = await fetch(
  //       `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
  //     );
  //     const data = await res.json();

  //     if (data.status === "OK") {
  //       const { lat, lng } = data.results[0].geometry.location;

  //       setFormData((prev) => ({
  //         ...prev,
  //         latitude: lat,
  //         longitude: lng,
  //       }));

  //       if (mapRef.current) {
  //         mapRef.current.setCenter({ lat, lng });
  //         mapRef.current.setZoom(14);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Place details error:", err);
  //   }
  // };

  // const [searchValue, setSearchValue] = useState("");
  // const [suggestions, setSuggestions] = useState([]);

  const autocompleteServiceRef = useRef(null);
  const geocoderRef = useRef(null);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null); // for click-outside detection

  /* ---------- Load Google Maps JS with Places library if needed ---------- */


  /* ---------- Load Google Maps JS with Places library if needed ---------- */
  useEffect(() => {
    if (typeof window !== "undefined" && window.google && window.google.maps && window.google.maps.places) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      geocoderRef.current = new window.google.maps.Geocoder();
      setPlacesReady(true);
      return;
    }

    if (typeof window === "undefined") return;

    const scriptId = "google-maps-places-script";
    if (document.getElementById(scriptId)) {
      const check = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
          geocoderRef.current = new window.google.maps.Geocoder();
          setPlacesReady(true);
          clearInterval(check);
        }
      }, 200);
      return () => clearInterval(check);
    }

    const s = document.createElement("script");
    s.id = scriptId;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    s.async = true;
    s.defer = true;
    s.onload = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        geocoderRef.current = new window.google.maps.Geocoder();
        setPlacesReady(true);
      }
    };
    s.onerror = () => console.error("Failed to load Google Maps JS API.");
    document.head.appendChild(s);
  }, []);

  /* ---------- Debounced input handler ---------- */
  const handleMapInputChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    setSuggestions([]);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (!val) {
        setSuggestions([]);
        return;
      }
      if (!autocompleteServiceRef.current) {
        console.warn("Places AutocompleteService not ready yet.");
        return;
      }

      const req = { input: val };

      autocompleteServiceRef.current.getPlacePredictions(req, (preds, status) => {
        if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && preds) {
          setSuggestions(preds);
        } else {
          setSuggestions([]);
        }
      });
    }, 1000);
  };

  /* ---------- Choose a suggestion -> geocode by placeId -> update marker/map ---------- */
  const handleSuggestionClick = (prediction) => {
    setSearchValue(prediction.description);
    setSuggestions([]);

    if (!geocoderRef.current) {
      console.warn("Geocoder not ready.");
      return;
    }

    geocoderRef.current.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === window.google?.maps?.GeocoderStatus?.OK && results && results[0]) {
        const loc = results[0].geometry.location;
        const lat = typeof loc.lat === "function" ? loc.lat() : loc.lat;
        const lng = typeof loc.lng === "function" ? loc.lng() : loc.lng;


        // Update form data
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));

        // Update map center and zoom using state
        setMapCenter({ lat, lng });
        setMapZoom(16);

      } else {
        console.error("Geocode by placeId failed:", status);
        // Fallback: try geocoding by address text
        geocoderRef.current.geocode({ address: prediction.description }, (res2, st2) => {
          if (st2 === window.google?.maps?.GeocoderStatus?.OK && res2 && res2[0]) {
            const loc2 = res2[0].geometry.location;
            const lat2 = typeof loc2.lat === "function" ? loc2.lat() : loc2.lat;
            const lng2 = typeof loc2.lng === "function" ? loc2.lng() : loc2.lng;

            setFormData((prev) => ({ ...prev, latitude: lat2, longitude: lng2 }));
            setMapCenter({ lat: lat2, lng: lng2 });
            setMapZoom(16);
          } else {
            toast.error("Could not locate that place. Try another suggestion.");
          }
        });
      }
    });
  };

  /* ---------- Handle Enter key ---------- */
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions && suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      } else if (searchValue && geocoderRef.current) {
        geocoderRef.current.geocode({ address: searchValue }, (results, status) => {
          if (status === window.google?.maps?.GeocoderStatus?.OK && results && results[0]) {
            const loc = results[0].geometry.location;
            const lat = typeof loc.lat === "function" ? loc.lat() : loc.lat;
            const lng = typeof loc.lng === "function" ? loc.lng() : loc.lng;

            setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
            setMapCenter({ lat, lng });
            setMapZoom(16);
          } else {
            toast.error("No match found for the entered address.");
          }
        });
      }
    }
  };

  /* ---------- Click-outside to close suggestions ---------- */
  useEffect(() => {
    const onDocClick = (ev) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(ev.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  /* ---------- Cleanup debounce on unmount ---------- */
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleMapSearch = () => {
    if (suggestions && suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
    } else {
      // simple geocode by address
      if (geocoderRef.current && searchValue) {
        geocoderRef.current.geocode({ address: searchValue }, (results, status) => {
          if (status === (window.google && window.google.maps && window.google.maps.GeocoderStatus.OK) && results && results[0]) {
            const loc = results[0].geometry.location;
            const lat = typeof loc.lat === "function" ? loc.lat() : loc.lat;
            const lng = typeof loc.lng === "function" ? loc.lng() : loc.lng;
            setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
            if (mapRef.current && typeof mapRef.current.setCenter === "function") {
              mapRef.current.setCenter({ lat, lng });
              mapRef.current.setZoom(14);
            }
          } else {
            toast.error("No match found for the entered address.");
          }
        });
      }
    }
  }


  const addressComponents = [
    formData.address.roadName,
    formData.address.city,
    formData.address.state,
    formData.address.pincode,
  ];

  const addressString = addressComponents.filter(Boolean).join(", ");


  const handleInputCityChange = (e) => {
    const selectedId = e.target.value;
    const selectedCity = cities.find(c => c._id === selectedId)

    setFormData({
      ...formData,
      cityName: selectedCity?.cityName || '',
      locationId: selectedCity?._id || ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <h1 className="text-lg font-semibold text-center mt-4">
          <span className="text-[#D9291A]">BiteBuddie</span> for Restaurant
        </h1>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              className="text-gray-600 hover:text-gray-900 flex gap-4 items-center"
              onClick={handleBack}
            >
              <IoIosArrowBack className="w-5 h-5" /> <Link to="/">Back</Link>
            </button>
          </div>
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            FAQs
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-[67%] left-[34px] right-[147px] h-[2px] bg-gray-200 z-10">
              <div
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
            </div>

            <div className="flex flex-col">
              <span
                className={`text-2xl ${currentStep >= 1 ? "text-gray-900" : "text-gray-400"
                  } font-bold mb-2 flex justify-center items-center gap-1`}
              >
                01 <span className="text-base ">Restaurant Information</span>
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStep > 1
                  ? "bg-red-600 text-white"
                  : currentStep === 1
                    ? "border-red-600 border-4"
                    : "border-gray-300"
                  }`}
              >
                {currentStep > 1 ? <Check className="w-5 h-5 items-center" /> : ""}
              </div>
            </div>

            <div className="flex flex-col z-40">
              <span
                className={`text-2xl ${currentStep >= 2 ? "text-gray-900" : "text-gray-400"
                  } font-bold mb-2`}
              >
                02 <span className="text-base ">Restaurant Documents</span>
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${currentStep > 2
                  ? "bg-red-600 text-white"
                  : currentStep === 2
                    ? "border-red-600 bg-red-600 z-40 border text-white"
                    : "border-2 border-gray-300 text-gray-400 bg-white"
                  }`}
              >
                {currentStep > 2 ? <Check className="w-5 h-5" /> : ""}
              </div>
            </div>

            <div className="flex flex-col">
              <span
                className={`text-2xl ${currentStep === 3 ? "text-gray-900" : "text-gray-400"
                  } font-bold mb-2 `}
              >
                03 <span className="text-base ">Partner Contract</span>
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${currentStep === 3
                  ? "bg-red-600 text-white"
                  : "border-2 border-gray-300 text-gray-400"
                  }`}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Information */}
      {currentStep === 1 && (
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4">Basic Details</h2>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Owner's Full Name*"
                    required
                  />
                  {errors.ownerName && (
                    <p className="text-red-500 text-sm">{errors.ownerName}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="kitchenName"
                    value={formData.kitchenName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Kitchen Name*"
                    required
                  />
                  {errors.kitchenName && (
                    <p className="text-red-500 text-sm">{errors.kitchenName}</p>
                  )}
                </div>

                <h2 className="text-lg font-medium mb-4">Upload Kitchen Image</h2>
                <div className="flex items-center gap-10">
                  <div className="w-24 h-24">
                    <label
                      htmlFor="kitchen-image"
                      className="cursor-pointer block w-full h-full"
                    >
                      {formData.imageUrl ? (
                        <img
                          src={formData.imageUrl}
                          alt="Kitchen"
                          className="w-24 h-24 rounded-full object-cover border-2 border-red-200"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-red-50 border-2 border-dashed border-[#D9291A] flex flex-col items-center justify-center hover:bg-red-100 transition-colors">
                          <span className="text-[#D9291A] text-xs text-center px-2">
                            {imageUploading ? "Uploading..." : "Click to upload image"}
                          </span>
                        </div>
                      )}
                    </label>
                    <input
                      type="file"
                      className="hidden"
                      name="kitchen-image"
                      id="kitchen-image"
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/jpg"
                      ref={fileInputRef}
                      disabled={imageUploading}
                    />
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className={`bg-[#D9291A] text-white py-2 px-4 rounded-md text-sm ${imageUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
                        }`}
                      disabled={imageUploading}
                    >
                      {imageUploading ? "Uploading..." : "Upload Image"}
                    </button>
                  </div>
                </div>
                {errors.imageUrl && (
                  <p className="text-red-500 text-sm">{errors.imageUrl}</p>
                )}
                <div>
                  <input
                    type="text"
                    name="address"
                    value={addressString || ""}
                    onClick={handleLocationInputClick}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-red-500 focus:border-transparent"
                    placeholder="Kitchen Location*"
                    required
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm">{errors.address}</p>
                  )}
                </div>
                {showMap && (
                  <div className="mt-4 relative">
                    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                      <div className="absolute top-14 -right-48 -translate-x-1/2 w-3/4 z-10" ref={wrapperRef}>
                        <div className="flex gap-2">
                          <input
                            value={searchValue}
                            onChange={handleMapInputChange}
                            onKeyDown={handleInputKeyDown}
                            placeholder="Search for a location..."
                            // id="locationSearch"
                            className="w-full p-2 rounded-md border border-gray-300 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          {/* <button
                            type="button"
                            onClick={handleMapSearch}
                            className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            Search
                          </button> */}
                        </div>
                        {suggestions && suggestions.length > 0 && (
                          <ul className="bg-white shadow-md rounded-md mt-1 max-h-56 overflow-y-auto border">
                            {suggestions.map((s) => (
                              <li
                                key={s.place_id}
                                onClick={() => handleSuggestionClick(s)}
                                className="p-2 cursor-pointer hover:bg-gray-100"
                              >
                                {s.description}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <Map
                        style={{ width: "100%", height: "400px" }}
                        center={mapCenter} // Use center instead of defaultCenter
                        // defaultZoom={12}
                        zoom={mapZoom}
                        mapId={import.meta.env.VITE_MAP_ID}
                        onClick={(e) => handleMapClick(e)}
                        onLoad={(map) => {
                          mapRef.current = map;
                        }}
                        // Allow user interaction by not restricting map movements
                        gestureHandling="greedy" // Allows scrolling without holding Ctrl
                        disableDefaultUI={false} // Keep default UI controls
                        // Add zoom and center change handlers to keep state in sync
                        onZoomChanged={(e) => {
                          if (e && e.detail && typeof e.detail.zoom === 'number') {
                            setMapZoom(e.detail.zoom);
                          }
                        }}
                        onCenterChanged={(e) => {
                          if (e && e.detail && e.detail.center) {
                            // Only update if user manually moved the map (not programmatic)
                            // This prevents infinite loops while still allowing manual pan
                            const newCenter = e.detail.center;
                            if (Math.abs(newCenter.lat - mapCenter.lat) > 0.001 ||
                              Math.abs(newCenter.lng - mapCenter.lng) > 0.001) {
                              setMapCenter(newCenter);
                            }
                          }
                        }}
                      >
                        {formData.latitude && formData.longitude && (
                          <AdvancedMarker
                            position={{
                              lat: formData.latitude,
                              lng: formData.longitude,
                            }}
                          >
                            <Pin background={"#FF2929"} borderColor={"#000"} glyphColor={"#fff"} />
                          </AdvancedMarker>
                        )}
                      </Map>
                    </APIProvider>
                    <button
                      type="button"
                      onClick={handleContinueClick}
                      className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Continue
                    </button>
                  </div>
                )}

                {showAddressInput && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Address
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="roadName"
                        value={formData.address.roadName || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              roadName: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-red-500 focus:border-transparent"
                        placeholder="Road Name*"
                        required
                      />
                      <input
                        type="text"
                        name="city"
                        value={formData.address.city || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              city: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-red-500 focus:border-transparent"
                        placeholder="City*"
                        required
                      />
                      <input
                        type="text"
                        name="state"
                        value={formData.address.state || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              state: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:outline-none focus:ring-red-500 focus:border-transparent"
                        placeholder="State*"
                        required
                      />
                      <input
                        type="text"
                        name="pincode"
                        value={formData.address.pincode || ""}
                        maxLength={6}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: {
                              ...prev.address,
                              pincode: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Pincode*"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddressSubmit}
                      className="mt-2 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Confirm Address
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4">Owner Contact Details</h2>
              <div className="space-y-4">
                <div>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Email Address*"
                    required
                  />
                  {errors.contactEmail && (
                    <p className="text-red-500 text-sm">{errors.contactEmail}</p>
                  )}
                </div>

                <div>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Mobile Number*"
                    required
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-sm">{errors.mobileNumber}</p>
                  )}
                </div>

                <div>
                  <select
                    id="location"
                    name="location"
                    value={formData.locationId}
                    onChange={handleInputCityChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">
                      Select city*
                    </option>
                    {cities.map((city) => (
                      <option key={city._id} value={city._id}>
                        {city.cityName}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="text-red-500 text-sm">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="usesSameMobileForWhatsapp"
                      checked={formData.usesSameMobileForWhatsapp}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          usesSameMobileForWhatsapp: true,
                        }))
                      }
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-sm text-gray-700">My WhatsApp number is same as above</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="usesSameMobileForWhatsapp"
                      checked={!formData.usesSameMobileForWhatsapp}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          usesSameMobileForWhatsapp: false,
                        }))
                      }
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-sm text-gray-700">I have a different WhatsApp number</span>
                  </label>
                </div>
              </div>
              {!formData.usesSameMobileForWhatsapp && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    maxLength={10}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Select Service Types</h2>
                <button
                  type="button"
                  onClick={handleSelectAllServiceTypes}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  {formData.kitchentype.length ===
                    ["Instant"].length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              <div className="grid md:grid-cols-1 gap-4 px-4">
                {[
                  {
                    label: "Instant",
                    description:
                      "Serve quick, on-demand orders to nearby customers by listing your most popular dishes for instant delivery.",
                  },
                  // {
                  //   label: "Planner Meal",
                  //   description:
                  //     "Offer scheduled meals where customers can pre-plan their weekly menu from your kitchen, ensuring consistent orders and prep time.",
                  // },
                  // {
                  //   label: "Subscription Meal",
                  //   description:
                  //     "Provide daily or weekly subscription-based meal plans with fixed pricing, ideal for regular customers seeking convenience and routine.",
                  // },
                  // {
                  //   label: "Event Meal Order",
                  //   description:
                  //     "Accept bulk or customized meal orders for parties, corporate events, or gatherings, with options for pre-scheduled delivery and special menus.",
                  // },
                  // {
                  //   label: "Nutrition & Diet Food",
                  //   description:
                  //     "Feature your health-focused meals and cater to customers with specific dietary needs, including calorie-counted, protein-rich, or diabetic-friendly options.",
                  // },
                ].map(({ label, description }) => (
                  <div key={label} className="flex flex-col items-start">
                    <div className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        checked={formData.kitchentype.includes(label)}
                        onChange={() => handleServiceTypeChange(label)}
                        className="h-4 w-4 accent-red-600 rounded cursor-pointer"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-800">{label}</label>
                    </div>
                    <p className="ml-6 text-sm text-gray-600">{description}</p>
                  </div>
                ))}
              </div>
              {errors.kitchentype && (
                <p className="text-red-500 text-sm mt-2">{errors.kitchentype}</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Working Days</h2>
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="text-sm text-[#D9291A] hover:text-red-700"
                >
                  {formData.workingDays.length === 7 ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                  (day) => (
                    <div key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.workingDays.includes(day)}
                        onChange={() => handleCheckboxChange(day)}
                        className="h-4 w-4 accent-red-600 rounded cursor-pointer"
                      />
                      <label className="ml-2 text-sm text-gray-700">{day}</label>
                    </div>
                  )
                )}
              </div>
              {errors.workingDays && (
                <p className="text-red-500 text-sm">{errors.workingDays}</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between mb-4">
                <h4 className="text-lg font-medium">Cuisines You Serve</h4>
                <button
                  onClick={handleSelectAllCuisines}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  {formData.cuisines.length === cuisines.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cuisines.map((cuisine) => (
                  <div key={cuisine} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.cuisines.includes(cuisine)}
                      onChange={() => handleCuisineChange(cuisine)}
                      className="h-4 w-4 accent-red-600 rounded cursor-pointer"
                    />
                    <label className="ml-2 text-sm text-gray-700">{cuisine}</label>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowAddInput(true)}
                className="mt-3 bg-gray-200 border-none p-1 cursor-pointer rounded text-sm text-gray-700"
              >
                + Add
              </button>
              {showAddInput && (
                <div className="mt-3 flex items-center">
                  <input
                    type="text"
                    value={newCuisine}
                    onChange={(e) => setNewCuisine(e.target.value)}
                    placeholder="Enter new cuisine"
                    className="p-1 mr-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={handleAddCuisine}
                    className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Add
                  </button>
                </div>
              )}
              {errors.cuisines && (
                <p className="text-red-500 text-sm mt-2">{errors.cuisines}</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4">Meal Time Slots</h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Select the meal slots your kitchen offers and specify their timings.
                </p>
                {formData.mealTimeSlots.map((slot) => (
                  <div key={slot.name} className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={slot.isSelected}
                        onChange={() => handleMealSlotCheckboxChange(slot.name)}
                        className="h-4 w-4 accent-red-600 rounded cursor-pointer"
                      />
                      <label className="ml-2 text-sm text-gray-700">{slot.name}</label>
                    </div>
                    {slot.isSelected && (
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              handleMealSlotTimeChange(slot.name, "startTime", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          {errors[`startTime_${slot.name}`] && (
                            <p className="text-red-500 text-sm">{errors[`startTime_${slot.name}`]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">End Time</label>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              handleMealSlotTimeChange(slot.name, "endTime", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          {errors[`endTime_${slot.name}`] && (
                            <p className="text-red-500 text-sm">{errors[`endTime_${slot.name}`]}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {errors.mealTimeSlots && (
                  <p className="text-red-500 text-sm">{errors.mealTimeSlots}</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4">Timings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="hasSameTimings"
                      checked={formData.hasSameTimings}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          hasSameTimings: true,
                        }))
                      }
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-sm text-gray-700">
                      I open and close my restaurant at the same time on all working days
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="hasSameTimings"
                      checked={!formData.hasSameTimings}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          hasSameTimings: false,
                        }))
                      }
                      className="w-4 h-4 accent-red-600"
                    />
                    <span className="text-sm text-gray-700">I have separate day-wise timings</span>
                  </label>
                </div>
                {formData.hasSameTimings ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Open Time</label>
                      <input
                        type="time"
                        name="openingTime"
                        value={formData.workingHours[0]?.openingTime || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workingHours: [
                              {
                                ...prev.workingHours[0],
                                openingTime: e.target.value,
                              },
                            ],
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      {errors.openingTime && (
                        <p className="text-red-500 text-sm">{errors.openingTime}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Close Time</label>
                      <input
                        type="time"
                        name="closingTime"
                        value={formData.workingHours[0]?.closingTime || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            workingHours: [
                              {
                                ...prev.workingHours[0],
                                closingTime: e.target.value,
                              },
                            ],
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      {errors.closingTime && (
                        <p className="text-red-500 text-sm">{errors.closingTime}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.workingDays.map((day, index) => (
                      <div key={day} className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">{day} Open Time</label>
                          <input
                            type="time"
                            value={formData.workingHours[index]?.openingTime || ""}
                            onChange={(e) => {
                              const newTimings = [...formData.workingHours];
                              newTimings[index] = {
                                ...newTimings[index],
                                day,
                                openingTime: e.target.value,
                              };
                              setFormData((prev) => ({
                                ...prev,
                                workingHours: newTimings,
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          {errors[`openingTime_${day}`] && (
                            <p className="text-red-500 text-sm">{errors[`openingTime_${day}`]}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">{day} Close Time</label>
                          <input
                            type="time"
                            value={formData.workingHours[index]?.closingTime || ""}
                            onChange={(e) => {
                              const newTimings = [...formData.workingHours];
                              newTimings[index] = {
                                ...newTimings[index],
                                day,
                                closingTime: e.target.value,
                              };
                              setFormData((prev) => ({
                                ...prev,
                                workingHours: newTimings,
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          {errors[`closingTime_${day}`] && (
                            <p className="text-red-500 text-sm">{errors[`closingTime_${day}`]}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                  Longer operational timings ensure you get 1.5x more orders and help you avoid cancellations.
                </p>
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="w-full bg-[#D9291A] text-white py-3 rounded-md hover:bg-red-700 transition-colors"
            >
              Proceed
            </button>
          </div>
        </div>
      )}

      {/* Restaurant Documents */}
      {currentStep === 2 && (
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold border-b border-gray-400 pb-6">Document Upload</h2>
            <h3 className="text-xl font-medium mb-4">PAN and GSTIN Details</h3>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2 space-y-4">
                  <div>
                    <input
                      type="text"
                      name="panname"
                      value={formData.panname}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Name as per PAN*"
                      required
                    />
                    {errors.panname && <p className="text-red-500 text-sm">{errors.panname}</p>}
                  </div>

                  <div>
                    <input
                      type="text"
                      name="panNumber"
                      maxLength={10}
                      value={formData.panNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="PAN Number*"
                      required
                    />
                    {errors.panNumber && (
                      <p className="text-red-500 text-sm">{errors.panNumber}</p>
                    )}
                  </div>
                </div>
                <div className="md:w-1/2 space-y-4 grid grid-cols-1 gap-[15px]">
                  <div>
                    <input
                      type="text"
                      name="gstNumber"
                      maxLength={15}
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      placeholder="GSTIN*"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                    {errors.gstNumber && (
                      <p className="text-red-500 text-sm">{errors.gstNumber}</p>
                    )}
                    <label className="block text-sm text-gray-400 mt-1">
                      Enter Your GSTIN Number
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-medium text-xl">Official Bank Details</h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div>
                  <input
                    type="text"
                    name="ifsccode"
                    maxLength={11}
                    value={formData.ifsccode}
                    onChange={handleInputChange}
                    placeholder="IFSC Code*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {errors.ifsccode && <p className="text-red-500 text-sm">{errors.ifsccode}</p>}
                </div>
                <div>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    type="text"
                    name="banknumber"
                    maxLength={18}
                    value={formData.banknumber}
                    onChange={handleInputChange}
                    placeholder="Bank Account Number*"
                  />
                  {errors.banknumber && (
                    <p className="text-red-500 text-sm">{errors.banknumber}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="font-medium text-xl">FSSAI (Food Licence)</h2>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>
                  • The FSSAI Certificate should <span className="text-black">match the name</span> of the restaurant
                </li>
                <li>
                  • The address on FSSAI Certificate should <span className="text-black">match the address</span> of the restaurant
                </li>
                <li>
                  • The FSSAI Certificate <span className="text-black">should not be expiring</span> within 30 days
                </li>
              </ul>
              <input
                type="text"
                name="licenseDetails"
                maxLength={14}
                value={formData.licenseDetails}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="FSSAI Certificate Number*"
              />
              {errors.licenseDetails && (
                <p className="text-red-500 text-sm">{errors.licenseDetails}</p>
              )}
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={handleProceed}
                className="w-96 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Contract */}
      {currentStep === 3 && (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Terms and Conditions for Cloud Kitchen Onboarding</h2>
          <h3 className="text-lg font-medium mb-4">
            By using the BiteBuddie app or website, you agree to comply with the following Terms & Conditions:
          </h3>
          <div className="mb-4 font-light max-w-4xl">
            <div className="p-6 mx-auto rounded-xl space-y-6 text-gray-800">
              <section>
                <h2 className="text-xl font-semibold">1. User Responsibilities</h2>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>You must provide accurate personal and delivery information.</li>
                  <li>You are responsible for ensuring the availability to receive orders at the selected delivery address and time.</li>
                  <li>You agree not to misuse, abuse, or exploit any features of the app for personal gain.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">2. Ordering & Payment</h2>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Orders can be placed for instant delivery, planned meals, or subscriptions.</li>
                  <li>Payments can be made online or on delivery (based on the selected option).</li>
                  <li>BiteBuddie reserves the right to cancel orders in case of non-payment, fraud suspicion, or unavailability.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">3. Delivery Policy</h2>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Delivery times are estimated and may vary due to external factors like traffic or weather.</li>
                  <li>BiteBuddie or the kitchen/restaurant partner is responsible for delivering the order, based on the selected delivery channel.</li>
                  <li>In case of delayed or failed delivery, you may contact support for resolution.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">4. Refunds & Cancellations</h2>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Refunds are subject to the cancellation time window defined per service type (instant, planner, subscription).</li>
                  <li>Partial or full refunds may be issued based on the stage of order processing.</li>
                  <li>Wallet refunds may take up to 24–48 hours to reflect.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">5. Subscriptions & Meal Plans</h2>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Subscription and planned meals must be confirmed in advance and follow the chosen meal schedule.</li>
                  <li>Changes to schedule, address, or cancellation are only allowed within the allowed time frame before delivery.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">6. Restaurant & Kitchen Partners</h2>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Partners must ensure food safety, hygiene, and timely preparation.</li>
                  <li>BiteBuddie reserves the right to delist or penalize any kitchen/restaurant found violating service or quality standards.</li>
                </ul>
              </section>
              <section>
                <h2 className="text-xl font-semibold">7. Intellectual Property</h2>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>All content, logos, and assets on BiteBuddie are protected and may not be used without permission.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">8. Privacy</h2>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    User data is protected as per our{" "}
                    <a
                      className="underline font-medium text-blue-600 hover:text-blue-800"
                      href="policyBiteBuddie.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                    .
                  </li>

                  <li>We do not share or sell your information without consent.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">9. Changes to Terms</h2>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    BiteBuddie may update these Terms periodically. Continued use of the app implies acceptance of any changes.
                  </li>
                </ul>
              </section>

              <p className="text-sm text-gray-600">
                For any questions, contact us at [support@bitebuddie.com] or visit the in-app Help Center.
              </p>
            </div>
          </div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="terms"
              checked={formData.isChecked}
              onChange={handleTermsCheckboxChange}
              className="h-4 w-4 accent-red-600 rounded"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
              I accept the terms and conditions
            </label>
          </div>
          {errors.isChecked && <p className="text-red-500 text-sm">{errors.isChecked}</p>}
          <button
            className="w-96 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default Registration;