import React from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function CategoryChart({ data }) {
  // Custom XAxis tick formatter to ensure all categories are visible
  const CustomXAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="chart" style={{ height: '400px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 30, right: 40, left: 50, bottom: 80 }}
          barSize={50}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="category" 
            tick={<CustomXAxisTick />}
            interval={0}
            height={80}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <Tooltip 
            formatter={(value) => [value, 'Stok Miktarı']}
            labelStyle={{ fontWeight: 'bold' }}
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
          <Bar 
            dataKey="Stok" 
            fill="#ff6a00" 
            name="Stok"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


