import { useState } from "react";
import axios from "axios";

export default function HotelRegister() {

  const [form, setForm] = useState({
    hotelName: "",
    ownerName: "",
    phone: "",
    address: ""
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/hotel-register", form);
      alert("Hotel Registered Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Register Hotel/Caterer
        </h2>

        <input name="hotelName" placeholder="Hotel Name"
          onChange={handleChange}
          className="border p-3 w-full mb-3" />

        <input name="ownerName" placeholder="Owner Name"
          onChange={handleChange}
          className="border p-3 w-full mb-3" />

        <input name="phone" placeholder="Phone Number"
          onChange={handleChange}
          className="border p-3 w-full mb-3" />

        <input name="address" placeholder="Address"
          onChange={handleChange}
          className="border p-3 w-full mb-3" />

        <button 
          onClick={handleSubmit}
          className="bg-green-500 text-white w-full py-3 rounded mt-4"
        >
          Register
        </button>

      </div>
    </div>
  );
}