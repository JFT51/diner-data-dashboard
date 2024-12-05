import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { processCSVData, aggregateDailyData, fetchWeatherData } from '../utils/dataProcessing';
import { HourData, DayData } from '../types/data';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from '../components/DataTable';
import { Dashboard } from '../components/Dashboard';
import { DailyBenchmark } from './DailyBenchmark';

const CSV_URL = 'https://raw.githubusercontent.com/JFT51/ExRest/refs/heads/main/ikxe.csv';

const Index = () => {
  const [hourData, setHourData] = useState<HourData[]>([]);
  const [dayData, setDayData] = useState<DayData[]>([]);

  const { data: rawData, isLoading: isLoadingData } = useQuery({
    queryKey: ['csvData'],
    queryFn: () => processCSVData(CSV_URL),
  });

  useEffect(() => {
    if (rawData) {
      setHourData(rawData);
      const daily = aggregateDailyData(rawData);
      
      // Fetch weather data
      const startDate = daily[0].date;
      const endDate = daily[daily.length - 1].date;
      
      fetchWeatherData(startDate, endDate).then(weatherData => {
        const updatedDayData = daily.map((day, index) => ({
          ...day,
          ...weatherData[index],
        }));
        setDayData(updatedDayData);
      });
    }
  }, [rawData]);

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-spartan">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-4xl mb-8 font-spartan">Restaurant Analytics Dashboard</h1>
      
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="daily-benchmark">Daily Benchmark</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Data</TabsTrigger>
          <TabsTrigger value="daily">Daily Data</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard hourData={hourData} dayData={dayData} />
        </TabsContent>

        <TabsContent value="daily-benchmark">
          <DailyBenchmark hourData={hourData} dayData={dayData} />
        </TabsContent>

        <TabsContent value="hourly">
          <DataTable
            data={hourData}
            columns={[
              { header: 'Timestamp', accessor: (row) => format(row.timestamp, 'dd/MM/yyyy HH:mm') },
              { header: 'Visitors Entering', accessor: (row) => row.visitorsEntering },
              { header: 'Visitors Leaving', accessor: (row) => row.visitorsLeaving },
              { header: 'Men Entering', accessor: (row) => row.menEntering },
              { header: 'Men Leaving', accessor: (row) => row.menLeaving },
              { header: 'Women Entering', accessor: (row) => row.womenEntering },
              { header: 'Women Leaving', accessor: (row) => row.womenLeaving },
              { header: 'Group Entering', accessor: (row) => row.groupEntering },
              { header: 'Group Leaving', accessor: (row) => row.groupLeaving },
              { header: 'Passersby', accessor: (row) => row.passersby },
              { header: 'Capture Rate (%)', accessor: (row) => row.captureRate },
              { header: 'Accumulated Visitors', accessor: (row) => row.accumulatedVisitors },
              { header: 'Accumulated Leaving', accessor: (row) => row.accumulatedVisitorsLeaving },
              { header: 'Live Visitors', accessor: (row) => row.liveVisitors },
            ]}
          />
        </TabsContent>

        <TabsContent value="daily">
          <DataTable
            data={dayData}
            columns={[
              { header: 'Date', accessor: (row) => format(row.date, 'dd/MM/yyyy') },
              { header: 'Visitors Entering', accessor: (row) => row.visitorsEntering },
              { header: 'Visitors Leaving', accessor: (row) => row.visitorsLeaving },
              { header: 'Men Entering', accessor: (row) => row.menEntering },
              { header: 'Men Leaving', accessor: (row) => row.menLeaving },
              { header: 'Women Entering', accessor: (row) => row.womenEntering },
              { header: 'Women Leaving', accessor: (row) => row.womenLeaving },
              { header: 'Group Entering', accessor: (row) => row.groupEntering },
              { header: 'Group Leaving', accessor: (row) => row.groupLeaving },
              { header: 'Passersby', accessor: (row) => row.passersby },
              { header: 'Capture Rate (%)', accessor: (row) => row.captureRate },
              { header: 'Conversion (%)', accessor: (row) => row.conversion },
              { header: 'Dwell Time (min)', accessor: (row) => row.dwellTime },
              { header: 'Data Accuracy (%)', accessor: (row) => row.dataAccuracy },
              { header: 'Weather', accessor: (row) => row.weatherSymbol },
              { header: 'Temp (°C)', accessor: (row) => row.temperature },
              { header: 'Precip (mm)', accessor: (row) => row.precipitation },
              { header: 'Wind (km/h)', accessor: (row) => row.windspeed },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;