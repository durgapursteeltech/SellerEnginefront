import React, { useState, useEffect } from "react";
import { X, Upload, Copy } from "lucide-react";

interface SellerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId?: string;
  sellerData?: {
    sellerName: string;
    brandName?: string;
    email: string;
    phone: string;
    gstin: string;
    masterCategories: string[];
    bankName: string;
    accountNumber: string;
    ifsc: string;
    address: string;
    city: string;
    zipcode: string;
  };
  onSave?: () => void;
}

const SellerInfoModal: React.FC<SellerInfoModalProps> = ({
  isOpen,
  onClose,
  sellerId,
  sellerData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    sellerName: sellerData?.sellerName || "",
    brandName: sellerData?.brandName || "",
    email: sellerData?.email || "",
    phone: sellerData?.phone || "",
    gstin: sellerData?.gstin || "",
    masterCategories: sellerData?.masterCategories || ["TMT", "COIL"],
    bankName: sellerData?.bankName || "",
    accountNumber: sellerData?.accountNumber || "",
    ifsc: sellerData?.ifsc || "",
    address: sellerData?.address || "",
    city: sellerData?.city || "",
    zipcode: sellerData?.zipcode || "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [originalBrandName, setOriginalBrandName] = useState("");

  // Update formData when sellerData changes
  useEffect(() => {
    if (sellerData) {
      setFormData({
        sellerName: sellerData.sellerName || "",
        brandName: sellerData.brandName || "",
        email: sellerData.email || "",
        phone: sellerData.phone || "",
        gstin: sellerData.gstin || "",
        masterCategories: sellerData.masterCategories || ["TMT", "COIL"],
        bankName: sellerData.bankName || "",
        accountNumber: sellerData.accountNumber || "",
        ifsc: sellerData.ifsc || "",
        address: sellerData.address || "",
        city: sellerData.city || "",
        zipcode: sellerData.zipcode || "",
      });
      // Store original brandName to check if it changed
      setOriginalBrandName(sellerData.brandName || "");
    }
  }, [sellerData]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSave = async () => {
    if (!sellerId) {
      alert('Seller ID is missing. Cannot save changes.');
      return;
    }

    // Check if brandName has changed
    const brandNameChanged = formData.brandName !== originalBrandName;

    if (brandNameChanged) {
      // Show password modal if brandName changed
      setShowPasswordModal(true);
      return;
    }

    // If brandName hasn't changed, proceed with regular update
    await performUpdate();
  };

  const performUpdate = async () => {
    if (!sellerId) {
      alert('Seller ID is missing. Cannot save changes.');
      return;
    }

    try {
      // Import apiClient at the top if not already imported
      const { apiClient } = await import('../utils/api');

      const updateData = {
        firmName: formData.sellerName,
        brandName: formData.brandName,
        sellerEmail: formData.email,
        phoneNo: formData.phone,
        gstNo: formData.gstin,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifsc: formData.ifsc,
        address: formData.address,
        city: formData.city,
        pincode: formData.zipcode,
      };

      console.log("Saving seller data:", updateData);

      const response = await apiClient.updateSeller(sellerId, updateData);

      if (response.status === 'SUCCESS') {
        alert('Seller information updated successfully!');
        onSave?.(); // Call the onSave callback to refresh the table
        onClose();
      } else {
        alert('Failed to update seller information. Please try again.');
      }
    } catch (error) {
      console.error('Error saving seller data:', error);
      alert('An error occurred while saving. Please try again.');
    }
  };

  const performUpdateExcludingBrandName = async () => {
    if (!sellerId) {
      alert('Seller ID is missing. Cannot save changes.');
      return;
    }

    try {
      // Import apiClient at the top if not already imported
      const { apiClient } = await import('../utils/api');

      // Update all fields EXCEPT brandName (since it was already updated via password-protected endpoint)
      const updateData = {
        firmName: formData.sellerName,
        // brandName is excluded intentionally - already updated
        sellerEmail: formData.email,
        phoneNo: formData.phone,
        gstNo: formData.gstin,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifsc: formData.ifsc,
        address: formData.address,
        city: formData.city,
        pincode: formData.zipcode,
      };

      console.log("Saving seller data (excluding brandName):", updateData);

      const response = await apiClient.updateSeller(sellerId, updateData);

      if (response.status === 'SUCCESS') {
        alert('Seller information updated successfully!');
        onSave?.(); // Call the onSave callback to refresh the table
        onClose();
      } else {
        alert('Failed to update seller information. Please try again.');
      }
    } catch (error) {
      console.error('Error saving seller data:', error);
      alert('An error occurred while saving. Please try again.');
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    if (!sellerId) {
      alert('Seller ID is missing. Cannot save changes.');
      return;
    }

    try {
      // Call the special brandName update endpoint with password verification
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://localhost:3002/api/seller/sellers/admin/${sellerId}/brandname`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          brandName: formData.brandName,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.status === 'SUCCESS') {
        // Password verified and brandName updated successfully
        setShowPasswordModal(false);
        setPassword("");
        setPasswordError("");

        // Update the originalBrandName so it won't trigger verification again
        setOriginalBrandName(formData.brandName);

        // Now update other fields if any changed (excluding brandName since it's already updated)
        await performUpdateExcludingBrandName();
      } else {
        // Password verification failed
        setPasswordError(data.message || "Invalid password. Please try again.");
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setPasswordError("An error occurred. Please try again.");
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPassword("");
    setPasswordError("");
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Seller Information
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller name
              </label>
              <input
                type="text"
                value={formData.sellerName}
                onChange={(e) =>
                  handleInputChange("sellerName", e.target.value)
                }
                placeholder="Placeholder Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) =>
                  handleInputChange("brandName", e.target.value)
                }
                placeholder="Enter brand name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Placeholder Text"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                <button
                  onClick={() => handleCopy(formData.email)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Placeholder Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* GSTIN and Master Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GSTIN
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => handleInputChange("gstin", e.target.value)}
                placeholder="Placeholder Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Categories
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent">
                <option>TMT, COIL</option>
                <option>TMT</option>
                <option>COIL</option>
                <option>Steel</option>
              </select>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seller Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Placeholder Text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Placeholder Text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zipcode
                </label>
                <input
                  type="text"
                  value={formData.zipcode}
                  onChange={(e) => handleInputChange("zipcode", e.target.value)}
                  placeholder="Placeholder Text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Bank Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) =>
                    handleInputChange("bankName", e.target.value)
                  }
                  placeholder="Placeholder Text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      handleInputChange("accountNumber", e.target.value)
                    }
                    placeholder="Placeholder Text"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleCopy(formData.accountNumber)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC
                </label>
                <input
                  type="text"
                  value={formData.ifsc}
                  onChange={(e) => handleInputChange("ifsc", e.target.value)}
                  placeholder="Placeholder Text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                    <span className="text-primary-600 text-sm">📄</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Filename.png
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-primary-50 text-primary-600 rounded text-sm hover:bg-primary-100">
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                  </button>
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                    Open
                  </button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                    <span className="text-red-600 text-sm">📄</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Filename.png
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-primary-50 text-primary-600 rounded text-sm hover:bg-primary-100">
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                  </button>
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                    Open
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
        </div>
      </div>

      {/* Password Verification Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verify Password
              </h3>
              <p className="text-sm text-gray-600">
                Please enter your password to update the brand name.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={handlePasswordModalClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Verify & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellerInfoModal;
