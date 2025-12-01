import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polygon, Circle } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';
import { FiMapPin, FiDollarSign } from 'react-icons/fi';
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

// Custom icon cho giá thuê
const createPriceIcon = (color: string) => {
  return divIcon({
    className: 'custom-price-icon',
    html: `<div style="
      width: 20px;
      height: 20px;
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

interface Listing {
  _id: string;
  title: string;
  price: number;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
}

interface MapAnnotation {
  _id: string;
  type: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  data: {
    priceRange?: {
      min: number;
      max: number;
    };
    priceDescription?: string;
    floodLevel?: string;
    floodDescription?: string;
  };
  landlord?: {
    name: string;
  };
}

interface FloodZone {
  h3Index: string;
  polygon: [number, number][];
  center: [number, number];
  maxLevel: 'low' | 'medium' | 'high';
  maxFloodDepth: 'ankle' | 'knee' | 'bike_seat';
  totalTrustScore: number;
  count: number;
}

interface FloodReport {
  _id: string;
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address?: string;
  };
  level: 'low' | 'medium' | 'high';
  floodDepth: 'ankle' | 'knee' | 'bike_seat';
  radius: number;
  description: string;
  images?: string[];
  user?: {
    name: string;
    avatar?: string;
  };
  resolvedVotes?: Array<{ user: { name: string } }>;
}

const MapView = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [annotations, setAnnotations] = useState<MapAnnotation[]>([]);
  const [floodZones, setFloodZones] = useState<FloodZone[]>([]);
  const [floodReports, setFloodReports] = useState<FloodReport[]>([]);
  const [dataLayer, setDataLayer] = useState<'price' | 'flood'>('price');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    roomType: ''
  });

  useEffect(() => {
    fetchListings();
    if (dataLayer === 'price') {
      fetchAnnotations();
    } else if (dataLayer === 'flood') {
      fetchFloodZones();
      fetchFloodReports();
    }
  }, [filters, dataLayer]);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/api/maps/listings?${params.toString()}`);
      setListings(response.data.listings);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    }
  };

  const fetchAnnotations = async () => {
    try {
      const response = await axios.get(`/api/maps/annotations?type=${dataLayer}`);
      // Convert GeoJSON coordinates [lng, lat] to {lat, lng}
      const formattedAnnotations = response.data.annotations.map((ann: any) => {
        const coords = ann.location?.coordinates;
        let lat, lng;
        
        if (coords?.coordinates && Array.isArray(coords.coordinates)) {
          // GeoJSON format: { type: 'Point', coordinates: [lng, lat] }
          [lng, lat] = coords.coordinates;
        } else if (coords?.lat && coords?.lng) {
          // Already in {lat, lng} format
          lat = coords.lat;
          lng = coords.lng;
        } else {
          return null;
        }
        
        return {
          ...ann,
          location: {
            ...ann.location,
            coordinates: { lat, lng }
          }
        };
      }).filter(Boolean);
      
      setAnnotations(formattedAnnotations);
    } catch (error) {
      console.error('Failed to fetch annotations:', error);
    }
  };

  const getPriceColor = (maxPrice: number): string => {
    if (maxPrice < 2000000) return '#22c55e'; // green-500
    if (maxPrice <= 4000000) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  const getPriceLabel = (maxPrice: number): string => {
    if (maxPrice < 2000000) return 'Giá thấp';
    if (maxPrice <= 4000000) return 'Giá trung bình';
    return 'Giá cao';
  };

  const fetchFloodZones = async () => {
    try {
      const response = await axios.get('/api/maps/flood-zones');
      setFloodZones(response.data.zones || []);
    } catch (error) {
      console.error('Failed to fetch flood zones:', error);
    }
  };

  const fetchFloodReports = async () => {
    try {
      const response = await axios.get('/api/maps/flood-reports-clustered');
      // Convert coordinates
      const formattedReports = response.data.reports.map((report: any) => {
        const coords = report.location?.coordinates;
        let lat, lng;
        
        if (coords?.coordinates && Array.isArray(coords.coordinates)) {
          [lng, lat] = coords.coordinates;
        } else if (coords?.lat && coords?.lng) {
          lat = coords.lat;
          lng = coords.lng;
        } else {
          return null;
        }
        
        return {
          ...report,
          location: {
            ...report.location,
            coordinates: { lat, lng }
          }
        };
      }).filter(Boolean);
      
      setFloodReports(formattedReports);
    } catch (error) {
      console.error('Failed to fetch flood reports:', error);
    }
  };

  const getFloodColor = (level: string, depth: string): string => {
    // Xanh đậm: ngập lớn (high/bike_seat)
    if (level === 'high' || depth === 'bike_seat') return '#1e40af'; // blue-800
    // Xanh trung bình: ngập vừa (medium/knee)
    if (level === 'medium' || depth === 'knee') return '#3b82f6'; // blue-600
    // Xanh nhạt: ngập nhẹ (low/ankle)
    return '#60a5fa'; // blue-400
  };

  const getFloodOpacity = (level: string): number => {
    if (level === 'high') return 0.6;
    if (level === 'medium') return 0.4;
    return 0.3;
  };

  const handleResolveFlood = async (reportId: string) => {
    try {
      await axios.post(`/api/maps/flood-reports/${reportId}/resolve`);
      toast.success('Đã xác nhận nước đã rút');
      fetchFloodZones();
      fetchFloodReports();
    } catch (error) {
      console.error('Failed to resolve flood:', error);
      toast.error('Không thể xác nhận');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const [showFloodReportModal, setShowFloodReportModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      {/* Button báo cáo ngập lụt - chỉ hiện khi chọn lớp flood */}
      {dataLayer === 'flood' && (
        <button
          onClick={() => setShowFloodReportModal(true)}
          className="absolute top-4 right-4 z-[1000] bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <span>🌊</span>
          <span>Báo ngập lụt</span>
        </button>
      )}
      
      {/* Filters Sidebar */}
      <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-80">
        <h2 className="text-xl font-bold mb-4">Bộ lọc</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lớp dữ liệu</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDataLayer('price')}
                className={`p-2 rounded text-sm ${
                  dataLayer === 'price'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                💰 Giá thuê
              </button>
              <button
                onClick={() => setDataLayer('flood')}
                className={`p-2 rounded text-sm ${
                  dataLayer === 'flood'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                🌊 Ngập lụt
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Khoảng giá</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Tối thiểu"
                className="input text-sm"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <input
                type="number"
                placeholder="Tối đa"
                className="input text-sm"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Loại phòng</label>
            <select
              className="input text-sm"
              value={filters.roomType}
              onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
            >
              <option value="">Tất cả</option>
              <option value="single">Phòng đơn</option>
              <option value="shared">Phòng ghép</option>
              <option value="apartment">Căn hộ</option>
              <option value="house">Nhà nguyên căn</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-bold mb-2">Chú thích</h3>
          {dataLayer === 'price' && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2 border-2 border-white shadow-sm"></div>
                <span>Giá thấp (&lt; 2tr)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2 border-2 border-white shadow-sm"></div>
                <span>Giá trung bình (2-4tr)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2 border-2 border-white shadow-sm"></div>
                <span>Giá cao (&gt; 4tr)</span>
              </div>
            </div>
          )}
          {dataLayer === 'flood' && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-400 rounded-full mr-2 border-2 border-white"></div>
                <span>Ngập nhẹ (Mắt cá)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-600 rounded-full mr-2 border-2 border-white"></div>
                <span>Ngập vừa (Đầu gối)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-800 rounded-full mr-2 border-2 border-white"></div>
                <span>Ngập nặng (Yên xe)</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500">Vùng lục giác: ≥3 reports trong 30 phút</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[10.8231, 106.6297]} // TP.HCM coordinates
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Zoom controls - di chuyển sang bên phải, tránh che khung bộ lọc */}
        <ZoomControl position="topright" />
        
        {/* Hiển thị annotations (chú thích) khi chọn lớp dữ liệu */}
        {dataLayer === 'price' && annotations
          .filter(ann => ann.type === 'price' && ann.data.priceRange)
          .map((annotation) => {
            const maxPrice = annotation.data.priceRange?.max || 0;
            const color = getPriceColor(maxPrice);
            const label = getPriceLabel(maxPrice);
            
            return annotation.location.coordinates && (
              <Marker
                key={`annotation-${annotation._id}`}
                position={[annotation.location.coordinates.lat, annotation.location.coordinates.lng]}
                icon={createPriceIcon(color)}
              >
                <Popup>
                  <div className="w-64">
                    <h3 className="font-bold text-sm mb-1">💰 Chú thích giá thuê</h3>
                    {annotation.data.priceRange && (
                      <p className="text-primary-600 font-bold mb-1">
                        {formatPrice(annotation.data.priceRange.min)} - {formatPrice(annotation.data.priceRange.max)}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mb-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        maxPrice < 2000000 ? 'bg-green-100 text-green-800' :
                        maxPrice <= 4000000 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {label}
                      </span>
                    </p>
                    {annotation.data.priceDescription && (
                      <p className="text-xs text-gray-600 mt-1">{annotation.data.priceDescription}</p>
                    )}
                    {annotation.location.address && (
                      <p className="text-xs text-gray-500 mt-1">{annotation.location.address}</p>
                    )}
                    {annotation.landlord && (
                      <p className="text-xs text-gray-400 mt-1">Bởi: {annotation.landlord.name}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        
        {/* Hiển thị vùng ngập lụt - Hexagon Grid */}
        {dataLayer === 'flood' && floodZones.map((zone) => {
          const color = getFloodColor(zone.maxLevel, zone.maxFloodDepth);
          const opacity = getFloodOpacity(zone.maxLevel);
          const depthLabels: Record<string, string> = {
            ankle: 'Mắt cá',
            knee: 'Đầu gối',
            bike_seat: 'Yên xe'
          };
          
          return (
            <Polygon
              key={`zone-${zone.h3Index}`}
              positions={zone.polygon.map(([lng, lat]) => [lat, lng])}
              pathOptions={{
                fillColor: color,
                fillOpacity: opacity,
                color: color,
                weight: 2,
                opacity: 0.8
              }}
            >
              <Popup>
                <div className="w-64">
                  <h3 className="font-bold text-sm mb-1">🌊 Vùng ngập lụt</h3>
                  <p className="text-xs mb-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      zone.maxLevel === 'high' ? 'bg-blue-800 text-blue-100' :
                      zone.maxLevel === 'medium' ? 'bg-blue-600 text-blue-100' :
                      'bg-blue-400 text-blue-50'
                    }`}>
                      Mức độ: {zone.maxLevel === 'high' ? 'Cao' : zone.maxLevel === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 mb-1">
                    Độ sâu: {depthLabels[zone.maxFloodDepth] || zone.maxFloodDepth}
                  </p>
                  <p className="text-xs text-gray-500">
                    {zone.count} báo cáo • Trust score: {zone.totalTrustScore.toFixed(1)}
                  </p>
                </div>
              </Popup>
            </Polygon>
          );
        })}
        
        {/* Hiển thị flood reports - Radius Clustering */}
        {dataLayer === 'flood' && floodReports.map((report) => {
          if (!report.location.coordinates) return null;
          
          const color = getFloodColor(report.level, report.floodDepth);
          const opacity = getFloodOpacity(report.level);
          const depthLabels: Record<string, string> = {
            ankle: 'Mắt cá',
            knee: 'Đầu gối',
            bike_seat: 'Yên xe'
          };
          
          return (
            <Circle
              key={`report-${report._id}`}
              center={[report.location.coordinates.lat, report.location.coordinates.lng]}
              radius={report.radius || 100}
              pathOptions={{
                fillColor: color,
                fillOpacity: opacity * 0.3,
                color: color,
                weight: 2,
                opacity: opacity
              }}
            >
              <Popup>
                <div className="w-64">
                  <h3 className="font-bold text-sm mb-1">🌊 Báo cáo ngập lụt</h3>
                  {report.images && report.images[0] && (
                    <img
                      src={report.images[0]}
                      alt="Flood report"
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <p className="text-xs mb-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      report.level === 'high' ? 'bg-blue-800 text-blue-100' :
                      report.level === 'medium' ? 'bg-blue-600 text-blue-100' :
                      'bg-blue-400 text-blue-50'
                    }`}>
                      {report.level === 'high' ? 'Cao' : report.level === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                    <span className="ml-2 text-gray-600">
                      {depthLabels[report.floodDepth] || report.floodDepth}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 mb-2">{report.description}</p>
                  {report.location.address && (
                    <p className="text-xs text-gray-500 mb-2">{report.location.address}</p>
                  )}
                  {report.user && (
                    <p className="text-xs text-gray-400 mb-2">Bởi: {report.user.name}</p>
                  )}
                  {report.resolvedVotes && report.resolvedVotes.length > 0 && (
                    <p className="text-xs text-green-600 mb-2">
                      {report.resolvedVotes.length} người xác nhận đã rút
                    </p>
                  )}
                  <button
                    onClick={() => handleResolveFlood(report._id)}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded"
                  >
                    ✓ Xác nhận đã rút nước
                  </button>
                </div>
              </Popup>
            </Circle>
          );
        })}
        
        {/* Hiển thị listings (phòng trọ) - tô màu theo giá */}
        {listings.map((listing) => {
          if (!listing.location.coordinates) return null;
          
          // Lấy màu dựa trên giá của listing
          const priceColor = getPriceColor(listing.price);
          const priceLabel = getPriceLabel(listing.price);
          
          return (
            <Marker
              key={listing._id}
              position={[listing.location.coordinates.lat, listing.location.coordinates.lng]}
              icon={createPriceIcon(priceColor)}
            >
              <Popup>
                <div className="w-64">
                  {listing.images[0] && (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-bold text-sm mb-1">{listing.title}</h3>
                  <p className="text-primary-600 font-bold mb-1">{formatPrice(listing.price)}/tháng</p>
                  <p className="text-xs mb-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      listing.price < 2000000 ? 'bg-green-100 text-green-800' :
                      listing.price <= 4000000 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {priceLabel}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{listing.location.address}</p>
                  <a
                    href={`/listings/${listing._id}`}
                    className="block mt-2 text-xs text-primary-600 hover:underline"
                  >
                    Xem chi tiết →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Custom CSS để đảm bảo zoom controls không bị che */}
      <style>{`
        .leaflet-control-zoom {
          margin-top: 4rem !important;
          margin-right: 0.5rem !important;
        }
      `}</style>
      
      {/* Modal báo cáo ngập lụt */}
      {showFloodReportModal && (
        <FloodReportModal
          onClose={() => setShowFloodReportModal(false)}
          onSuccess={() => {
            setShowFloodReportModal(false);
            fetchFloodZones();
            fetchFloodReports();
          }}
        />
      )}
    </div>
  );
};

// Component Modal báo cáo ngập lụt
interface FloodReportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const FloodReportModal = ({ onClose, onSuccess }: FloodReportModalProps) => {
  const [formData, setFormData] = useState({
    level: 'medium' as 'low' | 'medium' | 'high',
    floodDepth: 'knee' as 'ankle' | 'knee' | 'bike_seat',
    description: '',
    address: '',
    coordinates: null as { lat: number; lng: number } | null
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Lấy vị trí hiện tại của user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.coordinates) {
      toast.error('Vui lòng cho phép truy cập vị trí');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('level', formData.level);
      formDataToSend.append('floodDepth', formData.floodDepth);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location[coordinates][lat]', formData.coordinates.lat.toString());
      formDataToSend.append('location[coordinates][lng]', formData.coordinates.lng.toString());
      if (formData.address) {
        formDataToSend.append('location[address]', formData.address);
      }
      formDataToSend.append('radius', '100');
      
      if (selectedFile) {
        formDataToSend.append('images', selectedFile);
      }

      await axios.post('/api/maps/flood-reports', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Đã báo cáo ngập lụt thành công!');
      onSuccess();
    } catch (error: any) {
      console.error('Failed to submit flood report:', error);
      const errorMessage = getErrorMessage(error, 'Không thể gửi báo cáo');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const depthLabels = {
    ankle: 'Mắt cá chân (5-10cm)',
    knee: 'Đầu gối (30-50cm)',
    bike_seat: 'Yên xe máy (50-80cm)'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🌊 Báo cáo ngập lụt</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mức độ ngập *</label>
              <select
                className="input"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                required
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Độ sâu ngập *</label>
              <select
                className="input"
                value={formData.floodDepth}
                onChange={(e) => setFormData({ ...formData, floodDepth: e.target.value as any })}
                required
              >
                <option value="ankle">{depthLabels.ankle}</option>
                <option value="knee">{depthLabels.knee}</option>
                <option value="bike_seat">{depthLabels.bike_seat}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mô tả *</label>
              <textarea
                className="input"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả tình trạng ngập lụt..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Địa chỉ</label>
              <input
                type="text"
                className="input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Nhập địa chỉ (tùy chọn)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hình ảnh (khuyến khích)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="input"
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mt-2 w-full h-48 object-cover rounded"
                />
              )}
            </div>

            {formData.coordinates && (
              <div className="text-xs text-gray-500">
                📍 Vị trí: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MapView;

