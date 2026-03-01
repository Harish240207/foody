import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resolveComplaint = async (id) => {
    await axios.post("http://localhost:5000/api/resolve-complaint", {
      complaintId: id
    });
    loadComplaints();
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>📢 User Complaints</h2>

      {complaints.length === 0 && <p>No complaints yet.</p>}

      {complaints.map(c => (
        <div
          key={c._id}
          style={{
            background: "#f5f5f5",
            padding: "20px",
            marginBottom: "15px",
            borderRadius: "10px"
          }}
        >
          <p><strong>Hotel:</strong> {c.hotelName}</p>
          <p><strong>User:</strong> {c.userPhone}</p>
          <p><strong>Reason:</strong> {c.reason}</p>
          <p><strong>Severity:</strong> {c.severity}</p>
          <p><strong>Status:</strong> {c.status}</p>

          {c.status !== "resolved" && (
            <button
              onClick={() => resolveComplaint(c._id)}
              style={{
                background: "green",
                color: "white",
                padding: "8px 15px",
                border: "none",
                borderRadius: "5px"
              }}
            >
              Mark as Resolved
            </button>
          )}
        </div>
      ))}
    </div>
  );
}