import React from "react";

function CustomerInsightsTab({ frequentCustomers, customerSegments }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="p-4 bg-white shadow rounded">
        <h2 className="font-bold mb-2">Frequent Customers</h2>
        <ul>
          {frequentCustomers.map((c, idx) => (
            <li key={idx}>
              {c.customerName} - {c.orders} orders
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 bg-white shadow rounded">
        <h2 className="font-bold mb-2">Customer Segments</h2>
        <ul>
          {customerSegments.map((s, idx) => (
            <li key={idx}>
              {s.segment} - {s.count} customers
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CustomerInsightsTab;
