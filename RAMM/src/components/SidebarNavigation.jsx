import { useState } from "react";
import {
  Box,
  Grid3X3,
  MapPin,
  Building2,
  Clipboard,
  Wrench,
  Settings,
} from "lucide-react";

const iconComponents = {
  Grid3X3,
  MapPin,
  Building2,
  Clipboard,
  Wrench,
};

export default function SidebarNavigation({ 
  activeItem = "dashboard", 
  onItemSelect = () => {},
  navigationItems = []
}) {
  const handleItemClick = (itemId) => {
    onItemSelect(itemId);
  };

  return (
    <div className="w-18 sm:w-20 bg-white dark:bg-[#1E1E1E] flex flex-col h-full font-inter">
      {/* Logo + Navigation */}
      <div className="flex flex-col items-center pt-6">
        {/* Brand Logo */}
        <div className="mb-6" title="RAMMS - Road Asset Management">
          <Box
            size={32}
            className="text-[#0066FF] dark:text-[#4A90E2]"
            strokeWidth={2}
          />
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = iconComponents[item.icon] || Grid3X3;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`
                  w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#0066FF1A] dark:bg-[#4A90E2]/20 hover:bg-[#0066FF26] dark:hover:bg-[#4A90E2]/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }
                `}
                title={item.label}
                aria-label={item.label}
              >
                <IconComponent
                  size={20}
                  className={`
                    ${
                      isActive
                        ? "text-[#0066FF] dark:text-[#4A90E2] opacity-100"
                        : "text-[#6B7280] dark:text-[#9CA3AF] opacity-65 hover:opacity-80"
                    } 
                    transition-opacity duration-200
                  `}
                  strokeWidth={2}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer to push settings to bottom */}
      <div className="flex-1"></div>

      {/* Settings - Bottom */}
      <div className="flex justify-center pb-6">
        <button
          className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          title="Settings"
          aria-label="Settings"
        >
          <Settings
            size={20}
            className="text-[#6B7280] dark:text-[#9CA3AF] opacity-65 hover:opacity-80 transition-opacity duration-200"
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}