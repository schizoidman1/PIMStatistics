import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [stats, setStats] = useState({ worstCase: 0, averageCase: 0 });

  return (
    <DataContext.Provider value={{ rawData, setRawData, filteredData, setFilteredData, dateRange, setDateRange, stats, setStats }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}