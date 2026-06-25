import React from 'react';

const Card = () => {
  return (
    <div className="relative w-80">

      {/* 🔥 Gradient Reflection */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 rounded-lg blur-2xl opacity-40"></div>

      {/* 💳 Card نفسها (من غير تغيير المحتوى) */}
      <div className="relative w-80 p-4 bg-white rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300 ease-in-out">

        <img className="w-full h-40 object-cover rounded-t-lg" alt="Card Image" src="https://via.placeholder.com/150" />

        <div className="p-4">
          <h2 className="text-xl font-semibold">Beautiful Card</h2>

          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis ante sit amet tellus ornare tincidunt.
          </p>

          <div className="flex justify-between items-center mt-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400">
              Learn More
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Card;