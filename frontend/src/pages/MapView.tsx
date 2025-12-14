import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polygon, Circle } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';
// import { FiMapPin, FiDollarSign } from 'react-icons/fi'; // Unused in original
import { getImageUrl } from '../utils/imageHelper';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next'; // Import Translation Hook

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
  status?: 'active' | 'resolved';
  user?: {
    name: string;
    avatar?: string;
  };
  resolvedVotes?: Array<{ user: { name: string } }>;
}

const MapView = () => {
  const { t } = useTranslation(); // Initialize Hook
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
      const formattedAnnotations = response.data.annotations.map((ann: any) => {
        const coords = ann.location?.coordinates;
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
    if (maxPrice < 2000000) return '#22c55e';
    if (maxPrice <= 4000000) return '#eab308';
    return '#ef4444';
  };

  const getPriceLabel = (maxPrice: number): string => {
    if (maxPrice < 2000000) return t('map.legend.lowPrice');
    if (maxPrice <= 4000000) return t('map.legend.medPrice');
    return t('map.legend.highPrice');
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
      const now = new Date();
      
      const formattedReports = response.data.reports
        .filter((report: any) => {
          if (report.expiresAt) {
            const expiresAt = new Date(report.expiresAt);
            if (expiresAt <= now) return false;
          }
          return true;
        })
        .map((report: any) => {
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
        })
        .filter(Boolean);
      
      setFloodReports(formattedReports);
    } catch (error) {
      console.error('Failed to fetch flood reports:', error);
    }
  };

  const getFloodColor = (level: string, depth: string): string => {
    if (level === 'high' || depth === 'bike_seat') return '#1e40af';
    if (level === 'medium' || depth === 'knee') return '#3b82f6';
    return '#60a5fa';
  };

  const getFloodOpacity = (level: string): number => {
    if (level === 'high') return 0.6;
    if (level === 'medium') return 0.4;
    return 0.3;
  };

  const handleResolveFlood = async (reportId: string) => {
    try {
      const response = await axios.post(`/api/maps/flood-reports/${reportId}/resolve`);
      const updatedReport = response.data.report;
      
      const coords = updatedReport.location?.coordinates;
      let lat, lng;
      
      if (coords?.coordinates && Array.isArray(coords.coordinates)) {
        [lng, lat] = coords.coordinates;
      } else if (coords?.lat && coords?.lng) {
        lat = coords.lat;
        lng = coords.lng;
      } else {
        const existingReport = floodReports.find(r => r._id === reportId);
        if (existingReport?.location?.coordinates) {
          lat = existingReport.location.coordinates.lat;
          lng = existingReport.location.coordinates.lng;
        } else {
          toast.error(t('common.error'));
          return;
        }
      }
      
      const formattedReport = {
        ...updatedReport,
        location: {
          ...updatedReport.location,
          coordinates: { lat, lng }
        }
      };
      
      if (formattedReport.status === 'resolved') {
        setFloodReports(prevReports => 
          prevReports.filter(report => report._id !== reportId)
        );
        toast.success(t('common.success'));
      } else {
        setFloodReports(prevReports =>
          prevReports.map(report =>
            report._id === reportId ? formattedReport : report
          )
        );
        toast.success(t('common.success'));
      }
      
      fetchFloodZones();
      fetchFloodReports();
    } catch (error) {
      console.error('Failed to resolve flood:', error);
      toast.error(t('common.error'));
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

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      {/* Button báo cáo ngập lụt */}
      {dataLayer === 'flood' && (
        <button
          onClick={() => setShowFloodReportModal(true)}
          className="absolute top-4 right-4 z-[1000] bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <span>🌊</span>
          <span>{t('map.flood.button')}</span>
        </button>
      )}
      
      {/* Filters Sidebar */}
      <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-80">
        <h2 className="text-xl font-bold mb-4">{t('map.filters.title')}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('map.filters.layer')}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDataLayer('price')}
                className={`p-2 rounded text-sm ${
                  dataLayer === 'price'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {t('map.filters.priceLayer')}
              </button>
              <button
                onClick={() => setDataLayer('flood')}
                className={`p-2 rounded text-sm ${
                  dataLayer === 'flood'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {t('map.filters.floodLayer')}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('map.filters.priceRange')}</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={t('map.filters.min')}
                className="input text-sm"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <input
                type="number"
                placeholder={t('map.filters.max')}
                className="input text-sm"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('map.filters.roomType')}</label>
            <select
              className="input text-sm"
              value={filters.roomType}
              onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
            >
              <option value="">{t('map.filters.all')}</option>
              <option value="single">{t('create.roomTypes.single')}</option>
              <option value="shared">{t('create.roomTypes.shared')}</option>
              <option value="apartment">{t('create.roomTypes.apartment')}</option>
              <option value="house">{t('create.roomTypes.house')}</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-bold mb-2">{t('map.legend.title')}</h3>
          {dataLayer === 'price' && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2 border-2 border-white shadow-sm"></div>
                <span>{t('map.legend.lowPrice')}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2 border-2 border-white shadow-sm"></div>
                <span>{t('map.legend.medPrice')}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2 border-2 border-white shadow-sm"></div>
                <span>{t('map.legend.highPrice')}</span>
              </div>
            </div>
          )}
          {dataLayer === 'flood' && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-400 rounded-full mr-2 border-2 border-white"></div>
                <span>{t('map.legend.floodLow')}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-600 rounded-full mr-2 border-2 border-white"></div>
                <span>{t('map.legend.floodMed')}</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-800 rounded-full mr-2 border-2 border-white"></div>
                <span>{t('map.legend.floodHigh')}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500">Hexagon: ≥3 reports / 30 mins</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[10.8231, 106.6297]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ZoomControl position="topright" />
        
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
                    <h3 className="font-bold text-sm mb-1">💰 {t('map.filters.priceLayer')}</h3>
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
                  </div>
                </Popup>
              </Marker>
            );
          })}
        
        {dataLayer === 'flood' && floodZones.map((zone) => {
          const color = getFloodColor(zone.maxLevel, zone.maxFloodDepth);
          const opacity = getFloodOpacity(zone.maxLevel);
          const depthLabels: Record<string, string> = {
            ankle: t('map.flood.levels.ankle'),
            knee: t('map.flood.levels.knee'),
            bike_seat: t('map.flood.levels.bike')
          };
          const levelLabels: Record<string, string> = {
            low: t('map.flood.levels.low'),
            medium: t('map.flood.levels.medium'),
            high: t('map.flood.levels.high')
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
                  <h3 className="font-bold text-sm mb-1">🌊 {t('map.filters.floodLayer')}</h3>
                  <p className="text-xs mb-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      zone.maxLevel === 'high' ? 'bg-blue-800 text-blue-100' :
                      zone.maxLevel === 'medium' ? 'bg-blue-600 text-blue-100' :
                      'bg-blue-400 text-blue-50'
                    }`}>
                      {t('map.flood.level')}: {levelLabels[zone.maxLevel]}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 mb-1">
                    {t('map.flood.depth')}: {depthLabels[zone.maxFloodDepth] || zone.maxFloodDepth}
                  </p>
                </div>
              </Popup>
            </Polygon>
          );
        })}
        
        {dataLayer === 'flood' && floodReports
          .filter(report => report.status !== 'resolved')
          .map((report) => {
          if (!report.location?.coordinates) return null;
          const lat = report.location.coordinates.lat;
          const lng = report.location.coordinates.lng;
          
          const color = getFloodColor(report.level, report.floodDepth);
          const opacity = getFloodOpacity(report.level);
          const depthLabels: Record<string, string> = {
            ankle: t('map.flood.levels.ankle'),
            knee: t('map.flood.levels.knee'),
            bike_seat: t('map.flood.levels.bike')
          };
          const levelLabels: Record<string, string> = {
            low: t('map.flood.levels.low'),
            medium: t('map.flood.levels.medium'),
            high: t('map.flood.levels.high')
          };
          
          return (
            <Circle
              key={`report-${report._id}`}
              center={[lat, lng]}
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
                  <h3 className="font-bold text-sm mb-1">🌊 {t('map.flood.modalTitle')}</h3>
                  {report.images && report.images[0] && (
                    <img
                      src={getImageUrl(report.images[0])}
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
                      {levelLabels[report.level]}
                    </span>
                    <span className="ml-2 text-gray-600">
                      {depthLabels[report.floodDepth] || report.floodDepth}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 mb-2">{report.description}</p>
                  {report.location.address && (
                    <p className="text-xs text-gray-500 mb-2">{report.location.address}</p>
                  )}
                  <button
                    onClick={() => handleResolveFlood(report._id)}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded"
                  >
                    ✓ {t('map.flood.resolve')}
                  </button>
                </div>
              </Popup>
            </Circle>
          );
        })}
        
        {listings.map((listing) => {
          if (!listing.location.coordinates) return null;
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
                      src={getImageUrl(listing.images[0])}
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
                  <a
                    href={`/listings/${listing._id}`}
                    className="block mt-2 text-xs text-primary-600 hover:underline"
                  >
                    {t('common.viewDetails')} →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      <style>{`
        .leaflet-control-zoom {
          margin-top: 4rem !important;
          margin-right: 0.5rem !important;
        }
      `}</style>
      
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
  const { t } = useTranslation();
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

  useEffect(() => {
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
        (error) => console.error('Error getting location:', error)
      );
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
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
      if (formData.address) formDataToSend.append('location[address]', formData.address);
      formDataToSend.append('radius', '100');
      if (selectedFile) formDataToSend.append('images', selectedFile);

      await axios.post('/api/maps/flood-reports', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(t('common.success'));
      onSuccess();
    } catch (error: any) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🌊 {t('map.flood.modalTitle')}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('map.flood.level')} *</label>
              <select
                className="input"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                required
              >
                <option value="low">{t('map.flood.levels.low')}</option>
                <option value="medium">{t('map.flood.levels.medium')}</option>
                <option value="high">{t('map.flood.levels.high')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('map.flood.depth')} *</label>
              <select
                className="input"
                value={formData.floodDepth}
                onChange={(e) => setFormData({ ...formData, floodDepth: e.target.value as any })}
                required
              >
                <option value="ankle">{t('map.flood.levels.ankle')}</option>
                <option value="knee">{t('map.flood.levels.knee')}</option>
                <option value="bike_seat">{t('map.flood.levels.bike')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('map.flood.desc')} *</label>
              <textarea
                className="input"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('map.flood.address')}</label>
              <input
                type="text"
                className="input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('map.flood.image')}</label>
              <input type="file" accept="image/*" onChange={handleFileSelect} className="input" />
              {previewUrl && <img src={previewUrl} alt="Preview" className="mt-2 w-full h-48 object-cover rounded" />}
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary">{t('common.cancel')}</button>
              <button type="submit" disabled={loading} className="flex-1 btn-primary">
                {loading ? t('map.flood.submitting') : t('map.flood.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MapView;