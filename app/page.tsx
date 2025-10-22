"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/utils/api";
import StatCard from "@/components/StatCard";
import RecentActivity from "@/components/RecentActivity";
import ProductApprovalQueue from "@/components/ProductApprovalQueue";
import DealerPortalTable from "@/components/DealerPortalTable";
import SellerUsersTable from "@/components/SellerUsersTable";
import ProductsTable from "@/components/ProductsTable";
import MasterRatesTable from "@/components/MasterRatesTable";
import MainProductsTable from "@/components/MainProductsTable";
import BidsTable from "@/components/BidsTable";
import OrdersTable from "@/components/OrdersTable";
import TrucksTable from "@/components/TrucksTable";
import SellerChats from "@/components/SellerChats";
import SupportChat from "@/components/SupportChat";
import MasterCategories from "@/components/MasterCategories";
import OnlineSellersModal from "@/components/OnlineSellersModal";

export default function Home() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [currentView, setCurrentView] = useState("dashboard");
  const [isOnlineSellersModalOpen, setIsOnlineSellersModalOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await apiClient.getAdminDashboardStats();

      console.log("=== FULL API RESPONSE ===", response);
      console.log("Response status:", response.status);
      console.log("Response success:", response.success);
      console.log("Response data:", response.data);
      console.log("Main stats:", response.data?.mainStats);
      console.log("Pending products count:", response.data?.mainStats?.pendingProductsCount);

      // Check for either 'status: SUCCESS' or 'success: true'
      if ((response.status === "SUCCESS" || response.success === true) && response.data) {
        setDashboardStats(response.data);
        console.log("✅ Dashboard stats SET:", response.data);
      } else {
        console.log("❌ Response status not SUCCESS or no data");
      }
    } catch (err) {
      console.error("❌ Error fetching dashboard stats:", err);
      // Keep existing stats or set defaults
      setDashboardStats({
        mainStats: {
          pendingSellersCount: 0,
          pendingProductsCount: 0,
          pendingBidsCount: 0,
          inTransitOrdersCount: 0,
        },
      });
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleItemClick = (item: string) => {
    setActiveItem(item);
    if (item === "dashboard") {
      setCurrentView("dashboard");
    } else if (item === "sellers") {
      setCurrentView("dealer-portal");
    } else if (item === "seller-users") {
      setCurrentView("seller-users");
    } else if (item === "products") {
      setCurrentView("products");
    } else if (item === "master-categories") {
      setCurrentView("master-categories");
    } else if (item === "master-rates") {
      setCurrentView("master-rates");
    } else if (item === "bids") {
      setCurrentView("bids");
    } else if (item === "orders") {
      setCurrentView("orders");
    } else if (item === "trucks") {
      setCurrentView("trucks");
    } else if (item === "seller-chats") {
      setCurrentView("seller-chats");
    } else if (item === "support-chat") {
      setCurrentView("support-chat");
    } else {
      setCurrentView(item);
    }
  };

  const renderMainContent = () => {
    if (currentView === "dealer-portal") {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
                Dealer Portal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <DealerPortalTable />
        </div>
      );
    }

    if (currentView === "seller-users") {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
                Dealer Portal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <SellerUsersTable />
        </div>
      );
    }

    if (currentView === "products") {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
                Dealer Portal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <ProductsTable />
        </div>
      );
    }

    if (currentView === "main-products") {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
                Admin Dashboard
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <MainProductsTable />
        </div>
      );
    }

        if (currentView === "master-categories") {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
                Dealer Portal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <MasterCategories />
        </div>
      );
    }

    if (currentView === "master-rates") {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
                Dealer Portal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <MasterRatesTable />
        </div>
      );
    }

    if (currentView === "bids") {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
                Dealer Portal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <BidsTable />
        </div>
      );
    }

    if (currentView === "orders") {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
                Dealer Portal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <OrdersTable />
        </div>
      );
    }

    if (currentView === "trucks") {
      return (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
                Dealer Portal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <TrucksTable />
        </div>
      );
    }

    if (currentView === "seller-chats") {
      return <SellerChats />;
    }

    if (currentView === "support-chat") {
      return <SupportChat />;
    }

    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white px-3 py-1 rounded text-sm">
              Dealer Portal
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="w-6 h-6 text-gray-600" />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Sellers Pending Approval"
            value={
              statsLoading
                ? 0
                : dashboardStats?.mainStats?.pendingSellersCount || 0
            }
            bgColor="bg-primary-100"
            loading={statsLoading}
          />
          <StatCard
            title="Products Pending Approval"
            value={
              statsLoading
                ? 0
                : dashboardStats?.mainStats?.pendingProductsCount || 0
            }
            bgColor="bg-purple-100"
            loading={statsLoading}
          />
          <StatCard
            title="Bids Awaiting Action"
            value={
              statsLoading
                ? 0
                : dashboardStats?.mainStats?.pendingBidsCount || 0
            }
            bgColor="bg-green-100"
            loading={statsLoading}
          />
          <StatCard
            title="Orders in Transit"
            value={
              statsLoading
                ? 0
                : dashboardStats?.mainStats?.inTransitOrdersCount || 0
            }
            bgColor="bg-gray-100"
            loading={statsLoading}
          />
        </div>

        {/* Tables Section with Online Sellers Button */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Activity Overview</h3>
          <button
            onClick={() => setIsOnlineSellersModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border border-green-200"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">View Online Sellers</span>
          </button>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <ProductApprovalQueue />
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
        <main className="flex-1 overflow-auto">{renderMainContent()}</main>

        {/* Online Sellers Modal */}
        <OnlineSellersModal
          isOpen={isOnlineSellersModalOpen}
          onClose={() => setIsOnlineSellersModalOpen(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
