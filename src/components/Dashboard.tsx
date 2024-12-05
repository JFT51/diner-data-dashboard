import { useState } from 'react';
import { HourData, DayData } from '../types/data';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from './DatePickerWithRange';
import { VisitorChart } from './VisitorChart';
import { GenderChart } from './GenderChart';
import { WeatherImpactChart } from './WeatherImpactChart';
import { MetricsChart } from './MetricsChart';

interface DashboardProps {
  hourData: HourData[];
  dayData: DayData[];
}

export function Dashboard({ hourData, dayData }: DashboardProps) {
  const [dateRange, setDateRange] = useState({
    from: dayData[0]?.date,
    to: dayData[dayData.length - 1]?.date,
  });

  const filteredDayData = dayData.filter(
    day => day.date >= dateRange.from && day.date <= dateRange.to
  );

  const totalVisitors = filteredDayData.reduce((sum, day) => sum + day.visitorsEntering, 0);
  const avgCaptureRate = filteredDayData.reduce((sum, day) => sum + day.captureRate, 0) / filteredDayData.length;
  const avgConversion = filteredDayData.reduce((sum, day) => sum + day.conversion, 0) / filteredDayData.length;
  const avgDwellTime = filteredDayData.reduce((sum, day) => sum + day.dwellTime, 0) / filteredDayData.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-spartan">Analytics Overview</h2>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Capture Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCaptureRate.toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversion.toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Dwell Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgDwellTime)} min</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitorChart data={filteredDayData} />
        <GenderChart data={filteredDayData} />
        <WeatherImpactChart data={filteredDayData} />
        <MetricsChart data={filteredDayData} />
      </div>
    </div>
  );
}