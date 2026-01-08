import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { apiClient } from '../utils/api';

interface TruckInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  truckData?: {
    _id: string;
    truckId: string;
    vehicleNumber: string;
    orderId: string;
    driverMobileNo: string;
    sellerName: string;
    dealerName: string;
    status: string;
    transporterName?: string;
    transporterMobileNo?: string;
    transporterGSTNo?: string;
    vehicleCapacity: number;
    quantityToLoad: number;
    loadedQuantity: number;
    billDocument?: string[];
    paymentConfirmationDocument?: string[];
    remarks?: string;
  };
}

const TruckInfoModal: React.FC<TruckInfoModalProps> = ({ isOpen, onClose, onSave, truckData }) => {
  const [formData, setFormData] = useState({
    truckId: '',
    vehicleNumber: '',
    orderId: '',
    driverMobileNo: '',
    sellerName: '',
    dealerName: '',
    status: '',
    transporterName: '',
    transporterMobileNo: '',
    transporterGSTNo: '',
    vehicleCapacity: 0,
    quantityToLoad: 0,
    loadedQuantity: 0,
    remarks: ''
  });

  const [billDocuments, setBillDocuments] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update formData when truckData changes
  useEffect(() => {
    console.log('🚛 TruckInfoModal - Received truckData:', truckData);
    if (truckData) {
      setFormData({
        truckId: truckData.truckId || '',
        vehicleNumber: truckData.vehicleNumber || '',
        orderId: truckData.orderId || '',
        driverMobileNo: truckData.driverMobileNo || '',
        sellerName: truckData.sellerName || '',
        dealerName: truckData.dealerName || '',
        status: truckData.status || '',
        transporterName: truckData.transporterName || '',
        transporterMobileNo: truckData.transporterMobileNo || '',
        transporterGSTNo: truckData.transporterGSTNo || '',
        vehicleCapacity: truckData.vehicleCapacity || 0,
        quantityToLoad: truckData.quantityToLoad || 0,
        loadedQuantity: truckData.loadedQuantity || 0,
        remarks: truckData.remarks || ''
      });

      setBillDocuments(truckData.billDocument || []);
    }
  }, [truckData]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!truckData?._id) {
      setError("Truck ID is missing. Cannot save changes.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData: any = {
        vehicleNumber: formData.vehicleNumber,
        driverMobileNo: formData.driverMobileNo,
        status: formData.status,
        transporterName: formData.transporterName,
        transporterMobileNo: formData.transporterMobileNo,
        transporterGSTNo: formData.transporterGSTNo,
        vehicleCapacity: formData.vehicleCapacity,
        quantityToLoad: formData.quantityToLoad,
        loadedQuantity: formData.loadedQuantity,
        remarks: formData.remarks
      };

      console.log('Saving truck changes:', updateData);

      // Call API to update truck
      const response = await apiClient.adminUpdateTruckStatus(truckData._id, updateData);

      if (response.success) {
        console.log('Truck updated successfully');

        // Call the onSave callback to refresh parent component
        if (onSave) {
          onSave();
        }

        // Close modal after successful save
        onClose();
      } else {
        setError("Failed to update truck. Please try again.");
      }
    } catch (err: any) {
      console.error('Error updating truck:', err);
      setError(err.message || "An error occurred while saving the truck");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Truck Information</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* First Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Truck ID
              </label>
              <input
                type="text"
                value={formData.truckId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number
              </label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                placeholder="Enter vehicle number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                value={formData.orderId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver Mobile No
              </label>
              <input
                type="text"
                value={formData.driverMobileNo}
                onChange={(e) => handleInputChange('driverMobileNo', e.target.value)}
                placeholder="Enter driver mobile number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller Name
              </label>
              <input
                type="text"
                value={formData.sellerName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dealer Name
              </label>
              <input
                type="text"
                value={formData.dealerName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Third Row - Transporter Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transporter Name
              </label>
              <input
                type="text"
                value={formData.transporterName}
                onChange={(e) => handleInputChange('transporterName', e.target.value)}
                placeholder="Enter transporter name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transporter Mobile
              </label>
              <input
                type="text"
                value={formData.transporterMobileNo}
                onChange={(e) => handleInputChange('transporterMobileNo', e.target.value)}
                placeholder="Enter mobile number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transporter GST No
              </label>
              <input
                type="text"
                value={formData.transporterGSTNo}
                onChange={(e) => handleInputChange('transporterGSTNo', e.target.value)}
                placeholder="Enter GST number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fourth Row - Capacity and Quantities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Capacity
              </label>
              <input
                type="number"
                value={formData.vehicleCapacity || ''}
                onChange={(e) => handleInputChange('vehicleCapacity', Number(e.target.value))}
                placeholder="Enter capacity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to Load
              </label>
              <input
                type="number"
                value={formData.quantityToLoad || ''}
                onChange={(e) => handleInputChange('quantityToLoad', Number(e.target.value))}
                placeholder="Enter quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loaded Quantity
              </label>
              <input
                type="number"
                value={formData.loadedQuantity || ''}
                onChange={(e) => handleInputChange('loadedQuantity', Number(e.target.value))}
                placeholder="Enter loaded quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fifth Row - Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Truck Status
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none pr-8"
                >
                  <option value="">Select Status</option>
                  <option value="Truck Outside Mill">Truck Outside Mill</option>
                  <option value="Truck Inside Mill">Truck Inside Mill</option>
                  <option value="Truck on Hold">Truck on Hold</option>
                  <option value="Truck Dispatched">Truck Dispatched</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Sixth Row - Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Enter any remarks"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          {/* Bill Documents */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bill Documents</h3>
            {billDocuments.length > 0 ? (
              <div className="space-y-3">
                {billDocuments.map((docUrl, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-600 text-sm">📄</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        Bill Document {index + 1}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No bill documents uploaded yet.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckInfoModal; 