'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  MapPin, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  MoreVertical
} from "lucide-react";

// Asset condition badge component
function ConditionBadge({ rating }) {
  const getConditionProps = (rating) => {
    if (rating >= 4) return {
      text: 'Excellent',
      className: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
    };
    if (rating === 3) return {
      text: 'Good',
      className: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
    };
    if (rating <= 2) return {
      text: 'Poor',
      className: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
    };
    return {
      text: 'Unknown',
      className: 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400'
    };
  };

  const { text, className } = getConditionProps(rating);

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {text} ({rating}/5)
    </span>
  );
}

// Asset card component
function AssetCard({ asset, onSelect, onInspect, onCreateWorkOrder, isSelected }) {
  const getAssetIcon = (assetType) => {
    switch (assetType?.toLowerCase()) {
      case 'road':
        return '🛣️';
      case 'bridge':
        return '🌉';
      case 'culvert':
        return '🚰';
      case 'sign':
        return '🪧';
      case 'traffic light':
        return '🚦';
      case 'guardrail':
        return '🛡️';
      default:
        return '📍';
    }
  };

  const getStatusColor = (approvalStatus) => {
    switch (approvalStatus) {
      case 'approved':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div
      className={`bg-white dark:bg-[#1E1E1E] rounded-xl border shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200 p-4 cursor-pointer ${
        isSelected 
          ? "border-[#0062FF] dark:border-[#4A90E2] ring-2 ring-[#0062FF]/20 dark:ring-[#4A90E2]/20" 
          : "border-[#F1F3F8] dark:border-gray-700 hover:border-[#E1E5E9] dark:hover:border-gray-600"
      }`}
      onClick={() => onSelect(asset)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getAssetIcon(asset.asset_type_name)}</div>
          <div>
            <h3 className="font-semibold text-[#111827] dark:text-[#DEDEDE] font-inter">
              {asset.name}
            </h3>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              {asset.asset_id} • {asset.asset_type_name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.approval_status)}`}>
            {asset.approval_status}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('More options for asset:', asset.asset_id);
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
          >
            <MoreVertical size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
          </button>
        </div>
      </div>

      {/* Condition and Location */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">Condition:</span>
          <ConditionBadge rating={asset.condition_rating} />
        </div>
        
        {asset.address && (
          <div className="flex items-start space-x-2">
            <MapPin size={14} className="text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 flex-shrink-0" />
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              {asset.address}
            </span>
          </div>
        )}

        {asset.last_maintenance_date && (
          <div className="flex items-center space-x-2">
            <Calendar size={14} className="text-[#6B7280] dark:text-[#9CA3AF]" />
            <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
              Last maintained: {new Date(asset.last_maintenance_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInspect(asset);
          }}
          className="flex-1 px-3 py-2 bg-[#0066FF] dark:bg-[#4A90E2] text-white text-sm font-medium rounded-lg hover:bg-[#0052E6] dark:hover:bg-[#3A7BC8] transition-colors duration-150 font-inter flex items-center justify-center space-x-1"
        >
          <Eye size={14} />
          <span>Inspect</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateWorkOrder(asset);
          }}
          className="flex-1 px-3 py-2 bg-[#E7EEFF] dark:bg-[#1A2332] text-[#0065FF] dark:text-[#4A90E2] text-sm font-medium rounded-lg hover:bg-[#D4E4FF] dark:hover:bg-[#243040] transition-colors duration-150 font-inter flex items-center justify-center space-x-1"
        >
          <Edit size={14} />
          <span>Work Order</span>
        </button>
      </div>
    </div>
  );
}

// Empty state component
function EmptyAssetsState({ searchTerm, hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-[#F0F4FF] dark:bg-[#1A2332] rounded-full flex items-center justify-center mb-4">
        <Building2 size={32} className="text-[#6B7BD8] dark:text-[#4A90E2]" />
      </div>
      <h3 className="text-[#111827] dark:text-[#DEDEDE] font-inter font-semibold text-lg mb-2">
        {searchTerm || hasFilters ? 'No assets found' : 'No assets yet'}
      </h3>
      <p className="text-[#6B7280] dark:text-[#9CA3AF] font-inter text-sm text-center mb-6 max-w-sm">
        {searchTerm || hasFilters 
          ? 'Try adjusting your search terms or filters to find assets.'
          : 'Get started by adding your first road asset to the system.'
        }
      </p>
      {!searchTerm && !hasFilters && (
        <button className="px-6 py-2.5 bg-[#0062FF] dark:bg-[#4A90E2] text-white font-inter font-medium text-sm rounded-full hover:bg-[#0052E6] dark:hover:bg-[#3A7BC8] transition-colors duration-150">
          Add First Asset
        </button>
      )}
    </div>
  );
}

export default function AssetsList({ selectedAsset, onAssetSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch assets data
  const { data: assets = [], isLoading, error } = useQuery({
    queryKey: ['assets', filterType, filterCondition, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterCondition) params.append('condition', filterCondition);
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await fetch(`/api/assets?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      return response.json();
    },
  });

  // Fetch asset types for filter
  const { data: assetTypes = [] } = useQuery({
    queryKey: ['asset-types'],
    queryFn: async () => {
      const response = await fetch('/api/asset-types');
      if (!response.ok) {
        throw new Error('Failed to fetch asset types');
      }
      return response.json();
    },
  });

  // Filter assets based on search term
  const filteredAssets = assets.filter(asset =>
    searchTerm === "" ||
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssetSelect = (asset) => {
    if (onAssetSelect) {
      onAssetSelect(asset);
    }
  };

  const handleInspect = (asset) => {
    console.log('Create inspection for asset:', asset.asset_id);
    // Navigate to inspection form
  };

  const handleCreateWorkOrder = (asset) => {
    console.log('Create work order for asset:', asset.asset_id);
    // Navigate to work order form
  };

  const handleAddAsset = () => {
    console.log('Add new asset');
    // Navigate to asset form
  };

  const hasFilters = filterType || filterCondition || filterStatus;

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2" size={20} />
            <span className="text-red-700 dark:text-red-400">Failed to load assets</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-b from-[#FCFDFF] to-[#F6F8FF] dark:from-[#121212] dark:to-[#0F0F0F] flex flex-col">
      {/* Header Controls */}
      <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        {/* Search and Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white dark:bg-[#1E1E1E] border border-[#E7EAF1] dark:border-gray-700 rounded-xl shadow-sm text-sm text-[#111827] dark:text-[#DEDEDE] placeholder-[#6B7280] dark:placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 dark:focus:ring-[#4A90E2]/20 font-inter"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-11 px-3 bg-white dark:bg-[#1E1E1E] border border-[#E7EAF1] dark:border-gray-700 rounded-xl shadow-sm text-sm text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 dark:focus:ring-[#4A90E2]/20 font-inter"
            >
              <option value="">All Types</option>
              {assetTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="h-11 px-3 bg-white dark:bg-[#1E1E1E] border border-[#E7EAF1] dark:border-gray-700 rounded-xl shadow-sm text-sm text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 dark:focus:ring-[#4A90E2]/20 font-inter"
            >
              <option value="">All Conditions</option>
              <option value="1">Poor (1)</option>
              <option value="2">Fair (2)</option>
              <option value="3">Good (3)</option>
              <option value="4">Very Good (4)</option>
              <option value="5">Excellent (5)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-11 px-3 bg-white dark:bg-[#1E1E1E] border border-[#E7EAF1] dark:border-gray-700 rounded-xl shadow-sm text-sm text-[#111827] dark:text-[#DEDEDE] focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 dark:focus:ring-[#4A90E2]/20 font-inter"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Add Asset Button */}
        <button
          onClick={handleAddAsset}
          className="w-full h-12 bg-[#E1ECFF] dark:bg-[#1A2332] hover:bg-[#D3E2FF] dark:hover:bg-[#243040] text-[#1E5CFF] dark:text-[#4A90E2] font-medium text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors duration-150 font-inter"
        >
          <Plus size={16} />
          <span>Add New Asset</span>
        </button>

        {/* Results count */}
        <div className="mt-4 text-sm text-[#6B7280] dark:text-[#9CA3AF] font-inter">
          {isLoading ? 'Loading...' : `${filteredAssets.length} assets found`}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-[#F1F3F8] dark:border-gray-700 p-4 animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <EmptyAssetsState searchTerm={searchTerm} hasFilters={hasFilters} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onSelect={handleAssetSelect}
                onInspect={handleInspect}
                onCreateWorkOrder={handleCreateWorkOrder}
                isSelected={selectedAsset?.id === asset.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}