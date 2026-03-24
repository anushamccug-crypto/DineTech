import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ✅ DYNAMIC URL: Works on both Localhost and Vercel
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app";

function Receipt() {
  const { billId } = useParams();
  const [bill, setBill] = useState(null);
  const receiptRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBill = async () => {
      try {
        // ✅ Using dynamic API_BASE_URL
        const res = await axios.get(`${API_BASE_URL}/api/orders/${billId}`);
        setBill(res.data);

        localStorage.setItem("latestBill", JSON.stringify({
          ...res.data,
          orderId: res.data._id
        }));

        // Navigate back after 8 seconds
        setTimeout(() => {
          navigate("/customer-dashboard");
        }, 8000);

      } catch (error) {
        console.error("Failed to fetch bill", error);
      }
    };
    if (billId) fetchBill();
  }, [billId, navigate]);

  const downloadPDF = async () => {
    const input = receiptRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`DineTech-Invoice-${bill._id.slice(-6)}.pdf`);
  };

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F2] text-[#5D534A] font-serif italic">
        <div className="animate-pulse">Loading digital receipt...</div>
      </div>
    );
  }

  const subtotal = bill.totalAmount;
  const gstRate = 5;
  const gstAmount = (subtotal * gstRate) / 100;
  const grandTotal = subtotal + gstAmount;

  // Use optional chaining to safely check payment method
  const isCash = bill.method === "CASH" || bill.payment?.method === "CASH";
  const statusText = isCash ? "PAYMENT PENDING AT COUNTER" : "PAYMENT SUCCESSFUL";
  const statusColor = isCash ? "#D4A373" : "#2D6A4F";

  return (
    <div className="min-h-screen bg-[#FDF8F2] py-10 px-4 flex flex-col items-center relative overflow-hidden font-sans">
      
      {/* AMBIENT BACKGROUND */}
      <div className="absolute top-[-10%] left-[-5%] w-[70%] h-[50%] bg-[#E6F3EF] rounded-full blur-[120px] opacity-40 z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[50%] bg-[#FFF0F0] rounded-full blur-[120px] opacity-40 z-0"></div>

      {/* RECEIPT CARD */}
      <div 
        ref={receiptRef} 
        className="relative z-10 w-full max-w-xl bg-white p-8 md:p-12 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-[3px] border-[#5D534A] text-[#5D534A]"
      >
        {/* LOGO & HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif italic font-bold tracking-tighter mb-1">DineTech</h1>
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#D4A373] font-black">Digital Invoice</p>
          <div className="mt-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            <p>GSTIN: 29ABCDE1234F1Z5</p>
            <p>123 Food Street, Bangalore, India</p>
          </div>
        </div>

        <div className="border-t border-dashed border-[#F1E9E0] my-6"></div>

        {/* INFO GRID */}
        <div className="grid grid-cols-2 gap-4 text-[11px] font-bold uppercase tracking-tight">
          <div className="space-y-2">
            <p><span className="text-gray-400">Invoice:</span> DT-{bill._id.slice(-6)}</p>
            <p><span className="text-gray-400">Guest:</span> {bill.customerName}</p>
            <p><span className="text-gray-400">Table:</span> {bill.tableNumber || "N/A"}</p>
          </div>
          <div className="space-y-2 text-right">
            <p><span className="text-gray-400">Date:</span> {new Date(bill.createdAt).toLocaleDateString()}</p>
            <p><span className="text-gray-400">Time:</span> {new Date(bill.createdAt).toLocaleTimeString()}</p>
            <p><span className="text-gray-400">Method:</span> {bill.method || bill.payment?.method}</p>
          </div>
        </div>

        <div className="border-t border-dashed border-[#F1E9E0] my-6"></div>

        {/* ITEMS TABLE */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-[#F1E9E0]">
              <th className="text-left py-2 font-black">Item</th>
              <th className="text-center py-2 font-black">Qty</th>
              <th className="text-right py-2 font-black">Amount</th>
            </tr>
          </thead>
          <tbody className="font-serif italic text-lg">
            {bill.items.map((item) => (
              <tr key={item._id} className="border-b border-[#FAF7F2]">
                <td className="py-3 text-[#4A423B]">{item.name}</td>
                <td className="text-center text-[#D4A373] font-sans font-bold text-sm">{item.quantity}</td>
                <td className="text-right text-[#5D534A]">₹{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS */}
        <div className="flex flex-col items-end space-y-2 mb-8">
          <div className="flex justify-between w-40 text-[11px] font-bold text-gray-400">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-40 text-[11px] font-bold text-gray-400">
            <span>GST ({gstRate}%)</span>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-full pt-4 border-t border-[#F1E9E0]">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] self-center">Grand Total</span>
             <span className="text-4xl font-serif italic font-bold">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* STATUS BOX */}
        <div 
          className="text-center p-4 rounded-2xl border-2 mb-8"
          style={{ borderColor: statusColor, backgroundColor: `${statusColor}08` }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: statusColor }}>
            {statusText}
          </p>
          {isCash && (
            <p className="text-[9px] mt-2 text-gray-400 uppercase font-bold leading-relaxed">
              Kindly settle your bill at the counter.<br/>Present this digital invoice for validation.
            </p>
          )}
        </div>

        <div className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          <p>Thank you for choosing DineTech</p>
          <p className="mt-4 opacity-30 italic">-------------------------</p>
          <p className="mt-2">Authorized Signature</p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="relative z-10 mt-8 flex gap-4">
        <button 
          onClick={() => window.print()} 
          className="px-8 py-4 bg-[#5D534A] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#4A423B] transition-all shadow-xl active:scale-95"
        >
          Print Receipt
        </button>
        <button 
          onClick={downloadPDF} 
          className="px-8 py-4 bg-[#D4A373] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#5D534A] transition-all shadow-xl active:scale-95"
        >
          Download PDF
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
        @media print {
          button { display: none; }
          .min-h-screen { padding: 0; background: white; }
          .shadow-[0_20px_50px_rgba(0,0,0,0.05)] { box-shadow: none; }
        }
      `}</style>
    </div>
  );
}

export default Receipt;