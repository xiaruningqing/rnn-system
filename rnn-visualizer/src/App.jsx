import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Overview from './pages/Overview';
import ComparativeAnalysis from './pages/ComparativeAnalysis';
import VisualizationPage from './pages/VisualizationPage';
import Toolbox from './pages/Toolbox';
import TextClassification from './pages/TextClassification';
import './App.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <Router>
      <div className="App">
        <Navbar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/comparative-analysis" element={<ComparativeAnalysis />} />
            <Route path="/visualization" element={<VisualizationPage />} />
            <Route path="/toolbox" element={<Toolbox />} />
            <Route path="/text-classification" element={<TextClassification />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


export default App;
