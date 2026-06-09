"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search,
  MapPin,
  AlertTriangle,
} from "lucide-react";

// Asset marker colors based on condition
const getMarkerColor = (conditionRating) => {
  if (conditionRating >= 4) return "#10B981";
  if (conditionRating === 3) return "#F59E0B";
  if (conditionRating <= 2) return "#EF4444";
  return "#6B7280";
};

// Asset type icons mapping
const getAssetIcon = (assetType) => {
  switch (assetType?.toLowerCase()) {
    case "road":
      return "\u{1F6E3}\uFE0F";
    case "bridge":
      return "\u{1F309}";
    case "culvert":
      return "\u{1F6B0}";
    case "sign":
      return "\u{1FAA7}";
    case "traffic light":
      return "\u{1F6A6}";
    case "guardrail":
      return "\u{1F6E1}\uFE0F";
    default:
      return "\u{1F4CD}";
  }
};

// Create a colored circle marker icon
function createMarkerIcon(color, isSelected) {
  const size = isSelected ? 20 : 14;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="${color}" stroke="white" stroke-width="2"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// Component to fly map to a position
function FlyToAsset({ asset }) {
  const map = useMap();
  useEffect(() => {
    if (asset) {
      map.flyTo([asset.latitude, asset.longitude], 15, { duration: 1 });
    }
  }, [asset, map]);
  return null;
}

export default function AssetsMap({ selectedAsset, onAssetSelect }) {
  const [selectedMapAsset, setSelectedMapAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCondition, setFilterCondition] = useState("");

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

  const handleAssetClick = useCallback(
    (asset) => {
      setSelectedMapAsset(asset);
      if (onAssetSelect) {
        onAssetSelect(asset);
      }
    },
    [onAssetSelect],
  );

  const getConditionText = (rating) => {
    if (rating >= 4) return "Excellent";
    if (rating === 3) return "Good";
    if (rating === 2) return "Fair";
    if (rating === 1) return "Poor";
    return "Unknown";
  };

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
        <MapContainer
          center={[-22.9576, 18.4904]}
          zoom={6}
          style={{ width: "100%", height: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {selectedAsset && <FlyToAsset asset={selectedAsset} />}

          {/* Asset markers */}
          {filteredAssets.map((asset) => (
            <Marker
              key={asset.id}
              position={[asset.latitude, asset.longitude]}
              icon={createMarkerIcon(
                getMarkerColor(asset.condition_rating),
                selectedMapAsset?.id === asset.id,
              )}
              eventHandlers={{
                click: () => handleAssetClick(asset),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{asset.name}</h3>
                      <p className="text-xs text-gray-500">
                        {asset.asset_id} &bull; {asset.asset_type_name}
                      </p>
                    </div>
                    <span className="text-lg">
                      {getAssetIcon(asset.asset_type_name)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Condition:</span>
                      <span
                        className="px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor:
                            getMarkerColor(asset.condition_rating) + "20",
                          color: getMarkerColor(asset.condition_rating),
                        }}
                      >
                        {getConditionText(asset.condition_rating)} (
                        {asset.condition_rating}/5)
                      </span>
                    </div>
                    {asset.address && (
                      <p className="text-xs text-gray-500">
                        {"\u{1F4CD}"} {asset.address}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-[#1E1E1E] border border-[#E5EAF0] dark:border-gray-700 rounded-lg shadow-sm p-3">
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
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-[1000]">
            <div className="text-[#0066FF] dark:text-[#4A90E2] font-inter">
              Loading assets...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
