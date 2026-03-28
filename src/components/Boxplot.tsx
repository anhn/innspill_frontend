import React from 'react';

interface BoxplotData {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean?: number;
  outliers?: number[];
}

interface BoxplotProps {
  data: BoxplotData;
  width?: number;
  height?: number;
  label?: string;
  showMean?: boolean;
}

export function Boxplot({ data, width = 200, height = 60, label, showMean = true }: BoxplotProps) {
  const padding = 20;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const scale = plotWidth / 5; // Scale for 0-5 range
  
  const x = (value: number) => padding + (value * scale);
  const y = padding + plotHeight / 2;
  
  const boxWidth = x(data.q3) - x(data.q1);
  const boxLeft = x(data.q1);
  const boxTop = y - 15;
  const boxBottom = y + 15;
  
  return (
    <div className="flex flex-col items-center">
      {label && <div className="text-xs text-muted-foreground mb-1">{label}</div>}
      <svg width={width} height={height} className="overflow-visible">
        {/* Whiskers */}
        <line x1={x(data.min)} y1={y} x2={x(data.max)} y2={y} stroke="#666" strokeWidth="1" />
        <line x1={x(data.min)} y1={y - 10} x2={x(data.min)} y2={y + 10} stroke="#666" strokeWidth="2" />
        <line x1={x(data.max)} y1={y - 10} x2={x(data.max)} y2={y + 10} stroke="#666" strokeWidth="2" />
        
        {/* Box */}
        <rect
          x={boxLeft}
          y={boxTop}
          width={boxWidth}
          height={boxBottom - boxTop}
          fill="#8884d8"
          fillOpacity={0.3}
          stroke="#8884d8"
          strokeWidth="2"
        />
        
        {/* Median line */}
        <line
          x1={x(data.median)}
          y1={boxTop}
          x2={x(data.median)}
          y2={boxBottom}
          stroke="#000"
          strokeWidth="2"
        />
        
        {/* Mean dot (if shown) */}
        {showMean && data.mean !== undefined && (
          <circle
            cx={x(data.mean)}
            cy={y}
            r="4"
            fill="#ff7300"
            stroke="#fff"
            strokeWidth="1"
          />
        )}
        
        {/* Outliers */}
        {data.outliers && data.outliers.map((outlier, idx) => (
          <circle
            key={idx}
            cx={x(outlier)}
            cy={y}
            r="3"
            fill="#ff0000"
            stroke="#fff"
            strokeWidth="1"
          />
        ))}
        
        {/* Scale labels */}
        <text x={padding} y={height - 5} fontSize="10" fill="#666">0</text>
        <text x={width - padding - 10} y={height - 5} fontSize="10" fill="#666">5</text>
      </svg>
      <div className="text-xs text-muted-foreground mt-1">
        Min: {data.min.toFixed(1)} | Q1: {data.q1.toFixed(1)} | Med: {data.median.toFixed(1)} | Q3: {data.q3.toFixed(1)} | Max: {data.max.toFixed(1)}
        {data.mean !== undefined && ` | Mean: ${data.mean.toFixed(1)}`}
      </div>
    </div>
  );
}

