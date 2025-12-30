// Loading Skeleton Component
// Professional loading placeholders
// Person 1 - Frontend Developer

import React from 'react';
import './LoadingSkeleton.css';

export const CardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-line skeleton-title"></div>
    <div className="skeleton-line skeleton-text"></div>
    <div className="skeleton-line skeleton-text short"></div>
  </div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div className="skeleton-list">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="skeleton-item">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-content">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-text"></div>
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="skeleton-table">
    <div className="skeleton-table-header">
      {Array.from({ length: cols }).map((_, index) => (
        <div key={index} className="skeleton-line skeleton-header"></div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="skeleton-table-row">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div key={colIndex} className="skeleton-line skeleton-cell"></div>
        ))}
      </div>
    ))}
  </div>
);

export default CardSkeleton;

