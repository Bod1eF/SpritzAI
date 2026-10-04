import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SpritzComponent from './components/spritz_components';
import SearchResultsPage from './components/SearchResultsPage';
import {DupeProvider} from './context/DupeContext';

function App() {
  return (
    <DupeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SpritzComponent />} />
          <Route path="/searchResultsPage" element={<SearchResultsPage />} />
          <Route path="/*" element={<SearchResultsPage />} />
        </Routes>
      </Router>
    </DupeProvider>
  );
}

export default App;
