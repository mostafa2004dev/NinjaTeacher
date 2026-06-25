import React from "react";
import { useNavigate } from "react-router-dom";

const Button = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/TeacherSurvey");
  };

  return (
    <button
      onClick={handleClick}
      className="bg-gradient-to-r from-purple-500 via-blue-300 to-blue-500 
      hover:from-blue-500 hover:to-purple-600 
      text-white font-bold py-3 px-6 rounded-lg
      shadow-lg transform transition-all duration-500 ease-in-out 
      hover:scale-110 hover:brightness-110 hover:animate-pulse 
      active:animate-bounce"
    >
      Teacher Assessment
    </button>
  );
};

export default Button;