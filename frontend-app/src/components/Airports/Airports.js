import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import './Airports.css';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import Dropdown from 'react-bootstrap/Dropdown';
import { DataContext } from '../../context/DataContext';
import UsAirportMap from './charts/UsAirportMap';
import AirportsPieChart from './charts/AirportsPieChart';

const Airports = () => {
  const data = useContext(DataContext);
  const airportsData = data.airportsData;

  const [trafficCounts, setTrafficCounts] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [selectedState, setSelectedState] = useState('WA');
  const [markersData, setMarkersData] = useState([]);

  // Fetch compact airport traffic counts
  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const response = await axios.get(
          'https://flight-network-visualizer.onrender.com/airports/traffic'
        );
        setTrafficCounts(response.data);
      } catch (error) {
        console.error('Error fetching airport traffic:', error);
        setTrafficCounts(null);
      }
    };

    fetchTraffic();
  }, []);

  // Update markers and traffic when the selected state changes
  useEffect(() => {
    if (!airportsData || !trafficCounts) return;

    const stateAirports = airportsData.filter(
      (airport) => airport.STATE === selectedState
    );

    const markers = stateAirports.map((airport) => ({
      markerOffset: 0,
      code: airport.IATA_CODE,
      city: airport.CITY,
      state: airport.STATE,
      coordinates: [airport.LONGITUDE, airport.LATITUDE],
    }));

    setMarkersData(markers);

    const departures = new Map(
      trafficCounts.departures.map((item) => [item._id, item.count])
    );

    const arrivals = new Map(
      trafficCounts.arrivals.map((item) => [item._id, item.count])
    );

    const result = [['City', 'Traffic']];

    stateAirports.forEach((airport) => {
      const depCount = departures.get(airport.IATA_CODE) || 0;
      const arrCount = arrivals.get(airport.IATA_CODE) || 0;

      result.push([airport.CITY, depCount + arrCount]);
    });

    setTrafficData(result);
  }, [selectedState, airportsData, trafficCounts]);

  const [key, setKey] = useState(0);  return (
    <div className='page-container airports-container'>
      <div className='top'>
        <div className='card-container airports-map-card'>
          <div>
            <div className='card-title'>Airport Distribution</div>

            {airportsData != null && (
              <Dropdown onSelect={setSelectedState}>
                <Dropdown.Toggle className='btn-primary' id='dropdown-basic'>
                  {selectedState}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {[...new Set(airportsData.map((airport) => airport.STATE))]
                    .filter(Boolean)
                    .map((item, index) => (
                      <Dropdown.Item key={index} eventKey={item}>
                        {item}
                      </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>

          <div className='airports-map'>
            <UsAirportMap
              markersData={markersData}
              selectedState={selectedState}
            />
          </div>
        </div>

        <div className='card-container busiest-airports-card'>
          <div className='card-title'>Cities with Busiest Airports</div>

          <div className='busiest-airports'>
            {trafficData.length > 1 && (
              <AirportsPieChart
                trafficData={trafficData}
                styled={{
                  height: '100%',
                  width: 'fit-content',
                  margin: '0 auto',
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className='bottom'>
        <div className='card-container airports-list-card'>
          <div className='airports-list'>
            {airportsData != null && (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 0 }} aria-label='simple table'>
                  <TableHead>
                    <TableRow>
                      <TableCell align='center' style={{ minWidth: 0 }}>
                        ORIGIN
                      </TableCell>
                      <TableCell align='center' style={{ minWidth: 0 }}>
                        DESTINATION
                      </TableCell>
                      <TableCell align='center' style={{ minWidth: 0 }}>
                        CITY
                      </TableCell>
                      <TableCell align='center' style={{ minWidth: 0 }}>
                        STATE
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {airportsData.map((row) => (
                      <TableRow
                        key={row.AIRPORT}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell align='center' style={{ minWidth: 0 }}>
                          {row.IATA_CODE}
                        </TableCell>
                        <TableCell align='center' style={{ minWidth: 0 }}>
                          {row.AIRPORT}
                        </TableCell>
                        <TableCell align='center' style={{ minWidth: 0 }}>
                          {row.CITY}
                        </TableCell>
                        <TableCell align='center' style={{ minWidth: 0 }}>
                          {row.STATE}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Airports;
