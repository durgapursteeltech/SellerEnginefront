import React, { useState, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { apiClient } from "../utils/api";

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
  });

  console.log("Product's Master Categories:", productData?.masterCategories);
  console.log("Is Array?", Array.isArray(productData?.masterCategories));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update formData whenever productData changes
  useEffect(() => {
    if (productData) {
      setFormData({
        productName: productData.productName,
        sellerName: productData.sellerName,
        masterCategories: productData.masterCategories,
        differenceRate: productData.differenceRate || 0,
        productDescription: productData.productDescription,
        status: productData.status?.toLowerCase(),
      });
    }
  }, [productData]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
        // Note: sellerName and differenceRate are read-only in this context
        // status is managed separately via updateProductStatus API
      };

      console.log("Saving product data:", updateData);

      const response = await apiClient.updateProduct(productId, updateData);

      if (response.status === "SUCCESS") {
        console.log("Product updated successfully");

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

          {/* Documents */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Documents
            </h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                  <span className="text-primary-600 text-sm">📄</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  product-image.png
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="flex items-center space-x-1 px-3 py-1 bg-primary-50 text-primary-600 rounded text-sm hover:bg-primary-100">
                  <span>Open</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 bg-primary-50 text-primary-600 rounded text-sm hover:bg-primary-100">
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
                <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
                  🗑️
                </button>
              </div>
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
