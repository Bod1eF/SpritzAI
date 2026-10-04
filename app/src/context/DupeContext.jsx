import React, { useState, createContext } from 'react';

const DupeContext = createContext();

export const DupeProvider = ({ children }) => {
  const [dupeResult, setDupeResult] = useState(null);
  const [apiFailed, setApiFailed] = useState(false);
  const [searchURL, setSearchURL]= useState(null)
  const [loading, setLoading] = useState(true);
  return (
    <DupeContext.Provider value={{ dupeResult, setDupeResult, apiFailed, setApiFailed, searchURL, setSearchURL, loading, setLoading}}>
      {children}
    </DupeContext.Provider>
  );
};

export default DupeContext;
