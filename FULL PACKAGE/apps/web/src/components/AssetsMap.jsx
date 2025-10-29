"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import {
  Plus,
  Minus,
  Crosshair,
  Filter,
  Search,
  MapPin,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

// Asset marker colors based on condition
const getMarkerColor = (conditionRating) => {
  if (conditionRating >= 4) return "#10B981"; // Green for good condition
  if (conditionRating === 3) return "#F59E0B"; // Yellow for fair condition
  if (conditionRating <= 2) return "#EF4444"; // Red for poor condition
  return "#6B7280"; // Gray for unknown
};

// Asset type icons mapping
const getAssetIcon = (assetType) => {
  switch (assetType?.toLowerCase()) {
    case "road":
      return "🛣️";
    case "bridge":
      return "🌉";
    case "culvert":
      return "🚰";
    case "sign":
      return "🪧";
    case "traffic light":
      return "🚦";
    case "guardrail":
      return "🛡️";
    default:
      return "📍";
  }
};

// Custom marker component
function AssetMarker({ asset, onClick, isSelected }) {
  const markerColor = getMarkerColor(asset.condition_rating);

  return (
    <Marker
      position={{ lat: asset.latitude, lng: asset.longitude }}
      onClick={() => onClick(asset)}
      title={`${asset.name} - Condition: ${asset.condition_rating}/5`}
    />
  );
}

// Asset info window component
function AssetInfoWindow({ asset, onClose, onInspect, onCreateWorkOrder }) {
  const getConditionText = (rating) => {
    if (rating >= 4) return "Excellent";
    if (rating === 3) return "Good";
    if (rating === 2) return "Fair";
    if (rating === 1) return "Poor";
    return "Unknown";
  };

  const getConditionColor = (rating) => {
    if (rating >= 4)
      return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
    if (rating === 3)
      return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
    if (rating <= 2)
      return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
    return "text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400";
  };

  return (
    <InfoWindow
      position={{ lat: asset.latitude, lng: asset.longitude }}
      onCloseClick={onClose}
    >
      <div className="p-4 max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-[#111827] dark:text-[#DEDEDE] font-inter">
              {asset.name}
            </h3>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              {asset.asset_id} • {asset.asset_type_name}
            </p>
          </div>
          <span className="text-lg">{getAssetIcon(asset.asset_type_name)}</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              Condition:
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(asset.condition_rating)}`}
            >
              {getConditionText(asset.condition_rating)} (
              {asset.condition_rating}/5)
            </span>
          </div>

          {asset.address && (
            <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              📍 {asset.address}
            </div>
          )}

          {asset.last_maintenance_date && (
            <div className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              🔧 Last maintained:{" "}
              {new Date(asset.last_maintenance_date).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onInspect(asset)}
            className="flex-1 px-3 py-2 bg-[#0066FF] dark:bg-[#4A90E2] text-white text-sm font-medium rounded-lg hover:bg-[#0052E6] dark:hover:bg-[#3A7BC8] transition-colors duration-150 font-inter"
          >
            Inspect
          </button>
          <button
            onClick={() => onCreateWorkOrder(asset)}
            className="flex-1 px-3 py-2 bg-[#E7EEFF] dark:bg-[#1A2332] text-[#0065FF] dark:text-[#4A90E2] text-sm font-medium rounded-lg hover:bg-[#D4E4FF] dark:hover:bg-[#243040] transition-colors duration-150 font-inter"
          >
            Work Order
          </button>
        </div>
      </div>
    </InfoWindow>
  );
}

export default function AssetsMap({ selectedAsset, onAssetSelect }) {
  const [selectedMapAsset, setSelectedMapAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const mapRef = useRef(null);

  // Fetch assets data
  const {
    data: assets = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["assets", filterType, filterCondition],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterType) params.append("type", filterType);
      if (filterCondition) params.append("condition", filterCondition);

      const response = await fetch(`/api/assets?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch assets");
      }
      return response.json();
    },
  });

  // Fetch asset types for filter
  const { data: assetTypes = [] } = useQuery({
    queryKey: ["asset-types"],
    queryFn: async () => {
      const response = await fetch("/api/asset-types");
      if (!response.ok) {
        throw new Error("Failed to fetch asset types");
      }
      return response.json();
    },
  });

  // Filter assets based on search term
  const filteredAssets = assets.filter(
    (asset) =>
      asset.approval_status === "approved" &&
      asset.status === "active" &&
      (searchTerm === "" ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.address?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Map control handlers
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(currentZoom + 1);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(Math.max(currentZoom - 1, 1));
    }
  }, []);

  const handleRecenter = useCallback(() => {
    if (mapRef.current && filteredAssets.length > 0) {
      // Calculate bounds to fit all assets
      if (typeof window !== "undefined" && window.google) {
        const bounds = new window.google.maps.LatLngBounds();
        filteredAssets.forEach((asset) => {
          bounds.extend({ lat: asset.latitude, lng: asset.longitude });
        });
        mapRef.current.fitBounds(bounds);
      }
    }
  }, [filteredAssets]);

  // Asset interaction handlers
  const handleAssetClick = useCallback(
    (asset) => {
      setSelectedMapAsset(asset);
      if (onAssetSelect) {
        onAssetSelect(asset);
      }
    },
    [onAssetSelect],
  );

  const handleInspect = useCallback((asset) => {
    console.log("Create inspection for asset:", asset.asset_id);
    // Navigate to inspection form
  }, []);

  const handleCreateWorkOrder = useCallback((asset) => {
    console.log("Create work order for asset:", asset.asset_id);
    // Navigate to work order form
  }, []);

  // Center map on selected asset
  useEffect(() => {
    if (selectedAsset && mapRef.current) {
      mapRef.current.setCenter({
        lat: selectedAsset.latitude,
        lng: selectedAsset.longitude,
      });
      mapRef.current.setZoom(15);
      setSelectedMapAsset(selectedAsset);
    }
  }, [selectedAsset]);

  // Calculate center point for Namibia
  const defaultCenter = { lat: -22.9576, lng: 18.4904 }; // Windhoek, Namibia
  const defaultZoom = 6;

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            <span className="text-red-700 dark:text-red-400">
              Failed to load map data
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#121212]">
      {/* Map Controls Header */}
      <div className="flex-shrink-0 bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search
                size={16}
                className="text-[#6B7280] dark:text-[#9CA3AF]"
              />
            </div>
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-[#111827] dark:text-[#DEDEDE] placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 dark:focus:ring-[#4A90E2]/20 font-inter"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 px-3 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 dark:focus:ring-[#4A90E2]/20 font-inter"
            >
              <option value="">All Types</option>
              {assetTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="h-10 px-3 bg-gray-50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 dark:focus:ring-[#4A90E2]/20 font-inter"
            >
              <option value="">All Conditions</option>
              <option value="1">Poor (1)</option>
              <option value="2">Fair (2)</option>
              <option value="3">Good (3)</option>
              <option value="4">Very Good (4)</option>
              <option value="5">Excellent (5)</option>
            </select>
          </div>
        </div>

        {/* Asset count */}
        <div className="mt-3 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
          Showing {filteredAssets.length} assets
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
          <Map
            ref={mapRef}
            style={{ width: "100%", height: "100%" }}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            gestureHandling="greedy"
            disableDefaultUI={true}
            mapId="asset-map"
          >
            {/* Asset markers */}
            {filteredAssets.map((asset) => (
              <AssetMarker
                key={asset.id}
                asset={asset}
                onClick={handleAssetClick}
                isSelected={selectedMapAsset?.id === asset.id}
              />
            ))}

            {/* Selected asset info window */}
            {selectedMapAsset && (
              <AssetInfoWindow
                asset={selectedMapAsset}
                onClose={() => setSelectedMapAsset(null)}
                onInspect={handleInspect}
                onCreateWorkOrder={handleCreateWorkOrder}
              />
            )}
          </Map>
        </APIProvider>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white dark:bg-[#1E1E1E] border border-[#E5EAF0] dark:border-gray-700 rounded-lg shadow-sm flex items-center justify-center hover:bg-[#F6F9FF] dark:hover:bg-gray-700 transition-colors duration-150"
            aria-label="Zoom in"
          >
            <Plus size={16} className="text-[#0E1B32] dark:text-[#DEDEDE]" />
          </button>

          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white dark:bg-[#1E1E1E] border border-[#E5EAF0] dark:border-gray-700 rounded-lg shadow-sm flex items-center justify-center hover:bg-[#F6F9FF] dark:hover:bg-gray-700 transition-colors duration-150"
            aria-label="Zoom out"
          >
            <Minus size={16} className="text-[#0E1B32] dark:text-[#DEDEDE]" />
          </button>

          <button
            onClick={handleRecenter}
            className="w-10 h-10 bg-white dark:bg-[#1E1E1E] border border-[#E5EAF0] dark:border-gray-700 rounded-full shadow-sm flex items-center justify-center hover:bg-[#F6F9FF] dark:hover:bg-gray-700 transition-colors duration-150"
            aria-label="Fit all assets"
          >
            <Crosshair
              size={16}
              className="text-[#0E1B32] dark:text-[#DEDEDE]"
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-[#1E1E1E] border border-[#E5EAF0] dark:border-gray-700 rounded-lg shadow-sm p-3">
          <h4 className="text-sm font-medium text-[#111827] dark:text-[#DEDEDE] mb-2 font-inter">
            Asset Condition
          </h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                Excellent (4-5)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                Good (3)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-inter">
                Poor (1-2)
              </span>
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center">
            <div className="text-[#0066FF] dark:text-[#4A90E2] font-inter">
              Loading assets...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
