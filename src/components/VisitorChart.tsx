import { DayData } from '../types/data';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VisitorChartProps {
  data: DayData[];
}

export function VisitorChart({ data }: VisitorChartProps) {
  const chartData = data.map(day => ({
    date: format(day.date, 'MM/dd'),
    entering: day.visitorsEntering,
    leaving: day.visitorsLeaving,
    passersby: day.passersby,
  }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Visitor Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="entering" stroke="#859527" name="Entering" />
              <Line type="monotone" dataKey="leaving" stroke="#f39700" name="Leaving" />
              <Line type="monotone" dataKey="passersby" stroke="#a6ba33" name="Passersby" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}