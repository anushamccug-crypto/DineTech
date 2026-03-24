import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ Dynamic URL logic
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app";

function KitchenSection() {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    // ✅ FIXED: Added backticks (``) around the dynamic URL to fix the syntax error
    axios.get(`${API_BASE_URL}/api/admin/kitchen-updates`)
      .then(res => setUpdates(res.data))
      .catch(err => console.error("Error fetching kitchen updates:", err));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#5D534A]">
          Kitchen Updates
        </h2>
        <span className="text-xs font-bold uppercase tracking-widest text-[#D4A373]">
          Live Feed
        </span>
      </div>

      <div className="grid gap-4">
        {updates.length > 0 ? (
          updates.map((u) => (
            <div
              key={u._id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-[#5D534A]/5 transform transition-all hover:scale-[1.01]"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-[#5D534A] flex items-center gap-2">
                  <span className="text-[#D4A373]">●</span> {u.ingredient}
                </h3>
                <small className="text-[#5D534A]/40 font-medium">
                  {new Date(u.createdAt).toLocaleString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short'
                  })}
                </small>
              </div>

              <p className="text-[#5D534A]/80 leading-relaxed">
                {u.message}
              </p>
              
              <div className="mt-4 pt-4 border-t border-[#FDF8F2] flex justify-end">
                <button className="text-xs font-bold uppercase tracking-tighter text-[#D4A373] hover:text-[#5D534A] transition-colors">
                  Acknowledge
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-[#5D534A]/10">
            <p className="text-[#5D534A]/40 font-medium">No current kitchen updates</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default KitchenSection;