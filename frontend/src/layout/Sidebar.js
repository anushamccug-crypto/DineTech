import React from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Menu", path: "/menu" },
    { name: "Bill", path: "/bill" },
    { name: "Customer Dashboard", path: "/customer-dashboard" },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white fixed">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        DineTech
      </div>

      <ul className="mt-6 space-y-2">
        {menu.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`block px-6 py-3 rounded-lg transition ${
                location.pathname.startsWith(item.path)
                  ? "bg-blue-600"
                  : "hover:bg-gray-700"
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;