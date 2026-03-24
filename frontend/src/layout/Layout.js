import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";

function Layout() {
  const location = useLocation();

  // Pages where sidebar should be hidden
  const hideSidebarPaths = [
    "/login",
    "/register",
    "/kitchen-home",
    "/admin",
    "/cart",
    "/bill",
    "/menu",
    "/kitchen",
    "/receipt"
  ];

  // This allows dynamic routes like /receipt/123
  const hideSidebar = hideSidebarPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  // Sidebar menu
  const menu = [
    { name: "Bill", path: "/bill" },
    { name: "Customer Dashboard", path: "/customer-dashboard" },
  ];

  // If sidebar should be hidden, just render page
  if (hideSidebar) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-6 shadow-2xl">
        <h2 className="text-3xl font-extrabold mb-12 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          DineTech
        </h2>

        <ul className="space-y-4">
          {menu.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-5 py-3 rounded-xl transition-all duration-300 transform ${
                  location.pathname.startsWith(item.path)
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg scale-105"
                    : "hover:bg-gray-700 hover:scale-105"
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Page content */}
        <div className="p-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[400px] transition-all duration-300">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Layout;
