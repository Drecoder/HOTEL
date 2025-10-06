import React from "react";
import type { ChangeEventHandler } from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options?: Option[];
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options = [],
  className = "",
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
