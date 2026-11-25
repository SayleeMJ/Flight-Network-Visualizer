import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from 'react-simple-maps';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

import { DataContext } from '../../../context/DataContext';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const UsGeoMap = ({
  selectedAirline,
  selectedOrigin,
  flightValues,
  flightOriginsData,
}) => {
  const data = useContext(DataContext);

  const [routesData, setRoutesData] = useState([]);
  const [markersData, setMarkersData] = useState([]);
  const [routesTable, setRoutesTable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch only the selected airline's routes
  useEffect(() => {
    if (!data.airlinesData || !data.airportsData || !selectedAirline) {
      return;
    }

    let isActive = true;

    const fetchRoutes = async () => {
      setLoading(true);

      try {
        const airline = data.airlinesData.find(
          (item) => item.AIRLINE === selectedAirline
        );

        if (!airline) {
          throw new Error('Selected airline was not found');
        }

        const response = await axios.get(
          `https://flight-network-visualizer.onrender.com/flights/routes/${airline.IATA_CODE}`
        );

        if (!isActive) return;

        const airportsByCode = new Map(
          data.airportsData.map((airport) => [
            airport.IATA_CODE,
            airport,
          ])
        );

        // Convert airport codes into route details
        const routes = response.data.map((flight) => {
          const originAirport = airportsByCode.get(
            flight.ORIGIN_AIRPORT
          );

          const destinationAirport = airportsByCode.get(
            flight.DESTINATION_AIRPORT
          );

          return {
            dep_code: flight.ORIGIN_AIRPORT,
            dep: originAirport?.CITY || flight.ORIGIN_AIRPORT,
            arr_code: flight.DESTINATION_AIRPORT,
            arr: destinationAirport?.CITY || flight.DESTINATION_AIRPORT,
          };
        });

        // Unique origin cities
        const origins = new Set(routes.map((route) => route.dep));

        flightOriginsData(origins);

        // Prepare route table
        const flightRows = routes.map((route) => ({
          Origin: route.dep,
          Origin_Code: route.dep_code,
          Dest: route.arr,
          Dest_Code: route.arr_code,
        }));

        // Prepare unique airport markers using airport codes
        const airportCodes = new Set(
          routes.flatMap((route) => [
            route.dep_code,
            route.arr_code,
          ])
        );

        const markers = Array.from(airportCodes)
          .map((code) => {
            const airport = airportsByCode.get(code);

            if (
              !airport ||
              !Number.isFinite(airport.LONGITUDE) ||
              !Number.isFinite(airport.LATITUDE)
            ) {
              return null;
            }

            return {
              code: airport.IATA_CODE,
              coordinates: [
                airport.LONGITUDE,
                airport.LATITUDE,
              ],
            };
          })
          .filter(Boolean);

        setRoutesData(routes);
        setRoutesTable(flightRows);
        setMarkersData(markers);

        // Update summary cards
        flightValues({
          total_flights: routes.length,
          total_origins: origins.size,
          total_dest: new Set(routes.map((route) => route.arr)).size,
        });
      } catch (error) {
        if (isActive) {
          console.error('Error fetching airline routes:', error);

          setRoutesData([]);
          setRoutesTable([]);
          setMarkersData([]);
          flightOriginsData(new Set());

          flightValues({
            total_flights: 0,
            total_origins: 0,
            total_dest: 0,
          });
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchRoutes();

    return () => {
      isActive = false;
    };
  }, [
    selectedAirline,
    data.airlinesData,
    data.airportsData,
    flightValues,
    flightOriginsData,
  ]);

  if (loading) {
    return <div>Loading flight routes...</div>;
  }

  const markersByCode = new Map(
    markersData.map((marker) => [marker.code, marker])
  );

  return (
    <div  style={{ display: 'flex', width: '100%', gap: '20px'}}>
      {markersData.length > 0 && (
        <ComposableMap
          projection='geoEqualEarth'
          projectionConfig={{
            scale: 430,
            center: [-115, 35],
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    stroke='#fff'
                    geography={geo}
                    fill='#e6e6e6'
                  />
                ))}

                {/* Draw routes for the selected origin */}
                {routesData.map((route, index) => {
                  if (
                    selectedOrigin === 'select city' ||
                    route.dep !== selectedOrigin
                  ) {
                    return null;
                  }

                  const from = markersByCode.get(route.dep_code);
                  const to = markersByCode.get(route.arr_code);

                  if (!from || !to) return null;

                  return (
                    <Line
                      key={`${route.dep_code}-${route.arr_code}-${index}`}
                      from={from.coordinates}
                      to={to.coordinates}
                      stroke='#9055A2'
                      strokeWidth={1.5}
                      strokeLinecap='round'
                    />
                  );
                })}

                {/* Airport markers */}
                {markersData.map(({ code, coordinates }) => (
                  <Marker key={code} coordinates={coordinates}>
                    <circle
                      r={4}
                      fill='#E63946'
                      stroke='white'
                      strokeWidth={1}
                    />
                  </Marker>
                ))}
              </>
            )}
          </Geographies>
        </ComposableMap>
      )}

      {/* Routes table */}
      <div className='card-container flights-list-card'>
        <div className='flights-list'>
          {routesTable.length > 0 && (
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
                  </TableRow>
                </TableHead>

                <TableBody>
                  {routesTable.map((row, index) => (
                    <TableRow
                      key={`${row.Origin_Code}-${row.Dest_Code}-${index}`}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell align='center' style={{ minWidth: 0 }}>
                        {row.Origin}
                      </TableCell>

                      <TableCell align='center' style={{ minWidth: 0 }}>
                        {row.Dest}
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
  );
};

export default UsGeoMap;
