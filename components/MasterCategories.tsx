import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  ChevronDown,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/utils/api";

interface Seller {
  sellerId: string;
  firmName: string;
}

interface MasterCategories {
  _id: string;
  name: string;
  sellerIds: string[];
  status: "Active" | "Inactive" | "Pending";
  createdAt: string;
  updatedAt: string;
}

interface CategoryRequest {
  _id: string;
  requestedBy: string;
  nameName: string;
  dateTime: string;
}

// Will fetch sellers from API instead of using dummy data

// Dummy data for master categories
const dummyMasterCategories: MasterCategories[] = [
  {
    _id: "1",
    sellerIds: ["s1", "s2", "s3", "s4", "s5", "s6"],
    name: "Steel Bars",
    status: "Active",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    sellerIds: ["s7", "s8", "s9", "s10", "s11"],
    name: "Iron Sheets",
    status: "Active",
    createdAt: "2024-01-16T11:20:00Z",
    updatedAt: "2024-01-16T11:20:00Z",
  },
  {
    _id: "3",
    sellerIds: ["s3"],
    name: "Steel Pipes",
    status: "Inactive",
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
  },
  {
    _id: "4",
    sellerIds: ["s4"],
    name: "Aluminum Rods",
    status: "Active",
    createdAt: "2024-01-18T14:45:00Z",
    updatedAt: "2024-01-18T14:45:00Z",
  },
  {
    _id: "5",
    sellerIds: ["s5"],
    name: "Copper Wire",
    status: "Active",
    createdAt: "2024-01-19T08:30:00Z",
    updatedAt: "2024-01-19T08:30:00Z",
  },
  {
    _id: "6",
    sellerIds: ["s6"],
    name: "Brass Fittings",
    status: "Inactive",
    createdAt: "2024-01-20T16:00:00Z",
    updatedAt: "2024-01-20T16:00:00Z",
  },
];

// Dummy data for category requests
const dummyCategoryRequests: CategoryRequest[] = [
  {
    _id: "r1",
    requestedBy: "Jyothi Steel",
    nameName: "Torkari",
    dateTime: "2025-09-18T11:25:00Z",
  },
  {
    _id: "r2",
    requestedBy: "Alpha Coatings",
    nameName: "Torkari",
    dateTime: "2025-09-18T11:25:00Z",
  },
  {
    _id: "r3",
    requestedBy: "Beta Plastics",
    nameName: "Torkari",
    dateTime: "2025-09-18T11:25:00Z",
  },
  {
    _id: "r4",
    requestedBy: "Alpha Coatings",
    nameName: "Torkari",
    dateTime: "2025-09-18T11:25:00Z",
  },
  {
    _id: "r5",
    requestedBy: "Jyothi Steel",
    nameName: "Torkari",
    dateTime: "2025-09-18T11:25:00Z",
  },
  {
    _id: "r6",
    requestedBy: "Alpha Coatings",
    nameName: "Torkari",
    dateTime: "2024-05-17T11:25:00Z",
  },
];

const MasterCategories = () => {
  
  // Helper function to get seller names from sellerIds
  const getSellerNames = (sellerIds: string[]): string[] => {
    const sellers = sellerIds
      .map((sellerId) => {
        const found = allSellers.find((seller) => seller.sellerId === sellerId);
        if (!found) {
          console.log(`Seller not found for ID: ${sellerId}, available IDs:`, allSellers.map(s => s.sellerId));
        }
        return found?.firmName;
      })
      .filter((name): name is string => Boolean(name));
    return sellers.length > 0 ? sellers : ["N/A"];
  };

  const [masterCategories, setMasterCategories] = useState<MasterCategories[]>(
    dummyMasterCategories
  );
  const [filteredMasterCategories, setFilteredMasterCategories] = useState<
    MasterCategories[]
  >(dummyMasterCategories);

  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  const [requestCounts, setRequestCounts] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSellersModal, setShowSellersModal] = useState(false);
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sellerFilter, setSellerFilter] = useState<string>("All");
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [shownameDetailModal, setShownameDetailModal] =
    useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [editedStatus, setEditedStatus] = useState<"Active" | "Inactive">(
    "Active"
  );

  const [categoryRequests, setCategoryRequests] = useState<CategoryRequest[]>(
    dummyCategoryRequests
  );
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  // const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  // const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchSellers();
    fetchMasterCategories();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = masterCategories;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          getSellerNames(category.sellerIds).some((name) =>
            name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (category) => category.status === statusFilter
      );
    }

    // Apply seller filter
    if (sellerFilter !== "All") {
      filtered = filtered.filter((category) =>
        category.sellerIds.includes(sellerFilter)
      );
    }

    setFilteredMasterCategories(filtered);
  }, [searchTerm, statusFilter, sellerFilter, masterCategories]);

  // Fetch all sellers
  const fetchSellers = async () => {
    try {
      const response = await apiClient.getAllSellers();
      console.log("Sellers API Response:", response);
      if (response.status === "SUCCESS") {
        // Backend returns data directly as array, not nested in sellers property
        const sellers = Array.isArray(response.data) ? response.data : response.data?.sellers || [];
        console.log("Sellers loaded:", sellers);
        setAllSellers(sellers);
      }
    } catch (err) {
      console.error("Error fetching sellers:", err);
      setAllSellers([]);
    }
  };

  // fetch master categories
  const fetchMasterCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAllMasterCategories({
        limit: 10,
        page: 1
      });
      
      if (response.status === "SUCCESS") {
        setMasterCategories(response.data as MasterCategories[]);
      } else {
        setError(response.message || "Failed to fetch master categories");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch master categories";
      setError(errorMsg);
      console.error("Error fetching master categories:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle approve request
  const handleApproveRequest = (requestId: string) => {
    console.log("Approving request:", requestId);
    // Remove the request from the list after approval
    setCategoryRequests(
      categoryRequests.filter((req) => req._id !== requestId)
    );
    setRequestCounts(String(Number(requestCounts) - 1));
  };

  // Handle reject request
  const handleRejectRequest = (requestId: string) => {
    console.log("Rejecting request:", requestId);
    // Remove the request from the list after rejection
    setCategoryRequests(
      categoryRequests.filter((req) => req._id !== requestId)
    );
    setRequestCounts(String(Number(requestCounts) - 1));
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} - ${hours}:${minutes}PM`;
  };

  // Handle add category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const response = await apiClient.createMasterCategory({
        name: newCategoryName,
        sellerIds: [],
        status: "Active"
      });

      if (response.status === "SUCCESS") {
        // Refresh the list
        await fetchMasterCategories();
        setNewCategoryName("");
        setShowAddCategoryModal(false);
        alert("Master category created successfully!");
      } else {
        alert(response.message || "Failed to create master category");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create master category";
      alert(errorMsg);
      console.error("Error creating master category:", err);
    }
  };

  // Handle and cancel add category
  const handleCancelAddCategory = () => {
    setNewCategoryName("");
    setShowAddCategoryModal(false);
  };

  //Handle Edit Click for master categories
  const handleEditClick = (categoryId: string) => {
    const category = masterCategories.find((cat) => cat._id === categoryId);
    if (category) {
      setSelectedCategoryId(categoryId);
      setEditedCategoryName(category.name);
      setEditedStatus(category.status);
      setShownameDetailModal(true);
    }
  };

  // Handle save category updates
  const handleSaveCategory = async () => {
    if (!editedCategoryName.trim()) {
      alert("Category name cannot be empty");
      return;
    }

    try {
      const response = await apiClient.updateMasterCategory(selectedCategoryId, {
        name: editedCategoryName,
        status: editedStatus
      });

      if (response.status === "SUCCESS") {
        await fetchMasterCategories();
        setShownameDetailModal(false);
        alert("Category updated successfully!");
      } else {
        alert(response.message || "Failed to update master category");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update master category";
      alert(errorMsg);
      console.error("Error updating master category:", err);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setShownameDetailModal(false);
  };

  // // Handle delete category - show confirmation modal
  // const handleDeleteClick = (categoryId: string) => {
  //   setCategoryToDelete(categoryId);
  //   setShowDeleteConfirmModal(true);
  // };

  // // Handle confirm delete
  // const handleConfirmDelete = async () => {
  //   if (categoryToDelete) {
  //     try {
  //       const response = await apiClient.deleteMasterCategory(categoryToDelete);

  //       if (response.status === "SUCCESS") {
  //         await fetchMasterCategories();
  //         alert("Category deleted successfully!");
  //       } else {
  //         alert(response.message || "Failed to delete master category");
  //       }
  //     } catch (err) {
  //       const errorMsg = err instanceof Error ? err.message : "Failed to delete master category";
  //       alert(errorMsg);
  //       console.error("Error deleting master category:", err);
  //     }
  //   }
  //   setShowDeleteConfirmModal(false);
  //   setCategoryToDelete(null);
  // };

  // // Handle cancel delete
  // const handleCancelDelete = () => {
  //   setShowDeleteConfirmModal(false);
  //   setCategoryToDelete(null);
  // };

  // this is while master categories are loading
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">
            Loading master categories...
          </span>
        </div>
      </div>
    );
  }

  //   If there is something gone wrong while getting data of master categories
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center text-red-600">
          <AlertCircle className="w-8 h-8" />
          <span className="ml-2">{error}</span>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={fetchMasterCategories}
            className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700"
          >
            Please Retry
          </button>
        </div>
      </div>
    );
  }

  //Finally rendering the data of master categories
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">

      {/* Header with search and filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex justify-between w-full space-x-2">
            <div className="flex gap-5 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by category or seller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Seller Filter */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <select
                    value={sellerFilter}
                    onChange={(e) => setSellerFilter(e.target.value)}
                    className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  >
                    <option value="All">All Sellers</option>
                    {allSellers.map((seller) => (
                      <option key={seller.sellerId} value={seller.sellerId}>
                        {seller.firmName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="h-full">
                <button
                  onClick={() => setShowRequestsModal(true)}
                  className="border border-red-200 rounded-md h-full px-3 hover:bg-red-50 transition-colors"
                >
                  Requests ({requestCounts})
                </button>
              </div>
            </div>

            {/* add master categories button */}
            <div>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Master Category</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* data table */}
      <div className="p-6 ">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Master Category Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seller Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMasterCategories.length > 0 ? (
              filteredMasterCategories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const sellerNames = getSellerNames(category.sellerIds);
                        return (
                          <>
                            {sellerNames.slice(0, 2).map((sellerName, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 border border-blue-100 text-blue-800 rounded text-xs"
                              >
                                {sellerName}
                              </span>
                            ))}
                            {sellerNames.length > 2 && (
                              <button
                                onClick={() => {
                                  setSelectedSellers(sellerNames);
                                  setSelectedCategoryName(category.name);
                                  setShowSellersModal(true);
                                }}
                                className="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-100 transition-colors"
                              >
                                +{sellerNames.length - 2} more
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEditClick(category._id)}
                      className="text-blue-500 hover:text-blue-300 p-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No master categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* All the Modals  Below */}

      {/* Modal for showing all sellers */}
      {showSellersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sellers in {selectedCategoryName}
                </h3>
                <button
                  onClick={() => setShowSellersModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <ul className="space-y-2">
                {selectedSellers.map((seller, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 bg-gray-50 rounded border border-gray-200 text-sm text-gray-700"
                  >
                    {seller}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding new master category */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Add Master Category
              </h2>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Master Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Placeholder Text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelAddCategory}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for showing category requests */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Master Category Requests
              </h3>
              <button
                onClick={() => setShowRequestsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="overflow-auto flex-1">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Requested By Seller
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Master Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        Date and Time
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          />
                        </svg>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryRequests.length > 0 ? (
                    categoryRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.requestedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.nameName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(request.dateTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveRequest(request._id)}
                              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        No category requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {shownameDetailModal &&
        (() => {
          const selectedCategory = masterCategories.find(
            (cat) => cat._id === selectedCategoryId
          );

          if (!selectedCategory) return null;

          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Master Category Details
                  </h3>
                  <button
                    onClick={() => setShownameDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={editedCategoryName}
                      onChange={(e) => setEditedCategoryName(e.target.value)}
                      className="w-full text-base text-gray-900 bg-white px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={editedStatus}
                        onChange={(e) =>
                          setEditedStatus(
                            e.target.value as "Active" | "Inactive" | "Pending"
                          )
                        }
                        className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 pr-10"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Sellers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Associated Sellers ({(() => getSellerNames(selectedCategory.sellerIds).length)()})
                    </label>
                    <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                      {(() => {
                        const sellerNames = getSellerNames(selectedCategory.sellerIds);
                        return sellerNames.length > 0 ? (
                          <ul className="space-y-2">
                            {sellerNames.map(
                              (sellerName, index) => (
                                <li
                                  key={index}
                                  className="px-3 py-2 bg-white rounded border border-gray-200 text-sm text-gray-700"
                                >
                                  {sellerName}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No sellers associated
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCategory}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Delete Confirmation Modal */}
      {/* {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Master Category
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to delete this master category? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default MasterCategories;
