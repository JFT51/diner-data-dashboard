import { DayData } from '../types/data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface GenderChartProps {
  data: DayData[];
}

export function GenderChart({ data }: GenderChartProps) {
  const totalMen = data.reduce((sum, day) => sum + day.menEntering, 0);
  const totalWomen = data.reduce((sum, day) => sum + day.womenEntering, 0);
  const totalGroups = data.reduce((sum, day) => sum + day.groupEntering, 0);

  const chartData = [
    { name: 'Men', value: totalMen },
    { name: 'Women', value: totalWomen },
    { name: 'Groups', value: totalGroups },
  ];

  const COLORS = ['#859527', '#f39700', '#a6ba33'];

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Gender Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}