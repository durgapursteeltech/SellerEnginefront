import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Trash2 } from 'lucide-react';
import { apiClient } from '../utils/api';

interface OrderInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  orderData?: {
    _id: string;
    orderId: string;
    sellerName: string;
    dealerName: string;
    orderQty: number;
    quantityLifted: number;
    quantityPlacedFor: number;
    masterCategories: string;
    pricePerUnit: number;
    orderStatus: string;
    truckIds: string[];
  };
}

const OrderInfoModal: React.FC<OrderInfoModalProps> = ({ isOpen, onClose, onSave, orderData }) => {
  const [formData, setFormData] = useState({
    orderId: orderData?.orderId || '123456789',
    sellerName: orderData?.sellerName || '',
    dealerName: orderData?.dealerName || '',
    orderQty: orderData?.orderQty || 0,
    quantityLifted: orderData?.quantityLifted || 0,
    quantityPlacedFor: orderData?.quantityPlacedFor || 0,
    masterCategories: orderData?.masterCategories || '',
    pricePerUnit: orderData?.pricePerUnit || 0,
    orderStatus: orderData?.orderStatus || 'Approved',
    truckIds: orderData?.truckIds || ['1234678']
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loadingTrucks, setLoadingTrucks] = useState(false);
  const [showTrucksModal, setShowTrucksModal] = useState(false);

  // Fetch truck details for the order
  const fetchTruckDetails = async (orderId: string) => {
    try {
      setLoadingTrucks(true);
      const response = await apiClient.getTruckStatusByOrderId(orderId);
      if (response && response.data) {
        setTrucks(Array.isArray(response.data) ? response.data : [response.data]);
        console.log('Fetched trucks for order:', response.data);
      }
    } catch (err) {
      console.error('Error fetching truck details:', err);
    } finally {
      setLoadingTrucks(false);
    }
  };

  // Update form data whenever orderData changes
  useEffect(() => {
    if (orderData) {
      setFormData({
        orderId: orderData.orderId,
        sellerName: orderData.sellerName,
        dealerName: orderData.dealerName,
        orderQty: orderData.orderQty,
        quantityLifted: orderData.quantityLifted,
        quantityPlacedFor: orderData.quantityPlacedFor,
        masterCategories: orderData.masterCategories,
        pricePerUnit: orderData.pricePerUnit,
        orderStatus: orderData.orderStatus,
        truckIds: orderData.truckIds.length > 0 ? orderData.truckIds : ['']
      });

      // Fetch truck details when modal opens
      if (orderData.orderId) {
        fetchTruckDetails(orderData.orderId);
      }
    }
  }, [orderData]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTruck = () => {
    const newTruckIds = [...formData.truckIds, ''];
    handleInputChange('truckIds', newTruckIds);
  };

  const handleRemoveTruck = (index: number) => {
    const newTruckIds = formData.truckIds.filter((_, i) => i !== index);
    handleInputChange('truckIds', newTruckIds);
  };

  const handleTruckIdChange = (index: number, value: string) => {
    const newTruckIds = [...formData.truckIds];
    newTruckIds[index] = value;
    handleInputChange('truckIds', newTruckIds);
  };

  const handleSaveChanges = async () => {
    if (!orderData?._id) {
      setError("Order ID is missing. Cannot save changes.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Prepare update data matching the backend orderV2 schema field names
      const updateData: any = {
        status: formData.orderStatus,
        quantity: formData.orderQty,  // Backend uses 'quantity' not 'orderQty'
        quantityLifted: formData.quantityLifted,
        quantityPlacedFor: formData.quantityPlacedFor,
        approvedPrice: formData.pricePerUnit,  // Backend uses 'approvedPrice' not 'pricePerUnit'
      };

      // Only include trucks if there are valid truck IDs
      const validTruckIds = formData.truckIds.filter(id => id.trim() !== '');
      if (validTruckIds.length > 0) {
        updateData.truckIds = validTruckIds;
      }

      console.log('Saving order changes:', updateData);

      // Update order using admin API endpoint with MongoDB _id
      const response = await apiClient.updateOrderAdmin(orderData._id, updateData);

      if (response.success) {
        console.log('Order updated successfully');

        // Call the onSave callback to refresh parent component
        if (onSave) {
          onSave();
        }

        // Close modal after successful save
        onClose();
      } else {
        setError("Failed to update order. Please try again.");
      }
    } catch (err: any) {
      console.error('Error updating order:', err);
      setError(err.message || "An error occurred while saving the order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Order Information</h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              12th August 2024 • 11:25 AM
            </span>
          </div>
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
                Order ID
              </label>
              <input
                type="text"
                value={formData.orderId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller name
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
                Dealer name
              </label>
              <input
                type="text"
                value={formData.dealerName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Master Categories
              </label>
              <input
                type="text"
                value={formData.masterCategories}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Qty.
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.orderQty || ''}
                  onChange={(e) => handleInputChange('orderQty', Number(e.target.value))}
                  placeholder="Enter quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Lifted
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.quantityLifted || ''}
                  onChange={(e) => handleInputChange('quantityLifted', Number(e.target.value))}
                  placeholder="Enter quantity lifted"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Placed For
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.quantityPlacedFor || ''}
                  onChange={(e) => handleInputChange('quantityPlacedFor', Number(e.target.value))}
                  placeholder="Enter quantity placed"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Unit
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.pricePerUnit || ''}
                  onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                  placeholder="Number Text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent pr-8"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <div className="relative">
                <select
                  value={formData.orderStatus}
                  onChange={(e) => handleInputChange('orderStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none bg-white"
                >
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Flagged for Suspension">Flagged for Suspension</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Add Multiple Trucks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Multiple Trucks
            </label>
            <div className="space-y-2">
              {formData.truckIds.map((truckId, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={truckId}
                    onChange={(e) => handleTruckIdChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="Truck ID"
                  />
                  {index > 0 && (
                    <button
                      onClick={() => handleRemoveTruck(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddTruck}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700"
              >
                <span>Add another Truck ID</span>
              </button>
            </div>
          </div>

          {/* View Trucks Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Associated Trucks ({trucks.length})
              </label>
              <button
                onClick={() => setShowTrucksModal(!showTrucksModal)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {showTrucksModal ? 'Hide Trucks' : 'View Trucks'}
              </button>
            </div>

            {showTrucksModal && (
              <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {loadingTrucks ? (
                  <div className="text-center py-4 text-gray-500">Loading trucks...</div>
                ) : trucks.length > 0 ? (
                  trucks.map((truck, index) => (
                    <div key={truck._id || index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Truck ID</p>
                          <p className="text-sm font-medium text-gray-900">{truck.truckId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Vehicle Number</p>
                          <p className="text-sm font-medium text-gray-900">{truck.vehicleNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            truck.status === 'Truck Dispatched' ? 'bg-green-100 text-green-800' :
                            truck.status === 'Truck Inside Mill' ? 'bg-blue-100 text-blue-800' :
                            truck.status === 'Truck on Hold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {truck.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Driver Mobile</p>
                          <p className="text-sm font-medium text-gray-900">{truck.driverMobileNo || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Transporter</p>
                          <p className="text-sm font-medium text-gray-900">{truck.transporterName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="text-sm font-medium text-gray-900">{truck.vehicleCapacity} MT</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Quantity to Load</p>
                          <p className="text-sm font-medium text-gray-900">{truck.quantityToLoad} MT</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Loaded Quantity</p>
                          <p className="text-sm font-medium text-gray-900">{truck.loadedQuantity} MT</p>
                        </div>
                      </div>

                      {/* Bill Documents */}
                      {truck.billDocument && truck.billDocument.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Bill Documents</p>
                          <div className="flex flex-wrap gap-2">
                            {truck.billDocument.map((doc: string, docIndex: number) => (
                              <a
                                key={docIndex}
                                href={doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                              >
                                Bill {docIndex + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment Confirmation Documents */}
                      {truck.paymentConfirmationDocument && truck.paymentConfirmationDocument.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Payment Confirmations</p>
                          <div className="flex flex-wrap gap-2">
                            {truck.paymentConfirmationDocument.map((doc: string, docIndex: number) => (
                              <a
                                key={docIndex}
                                href={doc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                              >
                                Payment {docIndex + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Remarks */}
                      {truck.remarks && (
                        <div>
                          <p className="text-xs text-gray-500">Remarks</p>
                          <p className="text-sm text-gray-700">{truck.remarks}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No trucks found for this order</div>
                )}
              </div>
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

export default OrderInfoModal; 