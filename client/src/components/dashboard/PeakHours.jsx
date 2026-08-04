import React from 'react';

function PeakHours({ commits }) {
  const hours = new Array(24).fill(0);

  commits.forEach((commit) => {
    const hour = new Date(commit.date).getHours();
    hours[hour] += 1;
  });

  const topHour = hours.reduce(
    (best, count, index) => (count > best.count ? { hour: index, count } : best),
    { hour: 0, count: 0 }
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800">Peak Hours</h3>
      <p className="text-sm text-gray-500 mt-1">Your busiest coding window</p>
      <div className="mt-4 flex items-end gap-2 h-40">
        {hours.map((count, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className={`w-full rounded-t ${index === topHour.hour ? 'bg-blue-600' : 'bg-blue-300'}`}
              style={{ height: `${Math.max(10, count * 20)}px` }}
            />
            <span className="text-xs text-gray-500 mt-2">{index}:00</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Most active hour: <span className="font-semibold">{topHour.hour}:00</span>
      </p>
    </div>
  );
}

export default PeakHours;

