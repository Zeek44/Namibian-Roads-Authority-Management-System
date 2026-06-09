import { ChevronLeft, Menu, X, Bell } from "lucide-react";
import { useState } from "react";

export default function PageHeader({
  title = "RAMMS Dashboard",
  pendingCount = 0,
  activeView = "dashboard",
  onViewChange = () => {},
  navigationItems = []
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleBack = () => {
    console.log("Navigate back");
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      <div className="h-20 bg-gray-50 dark:bg-[#121212] flex items-center justify-between px-4 sm:px-6 py-6 relative z-10 border-b border-gray-200 dark:border-gray-700">
        {/* Left group - Navigation */}
        <div className="flex items-center space-x-2">
          {/* Mobile menu button - only visible on small screens */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#0052E6] dark:focus:ring-[#4A90E2] focus:ring-inset"
            aria-label="Toggle menu"
          >
            {showMobileMenu ? (
              <X
                size={16}
                className="text-[#020814] dark:text-[#DEDEDE]"
                strokeWidth={2}
              />
            ) : (
              <Menu
                size={16}
                className="text-[#020814] dark:text-[#DEDEDE]"
                strokeWidth={2}
              />
            )}
          </button>

          {/* Title */}
          <h1 className="text-[#020814] dark:text-[#DEDEDE] font-inter font-semibold text-lg sm:text-xl">
            {title}
          </h1>
        </div>

        {/* Right group - Notifications */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button
            className="relative flex items-center justify-center w-10 h-10 bg-white dark:bg-[#1E1E1E] border border-[#E7EAF1] dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
            aria-label="Notifications"
          >
            <Bell
              size={16}
              className="text-[#111827] dark:text-[#DEDEDE]"
            />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70"
          onClick={toggleMobileMenu}
        >
          <div
            className="bg-white dark:bg-[#1E1E1E] w-64 h-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile menu header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-inter font-semibold text-[#020814] dark:text-[#DEDEDE]">
                RAMMS
              </h2>
              <button
                onClick={toggleMobileMenu}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={16} className="text-[#020814] dark:text-[#DEDEDE]" />
              </button>
            </div>

            {/* Mobile navigation items */}
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    toggleMobileMenu();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md font-inter transition-colors duration-150 ${
                    activeView === item.id
                      ? "bg-[#0066FF1A] dark:bg-[#4A90E2]/20 text-[#0066FF] dark:text-[#4A90E2] font-medium"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 text-[#020814] dark:text-[#DEDEDE]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}