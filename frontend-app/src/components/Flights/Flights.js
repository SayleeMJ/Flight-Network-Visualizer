import React, { useState, useContext, useCallback } from 'react';
import './Flights.css';
import UsGeoMap from './charts/UsFlightMap';
import Dropdown from 'react-bootstrap/Dropdown';
import { DataContext } from '../../context/DataContext';

const Flights = () => {
  const data = useContext(DataContext);

  const airlinesData = data.airlinesData;

  const [selectedAirline, setSelectedAirline] = useState(
    'United Air Lines Inc.'
  );
  const [selectedOrigin, setSelectedOrigin] = useState('select city');

  const totalAirlines = 13;
  const [totalFlights, setTotalFlights] = useState(null);
  const [totalOrigins, setTotalOrigins] = useState(null);
  const [totalDest, setTotalDest] = useState(null);
  const [flightOrigins, setFlightOrigins] = useState([]);

  // Reset origin when airline changes
  const handleSelectedAirline = (selectedItem) => {
    setSelectedAirline(selectedItem);
    setSelectedOrigin('select city');
  };

  const handleSelectedOrigin = (selectedItem) => {
    setSelectedOrigin(selectedItem);
  };

  // Update summary cards
  const handleFlightValues = useCallback((values) => {
    setTotalFlights(values.total_flights);
    setTotalOrigins(values.total_origins);
    setTotalDest(values.total_dest);
  }, []);

  // Update origin dropdown options
  const handleFlightOrigins = useCallback((origins) => {
    setFlightOrigins(Array.from(origins));
  }, []);

  return (
    <div>
      {airlinesData != null && (
        <div className='page-container flights-container'>
          <div className='top'>
            {flightCards('Total Airlines', totalAirlines, 'total-airlines')}
            {flightCards('Total Flights', totalFlights, 'total-flights')}
            {flightCards('No. of Origin', totalOrigins, 'total-origin')}
            {flightCards('No. of Dest', totalDest, 'total-dest')}
          </div>

          <div className='bottom'>
            <div className='card-container usmap-card'>
              <div>
                <div className='card-title'>Flights Distribution</div>

                <div
                  style={{
                    display: 'flex',
                    columnGap: '10px',
                  }}
                >
                  {/* Airline dropdown */}
                  <Dropdown onSelect={handleSelectedAirline}>
                    <Dropdown.Toggle
                      className='btn-primary'
                      id='dropdown-basic'
                    >
                      {selectedAirline}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      {[
                        ...new Set(
                          airlinesData.map((airline) => airline.AIRLINE)
                        ),
                      ].map((item) => (
                        <Dropdown.Item
                          key={item}
                          eventKey={item}
                        >
                          {item}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>

                  {/* Origin dropdown */}
                  <Dropdown onSelect={handleSelectedOrigin}>
                    <Dropdown.Toggle
                      className='btn-primary'
                      id='dropdown-basic'
                    >
                      Origin: {selectedOrigin}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      {flightOrigins.map((item) => (
                        <Dropdown.Item
                          key={item }
                          eventKey={item}
                        >
                          {item}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>

              <div className='usmap-flights'>
                <UsGeoMap
                  selectedAirline={selectedAirline}
                  selectedOrigin={selectedOrigin}
                  flightValues={handleFlightValues}
                  flightOriginsData={handleFlightOrigins}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Summary cards
const flightCards = (title, value, id) => {
  return (
    <div className='card-container airlines-card' id={id}>
      <div className='card-title'>{title}</div>
      <div className='flights-values'>{value}</div>
    </div>
  );
};

export default Flights;
