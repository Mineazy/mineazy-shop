import React, { useState } from 'react';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const branches = [
  { name: 'Belmont', lat: -20.17246, lng: 28.57521, phone: ['+263 292 262568', '+263 712 290 046'] },
  { name: 'Tongogara', lat: -20.150342, lng: 28.589757, phone: ['+263 714 699 928', '+263 712 290 046'] },
  { name: 'Junkshop', lat: -20.148579, lng: 28.58701, phone: ['+263 714 699 928', '+263 715 035 680', '+263 712 290 046'] },
  { name: 'Maphisa', lat: -21.064779, lng: 28.458567, phone: ['+263 715 348 701', '+263 712 290 046'] },
  { name: 'Esigodini 2', lat: -20.293167, lng: 28.938451, phone: ['+263 718 450 335', '+263 712 290 046'] },
  { name: 'Habane', lat: -20.3123, lng: 28.942574, phone: ['+263 714 786 731', '+263 712 290 046'] },
  { name: 'Mthwakazi', lat: -20.545458, lng: 29.276163, phone: ['+263 714 761 636', '+263 712 290 046'] },
  { name: 'Mswela', lat: -20.533696, lng: 29.288926, phone: ['+263 777 487 698', '+263 712 290 046'] },
  { name: 'Filabusi Mainshop', lat: -20.526441, lng: 29.298054, phone: ['+263 714 761 636', '+263 773 686 453', '+263 777 487 698', '+263 712 290 046'] },
  { name: 'Gwanda VID', lat: -20.937838, lng: 29.009163, phone: ['+263 712 290 774', '+263 712 290 046'] },
  { name: 'Thobelani', lat: -20.943136, lng: 29.00573, phone: ['+263 717 852 371', '+263 712 290 046'] },
  { name: 'Gweru MMS', lat: -19.446757, lng: 29.814204, phone: ['+263 71 583 0237', '+263 712 290 046'] },
  { name: 'Gweru EazyTools', lat: -19.448399, lng: 29.810319, phone: ['+263 717 12 181', '+263 54222 2261', '+263 712 290 046'] },
];

const createIcon = (isActive) => {
  const color = isActive ? '#2c3570' : '#fcf350';
  const border = isActive ? '#fff' : '#2c3570';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid ${border};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "><div style="
      width: 10px; height: 10px;
      background: #fff;
      border-radius: 50%;
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
    "></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
};

const FlyToBranch = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
};

const BranchLocator = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);

  const center = [-20.5, 29.0];

  const handleSelect = (index) => {
    setActiveIndex(index);
    setFlyTarget([branches[index].lat, branches[index].lng]);
  };

  const handlePrev = () => {
    const next = activeIndex === null || activeIndex === 0 ? branches.length - 1 : activeIndex - 1;
    handleSelect(next);
  };

  const handleNext = () => {
    const next = activeIndex === null || activeIndex === branches.length - 1 ? 0 : activeIndex + 1;
    handleSelect(next);
  };

  return (
    <section id="branch-locator" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-secondary px-4 py-2 rounded-full font-medium mb-4">
            <MapPin className="w-4 h-4" />
            Our Locations
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-medium text-gray-900 mb-6">
            Find a Branch
            <span className="block text-secondary">Near You</span>
          </h2>
          <p className="text-sm md:text-xl text-gray-600 max-w-2xl mx-auto">
            Visit any of our branches across Zimbabwe for expert advice, product demonstrations, and personalized service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2 h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200 relative z-0">
            <MapContainer
              center={center}
              zoom={7}
              scrollWheelZoom={true}
              className="h-full w-full"
              style={{ background: '#e5e7eb' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FlyToBranch center={flyTarget} />
              {branches.map((branch, index) => (
                <Marker
                  key={branch.name}
                  position={[branch.lat, branch.lng]}
                  icon={createIcon(activeIndex === index)}
                  eventHandlers={{
                    click: () => handleSelect(index),
                  }}
                >
                  <Popup>
                    <div className="text-center p-1">
                      <strong className="text-sm">{branch.name}</strong>
                      <br />
                      <span className="text-xs text-gray-500">
                        {branch.lat.toFixed(4)}, {branch.lng.toFixed(4)}
                      </span>
                      {branch.phone && branch.phone.length > 0 && (
                        <div className="mt-1 text-xs text-gray-700">
                          {branch.phone.map((num, i) => (
                            <div key={i}>{num}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Branch List */}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {branches.length} Branches
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Previous branch"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Next branch"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[420px] md:max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
              {branches.map((branch, index) => (
                <button
                  key={branch.name}
                  onClick={() => handleSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    activeIndex === index
                      ? 'bg-secondary text-white border-secondary shadow-md'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-secondary/50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activeIndex === index ? 'bg-white/20' : 'bg-primary/20'
                      }`}
                    >
                      <MapPin
                        className={`w-4 h-4 ${
                          activeIndex === index ? 'text-white' : 'text-secondary'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{branch.name}</div>
                      <div
                        className={`text-xs ${
                          activeIndex === index ? 'text-white/70' : 'text-gray-500'
                        }`}
                      >
                        {branch.lat.toFixed(4)}, {branch.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BranchLocator;
