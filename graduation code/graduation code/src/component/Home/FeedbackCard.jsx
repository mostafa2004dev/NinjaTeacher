import { Trash2, Pencil } from "lucide-react";

function FeedbackCard({ data, onDelete, onEdit }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow relative flex flex-col gap-2">

      {/* Top row: image + name + location */}
      <div className="flex items-center gap-3">
        {data.image && (
          <img
            src={data.image}
            alt="school"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div>
          <h3 className="font-bold text-lg leading-tight">{data.name}</h3>
          <p className="text-gray-500 text-sm">{data.location}</p>
        </div>

        {/* Action buttons top right */}
        <div className="flex gap-2 ml-auto">
          <button onClick={onEdit} className="text-blue-400 hover:text-blue-600 transition">
            <Pencil size={16} />
          </button>
          
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>{star <= data.rating ? "⭐" : "☆"}</span>
        ))}
      </div>

      {/* Feedback text */}
      <p className="text-gray-700 text-sm">{data.text}</p>

      {/* Teachers hired */}
      <p className="text-sm">
        <span className="inline-block bg-gradient-to-r from-purple-500 via-blue-500 to-blue-600 text-white px-3 py-1 rounded-lg">
          Teachers hired: {data.teachers}
        </span>
      </p>
      <div className="flex gap-2 ml-auto" >
        {/* Time */}
        <p className="text-xs text-gray-400">{data.time}</p>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600 transition">
          <Trash2 size={16} />
        </button>
      </div>

    </div >
  );
}

export default FeedbackCard;