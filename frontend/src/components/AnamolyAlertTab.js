import React from "react";

function AnomalyAlertsTab({ data }) {
  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="font-bold mb-2">Anomaly Alerts</h2>
      <ul>
        {data.map((alert, idx) => (
          <li key={idx} className="text-red-600">
            {alert.type}: {alert.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AnomalyAlertsTab;
