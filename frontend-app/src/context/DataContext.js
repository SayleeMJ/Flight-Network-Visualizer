import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [airlinesData, setAirlinesData] = useState(null);
  const [airportsData, setAirportsData] = useState(null);

  useEffect(() => {
    const fetchAirlineData = async () => {
      try {
        const response = await axios.get(
          'https://flight-network-visualizer.onrender.com/airlines/all'
        );
        setAirlinesData(response.data);
      } catch (error) {
        console.error('Error fetching airlines data:', error);
      }
    };

    const fetchAirportData = async () => {
      try {
        const response = await axios.get(
          'https://flight-network-visualizer.onrender.com/airports/all'
        );
        setAirportsData(response.data);
      } catch (error) {
        console.error('Error fetching airports data:', error);
      }
    };

    fetchAirlineData();
    fetchAirportData();
  }, []);

  return (
    <DataContext.Provider value={{ airlinesData, airportsData }}>
      {children}
    </DataContext.Provider>
  );
};

export { DataContext, DataProvider };
