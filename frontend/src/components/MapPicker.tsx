import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface MapPickerProps {
  position: { lat: number; lng: number } | null;
  onPositionChange: (position: { lat: number; lng: number }) => void;
  onAddressChange?: (address: string) => void;
  onDistrictChange?: (district: string) => void;
}

function LocationMarker({ 
  position, 
  onPositionChange, 
  onAddressChange,
  onDistrictChange
}: { 
  position: { lat: number; lng: number } | null;
  onPositionChange: (position: { lat: number; lng: number }) => void;
  onAddressChange?: (address: string) => void;
  onDistrictChange?: (district: string) => void;
}) {
  useMapEvents({
    click(e) {
      const newPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
      onPositionChange(newPosition);
      
      // Reverse geocoding (get address from coordinates)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) {
            // Extract address
            const address = data.display_name || '';
            
            // Extract district from address components
            let district = '';
            if (data.address) {
              // Try different possible fields for district
              district = data.address.district || 
                        data.address.suburb || 
                        data.address.city_district ||
                        data.address.municipality ||
                        data.address.county ||
                        '';
              
              // If district contains "Quận" or "Huyện", use it as is
              // Otherwise, try to extract from display_name
              if (!district) {
                // Try to extract from display_name: look for "Quận X" or "Huyện Y"
                const match = address.match(/Quận\s+(\d+|[A-Za-zÀ-ỹ]+)|Huyện\s+([A-Za-zÀ-ỹ]+)/i);
                if (match) {
                  district = match[0];
                }
              }
            }
            
            // Trigger address update in parent component
            const event = new CustomEvent('addressFound', { 
              detail: { 
                address: address,
                district: district,
                rawData: data
              } 
            });
            window.dispatchEvent(event);
            
            // Call callbacks if provided
            if (onAddressChange) {
              onAddressChange(address);
            }
            if (onDistrictChange && district) {
              onDistrictChange(district);
            }
          }
        })
        .catch(err => console.error('Geocoding error:', err));
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} icon={DefaultIcon} /> : null;
}

const MapPicker = ({ position, onPositionChange, onAddressChange, onDistrictChange }: MapPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Listen for address updates
  useEffect(() => {
    const handleAddressFound = (e: any) => {
      if (e.detail && typeof e.detail === 'object') {
        // New format with address and district
        if (onAddressChange && e.detail.address) {
          onAddressChange(e.detail.address);
        }
        if (onDistrictChange && e.detail.district) {
          onDistrictChange(e.detail.district);
        }
      } else if (typeof e.detail === 'string' && onAddressChange) {
        // Old format (backward compatibility)
        onAddressChange(e.detail);
      }
    };
    window.addEventListener('addressFound', handleAddressFound);
    return () => window.removeEventListener('addressFound', handleAddressFound);
  }, [onAddressChange, onDistrictChange]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      // Geocoding (get coordinates from address)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}, TP.HCM, Vietnam&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name, address } = data[0];
        onPositionChange({ lat: parseFloat(lat), lng: parseFloat(lon) });
        
        // Extract district
        let district = '';
        if (address) {
          district = address.district || 
                    address.suburb || 
                    address.city_district ||
                    address.municipality ||
                    address.county ||
                    '';
          
          // Try to extract from display_name if not found
          if (!district) {
            const match = display_name.match(/Quận\s+(\d+|[A-Za-zÀ-ỹ]+)|Huyện\s+([A-Za-zÀ-ỹ]+)/i);
            if (match) {
              district = match[0];
            }
          }
        }
        
        if (onAddressChange) {
          onAddressChange(display_name);
        }
        if (onDistrictChange && district) {
          onDistrictChange(district);
        }
      } else {
        alert('Không tìm thấy địa chỉ. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Có lỗi xảy ra khi tìm kiếm địa chỉ');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Tìm kiếm địa chỉ (vd: Quận 1, TP.HCM)..."
          className="input flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="btn-primary whitespace-nowrap"
        >
          {searching ? 'Đang tìm...' : 'Tìm kiếm'}
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
        <p className="text-blue-800 dark:text-blue-300">
          💡 <strong>Hướng dẫn:</strong> Click vào bản đồ để chọn vị trí chính xác của phòng trọ, 
          hoặc tìm kiếm địa chỉ ở ô trên.
        </p>
      </div>

      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
        <MapContainer
          center={position ? [position.lat, position.lng] : [10.8231, 106.6297]} // TP.HCM
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            onPositionChange={onPositionChange}
            onAddressChange={onAddressChange}
            onDistrictChange={onDistrictChange}
          />
        </MapContainer>
      </div>

      {/* Selected Position Info */}
      {position && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>📍 Vị trí đã chọn: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</p>
        </div>
      )}
    </div>
  );
};

export default MapPicker;





