import { DayData } from '../types/data';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeatherImpactChartProps {
  data: DayData[];
}

export function WeatherImpactChart({ data }: WeatherImpactChartProps) {
  const chartData = data.map(day => ({
    temperature: day.temperature,
    visitors: day.visitorsEntering,
    date: format(day.date, 'MM/dd'),
    weather: day.weatherSymbol,
  }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        
        <CardTitle>Weather Impact</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="temperature" name="Temperature (°C)" />
              <YAxis dataKey="visitors" name="Visitors" />
              <Tooltip 
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p>Date: {data.date}</p>
                      <p>Temperature: {data.temperature}°C</p>
                      <p>Visitors: {data.visitors}</p>
                      <p>Weather: {data.weather}</p>
                    </div>
                  );
                }}
              />
              <Scatter data={chartData} fill="#859527" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}