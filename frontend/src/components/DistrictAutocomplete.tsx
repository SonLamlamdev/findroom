import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiMapPin } from 'react-icons/fi';

interface DistrictAutocompleteProps {
  value: string;
  onChange: (district: string) => void;
  placeholder?: string;
  className?: string;
}

const DistrictAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Nhập quận/huyện...",
  className = "input"
}: DistrictAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value.length >= 2) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value]);

  const fetchSuggestions = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/maps/districts?query=${encodeURIComponent(query)}`);
      setSuggestions(response.data.districts || []);
      setShowSuggestions(response.data.districts.length > 0);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (district: string) => {
    onChange(district);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={`${className} pl-10`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((district, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(district)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FiMapPin size={16} className="text-gray-400" />
              <span>{district}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DistrictAutocomplete;

