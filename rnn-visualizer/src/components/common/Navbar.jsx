import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import { 
    FaBars, FaTimes, FaHome, FaChartBar, FaEye, FaToolbox, FaVideo, FaFlask 
} from 'react-icons/fa';

function Navbar({ isCollapsed, setIsCollapsed }) {

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-brand">
            <span className="brand-main">RNN</span>
            <span className="brand-sub">神经网络实验室</span>
          </div>
        )}
        <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li><NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FaHome className="nav-icon" />
            {!isCollapsed && <span className="nav-text">概述</span>}
          </NavLink></li>
          <li><NavLink to="/comparative-analysis" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FaChartBar className="nav-icon" />
            {!isCollapsed && <span className="nav-text">对比分析</span>}
          </NavLink></li>
          <li><NavLink to="/visualization" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FaEye className="nav-icon" />
            {!isCollapsed && <span className="nav-text">可视化</span>}
          </NavLink></li>
          <li><NavLink to="/toolbox" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FaToolbox className="nav-icon" />
            {!isCollapsed && <span className="nav-text">工具箱</span>}
          </NavLink></li>
          <li><NavLink to="/text-classification" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FaFlask className="nav-icon" />
            {!isCollapsed && <span className="nav-text">文本分类</span>}
          </NavLink></li>
          <li><NavLink to="/video-tutorial" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FaVideo className="nav-icon" />
            {!isCollapsed && <span className="nav-text">视频教学</span>}
          </NavLink></li>
        </ul>
      </nav>
    </aside>
  );
}

export default Navbar;
