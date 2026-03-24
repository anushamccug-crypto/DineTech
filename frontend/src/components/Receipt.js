import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Receipt() {
  const { billId } = useParams();
  const [bill, setBill] = useState(null);
  const receiptRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBill = async () => {
      try {
        // ✅ DYNAMIC URL: Works on both Localhost and Vercel
        const API_BASE_URL = window.location.hostname === "localhost" 
          ? "http://localhost:5000" 
          : "https://dine-tech-iyqs.vercel.app";

        const res = await axios.get(`${API_BASE_URL}/api/orders/${billId}`);
        setBill(res.data);

        localStorage.setItem("latestBill", JSON.stringify({
          ...res.data,
          orderId: res.data._id
        }));

        // ✅ RETAINED: Automatic redirect to dashboard after 5 seconds
        setTimeout(() => {
          navigate("/customer-dashboard");
        }, 5000);

      } catch (error) {
        console.error("Failed to fetch bill", error);
      }
    };

    if (billId) {
      fetchBill();
    }
  }, [billId, navigate]);

  const downloadPDF = async () => {
    const input = receiptRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`DineTech-Invoice-${bill._id}.pdf`);
  };

  if (!bill) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)",
          color: "white",
          fontSize: "20px"
        }}
      >
        Loading receipt...
      </div>
    );
  }

  const subtotal = bill.totalAmount || 0;
  const gstRate = 5;
  const gstAmount = (subtotal * gstRate) / 100;
  const grandTotal = subtotal + gstAmount;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
        fontFamily: "Courier New, monospace",
        background: "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)"
      }}
    >
      <div
        ref={receiptRef}
        style={{
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid #ddd",
          background: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          maxWidth: "750px",
          width: "100%"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0 }}>DineTech</h1>
          <p style={{ margin: 0 }}>GSTIN: 29ABCDE1234F1Z5</p>
          <p style={{ margin: 0 }}>123 Food Street, Bangalore, India</p>
          <p style={{ margin: 0 }}>Phone: +91 98765 43210</p>
        </div>

        <hr />

        <div style={{ fontSize: "14px" }}>
          <p><strong>Invoice No:</strong> DT-{bill._id.slice(-6)}</p>
          <p><strong>Order ID:</strong> {bill._id}</p>
          <p><strong>Date:</strong> {new Date(bill.createdAt).toLocaleString()}</p>
          <p><strong>Customer:</strong> {bill.customerName}</p>
          <p><strong>Payment Method:</strong> {bill.method || "N/A"}</p>
        </div>

        <hr />

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Item</th>
              <th style={{ textAlign: "center" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Rate</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items && bill.items.map((item) => (
              <tr key={item._id || item.dishId}>
                <td>{item.name}</td>
                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                <td style={{ textAlign: "right" }}>₹ {item.price}</td>
                <td style={{ textAlign: "right" }}>₹ {item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr />

        <div style={{ textAlign: "right", fontSize: "14px" }}>
          <p>Subtotal: ₹ {subtotal.toFixed(2)}</p>
          <p>GST ({gstRate}%): ₹ {gstAmount.toFixed(2)}</p>
          <h3>Grand Total: ₹ {grandTotal.toFixed(2)}</h3>
        </div>

        <hr />

        <div style={{ fontSize: "14px" }}>
          <p>
            <strong>Status:</strong>{" "}
            <span style={{ fontWeight: "bold", color: "green" }}>
              PAID
            </span>
          </p>
        </div>

        <hr />

        <div style={{ textAlign: "center", fontSize: "13px" }}>
          <p>Thank you for dining with DineTech!</p>
          <p>This is a computer-generated invoice.</p>
          <br />
          <p>Authorized Signature</p>
        </div>
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          justifyContent: "center"
        }}
      >
        <button
          onClick={() => window.print()}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(90deg,#7c3aed,#ec4899)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Print
        </button>

        <button
          onClick={downloadPDF}
          style={{
            padding: "10px 20px",
            background: "green",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default Receipt;