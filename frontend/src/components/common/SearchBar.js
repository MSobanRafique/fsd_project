// Search Bar Component
// Professional search input with icon
// Person 1 - Frontend Developer

import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = 'Search...', onClear }) => {
  return (
    <div className="search-bar">
      <FiSearch className="search-icon" />
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className="search-clear" onClick={() => {
          onChange('');
          if (onClear) onClear();
        }} aria-label="Clear search">
          <FiX />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

