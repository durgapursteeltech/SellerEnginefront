import React, { useState, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { apiClient, API_BASE_URL } from "../utils/api";

interface ProductInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productData?: {
    productName: string;
    sellerName: string;
    masterCategories: string;
    differenceRate: number;
    productDescription: string;
    status: string;
    imageUrl?: string;
    specifications?: Array<{ name: string; value: string }>;
  };
  onSave?: () => void;
}

const ProductInfoModal: React.FC<ProductInfoModalProps> = ({
  isOpen,
  onClose,
  productId,
  productData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    productName: productData?.productName || "TMT 16 MM",
    sellerName: productData?.sellerName || "",
    masterCategories:  productData?.masterCategories,
    differenceRate: productData?.differenceRate || 0,
    productDescription: productData?.productDescription || "",
    status: productData?.status?.toLowerCase(),
    imageUrl: productData?.imageUrl || "",
    specifications: productData?.specifications || [],
  });

  console.log("Product's Master Categories:", productData?.masterCategories);
  console.log("Is Array?", Array.isArray(productData?.masterCategories));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Update formData whenever productData changes
  useEffect(() => {
    if (productData) {
      console.log('ProductInfoModal - Received productData:', productData);
      console.log('ProductInfoModal - Image URL:', productData.imageUrl);

      setFormData({
        productName: productData.productName,
        sellerName: productData.sellerName,
        masterCategories: productData.masterCategories,
        differenceRate: productData.differenceRate || 0,
        productDescription: productData.productDescription,
        status: productData.status?.toLowerCase(),
        imageUrl: productData.imageUrl || "",
        specifications: productData.specifications || [],
      });

      console.log('ProductInfoModal - formData updated with imageUrl:', productData.imageUrl);
    }
  }, [productData]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/seller/products/admin/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.data?.imageUrl) {
        setFormData(prev => ({
          ...prev,
          imageUrl: data.data.imageUrl,
        }));
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: '',
    }));
  };

  const handleSpecificationChange = (index: number, field: 'name' | 'value', value: string) => {
    const updatedSpecs = [...formData.specifications];
    updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      specifications: updatedSpecs,
    }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }],
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!productId) {
      setError("Product ID is missing. Cannot save changes.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Prepare update data with mapped field names to match backend schema
      const updateData = {
        name: formData.productName,
        description: formData.productDescription,
        primaryCategory: formData.masterCategories,
        status: formData.status,
        imageUrl: formData.imageUrl,
        specifications: formData.specifications.filter(spec => spec.name.trim() && spec.value.trim()),
      };

      console.log("Saving product data:", updateData);

      // Update product basic information
      const response = await apiClient.updateProduct(productId, updateData);

      if (response.status === "SUCCESS") {
        console.log("Product updated successfully");

        // Update product difference rate separately
        if (formData.differenceRate !== productData?.differenceRate) {
          console.log("Updating product difference rate:", formData.differenceRate);
          try {
            const diffResponse = await apiClient.createOrUpdateProductDifference(
              productId,
              formData.differenceRate
            );
            console.log("Product difference updated:", diffResponse);
          } catch (diffError) {
            console.error("Error updating product difference:", diffError);
            setError("Product updated but failed to update difference rate");
            setSaving(false);
            return;
          }
        }

        // Call the onSave callback to refresh the product list
        if (onSave) {
          onSave();
        }

        onClose();
      } else {
        throw new Error(response.message || "Failed to save product");
      }
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {formData.productName}
            </h2>

            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
              Draft
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) =>
                  handleInputChange("productName", e.target.value)
                }
                placeholder="Placeholder Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller name
              </label>
              <input
                type="text"
                disabled
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
                Master Categories
              </label>
              <select
                value={formData.masterCategories}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              >
                <option value={formData.masterCategories}>{formData.masterCategories}</option>
              </select>
              {/* <input
                type="text"
                value={formData.masterCategories}
                onChange={(e) => handleInputChange('masterCategories', e.target.value)}
                placeholder="Placeholder Text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              /> */}
            </div>
          </div>

          {/* Difference Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difference Rate
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">₹</span>
              <input
                type="number"
                value={formData.differenceRate}
                onChange={(e) =>
                  handleInputChange(
                    "differenceRate",
                    parseInt(e.target.value) || 0
                  )
                }
                placeholder="Amount Rate"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent">
                <option>INR</option>
                <option>USD</option>
              </select>
            </div>
          </div>

          {/* Product Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Product Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description
                </label>
                <textarea
                  value={formData.productDescription}
                  onChange={(e) =>
                    handleInputChange("productDescription", e.target.value)
                  }
                  placeholder="Placeholder Text"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                >
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="disabled">Disabled</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Specifications
              </h3>
              <button
                type="button"
                onClick={addSpecification}
                className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                + Add Specification
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {formData.specifications.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={spec.name}
                            onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)}
                            placeholder="e.g., Length, Weight, Material"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Value
                            </label>
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                              placeholder="e.g., 6m, 100kg, Steel"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeSpecification(index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm"
                              title="Remove specification"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500 mb-3">No specifications added</p>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Add your first specification
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Document
            </h3>
            <div className="border border-gray-200 rounded-lg p-4">
              {formData.imageUrl ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 mb-2">Image URL: {formData.imageUrl}</p>
                  {/* Image Preview */}
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Product"
                      className="w-full h-full object-cover"
                      onLoad={() => console.log('Image loaded successfully:', formData.imageUrl)}
                      onError={(e) => {
                        console.error('Image failed to load:', formData.imageUrl);
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <a
                      href={formData.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1 bg-primary-50 text-primary-600 rounded text-sm hover:bg-primary-100"
                    >
                      <span>View Full Size</span>
                    </a>
                    <label className="flex items-center space-x-1 px-3 py-1 bg-primary-50 text-primary-600 rounded text-sm hover:bg-primary-100 cursor-pointer">
                      <Upload className="w-3 h-3" />
                      <span>{uploading ? 'Uploading...' : 'Change Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={handleRemoveImage}
                      disabled={uploading}
                      className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">No image uploaded</p>
                  <label className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Max size: 5MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoModal;
