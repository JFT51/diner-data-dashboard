import { DayData } from '../types/data';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricsChartProps {
  data: DayData[];
}

export function MetricsChart({ data }: MetricsChartProps) {
  const chartData = data.map(day => ({
    date: format(day.date, 'MM/dd'),
    captureRate: day.captureRate,
    conversion: day.conversion,
    dwellTime: day.dwellTime / 60, // Convert to hours for better visualization
  }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="captureRate" name="Capture Rate (%)" fill="#859527" />
              <Bar dataKey="conversion" name="Conversion (%)" fill="#f39700" />
              <Bar dataKey="dwellTime" name="Dwell Time (h)" fill="#a6ba33" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}