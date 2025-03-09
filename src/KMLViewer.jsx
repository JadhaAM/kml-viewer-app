import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DOMParser } from 'xmldom';
import toGeoJSON from '@mapbox/togeojson';
import './KMLViewer.css';

import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const KMLViewer = () => {
  const [kmlData, setKmlData] = useState(null);
  const [geoJSON, setGeoJSON] = useState(null);
  const [elementCounts, setElementCounts] = useState({});
  const [detailedInfo, setDetailedInfo] = useState([]);
  const [activeTab, setActiveTab] = useState('map');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    setError('');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const kmlContent = e.target.result;
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlContent, 'text/xml');
        
        const kmlElement = kmlDoc.getElementsByTagName('kml')[0];
        if (!kmlElement) {
          throw new Error('Invalid KML file');
        }
        
        setKmlData(kmlDoc);

        const geoJSONData = toGeoJSON.kml(kmlDoc);
        setGeoJSON(geoJSONData);
      
        processKMLData(geoJSONData);
      } catch (err) {
        setError('Error processing KML file: ' + err.message);
        setKmlData(null);
        setGeoJSON(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };
  
  const calculateLength = (feature) => {
    let length = 0;
    const { type, coordinates } = feature.geometry;
    
    if (type === 'LineString') {
      for (let i = 0; i < coordinates.length - 1; i++) {
        length += calculateDistance(coordinates[i], coordinates[i + 1]);
      }
    } else if (type === 'MultiLineString') {
      coordinates.forEach(line => {
        for (let i = 0; i < line.length - 1; i++) {
          length += calculateDistance(line[i], line[i + 1]);
        }
      });
    }
    
    return length.toFixed(2);
  };
  
  const calculateDistance = (point1, point2) => {
    const R = 6371;
    const dLat = (point2[1] - point1[1]) * Math.PI / 180;
    const dLon = (point2[0] - point1[0]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1[1] * Math.PI / 180) * Math.cos(point2[1] * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  const processKMLData = (geoData) => {
    if (!geoData || !geoData.features) return;
    
    const counts = {};
    const details = [];
    
    geoData.features.forEach(feature => {
      const type = feature.geometry.type;
      counts[type] = (counts[type] || 0) + 1;
      
      let length = 0;
      if (type === 'LineString' || type === 'MultiLineString') {
        length = calculateLength(feature);
      }
      
      details.push({
        type,
        name: feature.properties.name || 'Unnamed Feature',
        description: feature.properties.description || '',
        length: (type === 'LineString' || type === 'MultiLineString') ? length : 'N/A'
      });
    });
    
    setElementCounts(counts);
    setDetailedInfo(details);
  };
  
  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`<b>${feature.properties.name}</b><br>${feature.properties.description || ''}`);
    }
  };
  
  const resetFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setKmlData(null);
    setGeoJSON(null);
    setElementCounts({});
    setDetailedInfo([]);
    setActiveTab('map');
  };

  return (
    <div className="container">
      <div className="app-container">
        <div className="header">
          <h1>KML Viewer & Analyzer</h1>
          <p>Upload a KML file to view and analyze its contents</p>
        </div>
        
        <div className="content">
          <div className="file-upload-section">
            <div className="file-input-wrapper">
              <label className="file-label">Upload KML File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".kml"
                onChange={handleFileUpload}
                className="file-input"
              />
            </div>
            
            {kmlData && (
              <button
                onClick={resetFile}
                className="reset-button"
              >
                Reset
              </button>
            )}
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Processing KML file...</p>
            </div>
          )}
          
          {geoJSON && !isLoading && (
            <div className="results-container">
              <div className="tabs">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`tab ${activeTab === 'map' ? 'active' : ''}`}
                >
                  Map View
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab('detailed')}
                  className={`tab ${activeTab === 'detailed' ? 'active' : ''}`}
                >
                  Detailed View
                </button>
              </div>
              
              <div className="tab-content">
                {activeTab === 'map' && (
                  <div className="map-container">
                    <MapContainer
                      center={[0, 0]}
                      zoom={2}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {geoJSON && (
                        <GeoJSON 
                          data={geoJSON} 
                          onEachFeature={onEachFeature}
                        />
                      )}
                    </MapContainer>
                  </div>
                )}
                
                {activeTab === 'summary' && (
                  <div className="table-container">
                    <div className="table-header">
                      <h3>KML Element Summary</h3>
                      <p>Count of different element types in the KML file</p>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Element Type</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(elementCounts).map(([type, count]) => (
                          <tr key={type}>
                            <td>{type}</td>
                            <td>{count}</td>
                          </tr>
                        ))}
                        {Object.keys(elementCounts).length === 0 && (
                          <tr>
                            <td colSpan="2" className="empty-message">
                              No elements found in the KML file
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {activeTab === 'detailed' && (
                  <div className="table-container">
                    <div className="table-header">
                      <h3>Detailed KML Element Information</h3>
                      <p>Detailed view of elements with length calculation for lines</p>
                    </div>
                    <div className="table-scroll">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Length (km)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailedInfo.map((item, index) => (
                            <tr key={index}>
                              <td>{item.name}</td>
                              <td>{item.type}</td>
                              <td>{item.length !== 'N/A' ? `${item.length} km` : 'N/A'}</td>
                            </tr>
                          ))}
                          {detailedInfo.length === 0 && (
                            <tr>
                              <td colSpan="3" className="empty-message">
                                No detailed information available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KMLViewer;
