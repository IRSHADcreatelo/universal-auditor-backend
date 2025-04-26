import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import inputFields from "../../config/inputFields.js";
import { toast } from 'react-hot-toast';

const AuditForm = ({ onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    const inputString = Object.values(data).join(',');
    // Open result page in a new tab
    window.open(`http://localhost:5000/api/input?input=${encodeURIComponent(inputString)}`, '_blank');

    setLoading(false);
    toast('Form submitted successfully');
    onClose();
  };

  return (
    <>
      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center">
          <div className="h-12 w-12 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-cyan-200 mt-4 text-lg font-semibold">Generating Audit Result...</p>
        </div>
      )}

      <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-40 px-4 sm:px-6">
        <div className="relative w-full max-w-md p-4 sm:p-6 rounded-2xl bg-[#07071f] backdrop-blur-3xl shadow-lg">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:right-5 text-white text-xl sm:text-2xl hover:text-pink-500 transition"
          >
            &times;
          </button>

          <div className="flex flex-col items-center justify-center text-white font-sans">
            <h1 className="text-3xl sm:text-4xl font-bold text-cyan-400 drop-shadow-[0_0_35px_rgba(0,255,255,0.7)]">
              CREATE<span className="text-pink-500">LO</span>
            </h1>
            <h2 className="text-lg sm:text-xl text-[#367df8] mt-1 drop-shadow-[0_0_8px_#0ff]">User Input Form</h2>
            <h3 className="text-2xl sm:text-3xl font-semibold mb-2 drop-shadow-[0_0_8px_#0ff]">AI Audit Entry</h3>

            <div className="w-full p-[2px] rounded-2xl bg-[conic-gradient(at_top_left,_cyan,_blue,_pink,_purple)] border border-[#ffffff80] shadow-[0_0_18px_rgba(0,255,255,0.25),inset_0_0_10px_rgba(255,0,255,1)] overflow-hidden">
              <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-[#07071f] px-4 sm:px-6 py-3 rounded-2xl max-h-[400px] overflow-y-auto custom-scrollbar">
                {inputFields.map(({ name, placeholder, icon: Icon, type, validation }) => (
                  <div key={name} className="flex flex-col bg-[#0f172a] border border-[#121960] rounded-lg px-3 py-2 my-3 shadow-sm focus-within:ring-1 focus-within:ring-cyan-400">
                    {errors[name] && (
                      <p className="text-red-500 text-xs mb-1">{errors[name]?.message}</p>
                    )}
                    <div className="flex items-center">
                      <Icon className="mr-3 text-cyan-400 text-lg sm:text-xl" />
                      <input
                        type={type}
                        {...register(name, validation)}
                        placeholder={placeholder}
                        className="bg-transparent outline-none text-white placeholder-gray-400 flex-1 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="w-[70%] sm:w-[50%] mt-3 py-2 bg-gradient-to-r from-[#4822dd] via-[#8222c2] to-[#ff299c]
                    text-white text-sm sm:text-base rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-pink-100/10 transition-all shadow-neon"
                  >
                    Run Free Audit
                  </button>
                </div>
              </form>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 mt-4">
              Powered by <span className="text-white">Gemini + Meta AI</span> | Delivered by <span className="text-white">Createlo</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuditForm;
