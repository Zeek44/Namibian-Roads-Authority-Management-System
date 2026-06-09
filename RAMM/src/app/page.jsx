'use client';

import { useState, lazy, Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SidebarNavigation from "../components/SidebarNavigation";
import PageHeader from "../components/PageHeader";
import RAMMSDashboard from "../components/RAMMSDashboard";
import InspectionsList from "../components/InspectionsList";
import WorkOrdersList from "../components/WorkOrdersList";
import AssetsList from "../components/AssetsList";

const AssetsMap = typeof window !== "undefined"
  ? lazy(() => import("../components/AssetsMap"))
  : () => null;

// Navigation items for RAMMS system
const navigationItems = [
  { id: "dashboard", icon: "Grid3X3", label: "Dashboard" },
  { id: "map", icon: "MapPin", label: "Map View" },
  { id: "assets", icon: "Building2", label: "Assets" },
  { id: "inspections", icon: "Clipboard", label: "Inspections" },
  { id: "work-orders", icon: "Wrench", label: "Work Orders" },
];

export default function HomePage() {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Fetch dashboard stats for header notifications
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const renderMainContent = () => {
    switch (activeView) {
      case "dashboard":
        return <RAMMSDashboard onNavigate={setActiveView} />;
      case "map":
        return (
          <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="text-[#0066FF] font-inter">Loading map...</div></div>}>
            <AssetsMap 
              selectedAsset={selectedAsset}
              onAssetSelect={setSelectedAsset}
            />
          </Suspense>
        );
      case "assets":
        return (
          <AssetsList 
            selectedAsset={selectedAsset}
            onAssetSelect={setSelectedAsset}
          />
        );
      case "inspections":
        return <InspectionsList />;
      case "work-orders":
        return <WorkOrdersList />;
      default:
        return <RAMMSDashboard onNavigate={setActiveView} />;
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case "dashboard":
        return "RAMMS Dashboard";
      case "map":
        return "Asset Map View";
      case "assets":
        return "Asset Management";
      case "inspections":
        return "Inspections";
      case "work-orders":
        return "Work Orders";
      default:
        return "RAMMS Dashboard";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#121212]">
      {/* Sidebar Navigation */}
      <div className="hidden lg:block">
        <SidebarNavigation 
          activeItem={activeView}
          onItemSelect={setActiveView}
          navigationItems={navigationItems}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Page Header */}
        <PageHeader
          title={getPageTitle()}
          pendingCount={dashboardStats?.pending_approvals?.total || 0}
          activeView={activeView}
          onViewChange={setActiveView}
          navigationItems={navigationItems}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
}