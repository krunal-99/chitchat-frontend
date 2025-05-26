import React from "react";

interface InputProps {
  name: string;
  error: string | undefined;
}

const Input: React.FC<InputProps> = ({ name, error }) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        autoComplete={name}
        className={`mt-1 block w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border ${
          error ? "border-red-500" : "border-slate-300 dark:border-slate-600"
        } rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-900 dark:text-white`}
        placeholder={`Enter your ${name}`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
