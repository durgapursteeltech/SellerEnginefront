import React, { useState, useEffect } from 'react';
import { X, Copy, Loader2 } from 'lucide-react';
import { apiClient } from '../utils/api';

interface SellerUserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: {
    _id?: string;
    userId?: string;
    name?: string;
    sellerName: string;
    email: string;
    role: string;
    phoneNumber: string;
    userType?: string;
    status?: string;
    permissions?: any;
    sellerInfo?: {
      firmName: string;
      sellerEmail: string;
      phoneNo: string;
    };
  };
}

const SellerUserInfoModal: React.FC<SellerUserInfoModalProps> = ({ isOpen, onClose, userData }) => {
  const [formData, setFormData] = useState({
    sellerName: '',
    email: '',
    role: '',
    phoneNumber: '',
    name: '',
    userType: ''
  });
  const [permissions, setPermissions] = useState({
    manageBids: true,
    manageEmployees: true,
    manageProducts: true,
    manageRates: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when userData changes (no API call needed - data already fetched)
  useEffect(() => {
    if (!isOpen || !userData) return;

    // Use the data that's already been fetched by the parent component
    setFormData({
      sellerName: userData.sellerInfo?.firmName || userData.sellerName || '',
      email: userData.email || '',
      role: userData.userType || userData.role || '',
      phoneNumber: userData.phoneNumber || userData.sellerInfo?.phoneNo || '',
      name: userData.name || '',
      userType: userData.userType || userData.role || ''
    });

    // Set permissions from userData or use defaults
    setPermissions({
      manageBids: userData.permissions?.manageBids ?? true,
      manageEmployees: userData.permissions?.manageEmployees ?? true,
      manageProducts: userData.permissions?.manageProducts ?? true,
      manageRates: userData.permissions?.manageRates ?? true
    });

    setError(null);
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handlePermissionToggle = (permission: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleSave = async () => {
    if (!userData?._id) {
      alert('User ID is missing. Cannot save changes.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update user via admin-specific endpoint
      const response = await apiClient.updateSellerUserByIdAdmin(userData._id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phoneNumber,
        userType: formData.userType,
        permissions: permissions
      });

      if (response.status === 'SUCCESS') {
        alert('User information updated successfully!');
        onClose();
        // Optionally trigger a refresh in the parent component
        window.location.reload(); // Simple refresh, can be improved with state management
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error saving user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to save user data');
      alert(`Failed to save user data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Seller User Information</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter user name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
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
          </div>

          {/* Seller Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller Name
              </label>
              <input
                type="text"
                value={formData.sellerName}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.userType}
                onChange={(e) => {
                  handleInputChange('userType', e.target.value);
                  handleInputChange('role', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          </div>

          {/* Permissions Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Manage Bids
                  </label>
                  <p className="text-xs text-gray-500">Allow user to create, view, and manage bids</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={permissions.manageBids}
                    onChange={() => handlePermissionToggle('manageBids')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Manage Employees
                  </label>
                  <p className="text-xs text-gray-500">Allow user to add, edit, and manage employee accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={permissions.manageEmployees}
                    onChange={() => handlePermissionToggle('manageEmployees')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Manage Products
                  </label>
                  <p className="text-xs text-gray-500">Allow user to add, edit, and manage product listings</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={permissions.manageProducts}
                    onChange={() => handlePermissionToggle('manageProducts')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Manage Rates
                  </label>
                  <p className="text-xs text-gray-500">Allow user to view and update pricing rates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={permissions.manageRates}
                    onChange={() => handlePermissionToggle('manageRates')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SellerUserInfoModal; 