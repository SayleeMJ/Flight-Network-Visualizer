import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Airlines.css';
import AirlinesPieChart from './charts/AirlinesPieChart';
import AirlinesBarChart from './charts/AirlinesBarChart';
import AirlinesHistory from './charts/AirlinesHistory';
import Dropdown from 'react-bootstrap/Dropdown';

const Airlines = () => {
  const [airlinesData, setAirlinesData] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [selectedAirline, setSelectedAirline] = useState('');
  const [historyData, setHistoryData] = useState([]);

  // Fetch airline names and calculated summaries
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [airlinesResponse, summaryResponse] = await Promise.all([
          axios.get('https://flight-network-visualizer.onrender.com/airlines/all'),
          axios.get('https://flight-network-visualizer.onrender.com/airlines/summary')
        ]);

        setAirlinesData(airlinesResponse.data);
        setSummaryData(summaryResponse.data);

        const defaultAirline =
          airlinesResponse.data.find((airline) => airline.IATA_CODE === 'UA') ||
          airlinesResponse.data[0];

        if (defaultAirline) {
          setSelectedAirline(defaultAirline.AIRLINE);
        }
      } catch (error) {
        console.error('Error fetching airline data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch history only for the selected airline
  useEffect(() => {
    if (!selectedAirline || airlinesData.length === 0) return;

    const airline = airlinesData.find(
      (item) => item.AIRLINE === selectedAirline
    );

    if (!airline) return;

    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `https://flight-network-visualizer.onrender.com/airlines/history/${airline.IATA_CODE}`
        );
        setHistoryData(response.data);
      } catch (error) {
        console.error('Error fetching airline history:', error);
        setHistoryData([]);
      }
    };

    fetchHistory();
  }, [selectedAirline, airlinesData]);

  // Prepare data for the existing charts
  const airlineNames = new Map(
    airlinesData.map((airline) => [
      airline.IATA_CODE,
      airline.AIRLINE,
    ])
  );

  const airlineCount = summaryData.map((item) => ({
    AIRLINE: item.AIRLINE,
    count: item.count,
    Name: airlineNames.get(item.AIRLINE) || item.AIRLINE,
  }));

  const flightsBarData = summaryData.map((item) => ({
    AIRLINE: item.AIRLINE,
    DEPARTURE_DELAY: item.DEPARTURE_DELAY,
    ARRIVAL_DELAY: item.ARRIVAL_DELAY
  }));

  return (
    <div>
      {airlinesData.length > 0 && (
        <div className='page-container airlines-container'>
          <div className='top'>
            <div className='card-container airlines-card'>
              <div className='card-title'>Flights by Airlines</div>
              <div className='airlines'>
                {airlineCount.length > 1 && (
                  <AirlinesPieChart data={airlineCount} />
                )}
              </div>
            </div>

            <div className='card-container airline-delays-card'>
              <div className='card-title'>Airlines Delays</div>
              <div className='airline-delays'>
                {flightsBarData.length > 1 && (
                  <AirlinesBarChart data={flightsBarData} />
                )}
              </div>
            </div>
          </div>

          <div className='bottom'>
            <div className='card-container history-card'>
              <div>
                <div className='card-title'>
                  Historical Performance of Airline
                </div>

                <Dropdown onSelect={setSelectedAirline}>
                  <Dropdown.Toggle className='btn-primary' id='dropdown-basic'>
                    {selectedAirline}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {airlinesData.map((item, index) => (
                      <Dropdown.Item
                        key={item.IATA_CODE}
                        eventKey={item.AIRLINE}
                      >
                        {item.AIRLINE}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div className='history-delays'>
                {historyData.length > 1 && (
                  <AirlinesHistory data={historyData} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Airlines;
