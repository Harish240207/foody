import { useState } from "react";
import axios from "axios";

export default function ReviewPopup({ food, userPhone, onClose }) {

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const submitReview = async () => {
    try {
      await axios.post("http://localhost:5000/api/add-review", {
        foodId: food._id,
        userPhone,
        rating,
        review
      });

      alert("Thanks for rating! ⭐");
      onClose();

    } catch (err) {
      alert("Error saving review");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

      <div className="bg-white p-6 rounded-xl w-96">

        <h2 className="text-xl font-bold mb-3">
          Rate your food 🍱
        </h2>

        {/* STARS */}
        <div className="flex gap-2 mb-4 text-2xl">
          {[1,2,3,4,5].map(n => (
            <span
              key={n}
              onClick={()=>setRating(n)}
              className={n <= rating ? "text-yellow-400 cursor-pointer" : "text-gray-300 cursor-pointer"}
            >
              ★
            </span>
          ))}
        </div>

        {/* REVIEW */}
        <textarea
          placeholder="Write review..."
          className="border p-2 w-full mb-3"
          value={review}
          onChange={e=>setReview(e.target.value)}
        />

        <button
          onClick={submitReview}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          Submit Review
        </button>

      </div>
    </div>
  );
}