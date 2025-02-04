import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { calculateCaffeineLevelForIntake } from "@/lib/caffeine";

interface Props {
  intakes: Array<{
    amount: number;
    timestamp: string;
    drink?: {
      name: string;
      color?: string;
    };
  }>;
  timeRange?: '24h' | '48h' | '72h' | '1w';
}

export function MetabolismChart({ intakes, timeRange = '24h' }: Props) {
  const [data, setData] = useState<Array<{ time: string; [key: string]: number | string }>>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('MetabolismChart received intakes:', intakes);

    const dataPoints: Array<{ time: string; [key: string]: number | string }> = [];

    // Calculate total time range in hours
    const totalHours = timeRange === '1w' ? 168 : 
                      timeRange === '72h' ? 72 :
                      timeRange === '48h' ? 48 : 24;

    // Calculate half of the time range to show before and after current time
    const halfRangeHours = totalHours / 2;

    // Start from current time minus half the range
    const startTime = new Date(currentTime);
    startTime.setHours(currentTime.getHours() - halfRangeHours);

    // End at current time plus half the range
    const endTime = new Date(currentTime);
    endTime.setHours(currentTime.getHours() + halfRangeHours);

    // Calculate interval based on time range
    const intervalMinutes = totalHours <= 24 ? 10 : // 10 min for 24h
                          totalHours <= 48 ? 20 : // 20 min for 48h
                          totalHours <= 72 ? 30 : // 30 min for 72h
                          60; // 1 hour for 1 week

    const points = Math.ceil((endTime.getTime() - startTime.getTime()) / (intervalMinutes * 60 * 1000));

    for (let i = 0; i <= points; i++) {
      const pointTime = new Date(startTime.getTime() + i * intervalMinutes * 60 * 1000);

      const point: { time: string; [key: string]: number | string } = {
        time: pointTime.toLocaleString([], {
          hour: '2-digit',
          minute: '2-digit',
          month: totalHours > 24 ? 'short' : undefined,
          day: totalHours > 24 ? 'numeric' : undefined,
        }),
      };

      // Calculate levels for each intake
      intakes.forEach((intake, index) => {
        const drinkName = intake.drink?.name || `Drink ${index + 1}`;
        const level = calculateCaffeineLevelForIntake(intake, pointTime);
        point[drinkName] = level;
      });

      dataPoints.push(point);
    }

    console.log('Generated chart data points:', dataPoints);
    setData(dataPoints);
  }, [intakes, currentTime, timeRange]);

  if (!intakes.length) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No caffeine intake data to display
      </div>
    );
  }

  const currentTimeStr = currentTime.toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: timeRange !== '24h' ? 'short' : undefined,
    day: timeRange !== '24h' ? 'numeric' : undefined,
  });

  // Use drink colors or generate consistent colors for unnamed drinks
  const defaultColors = [
    "hsl(var(--primary))",
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            interval={timeRange === '1w' ? 23 : 11}
            tick={{ fontSize: 12 }}
            angle={timeRange !== '24h' ? -45 : 0}
            textAnchor={timeRange !== '24h' ? 'end' : 'middle'}
            height={timeRange !== '24h' ? 60 : 30}
          />
          <YAxis
            label={{ 
              value: 'Caffeine (mg)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 12 },
            }}
            domain={[0, 'auto']}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.length) {
                return (
                  <Card className="p-2">
                    <div className="text-sm">
                      <div>{payload[0].payload.time}</div>
                      {payload.map((entry: any) => (
                        <div key={entry.name} className="font-bold" style={{ color: entry.color }}>
                          {entry.name}: {Math.round(entry.value)}mg
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              }
              return null;
            }}
          />
          <Legend />
          <ReferenceLine
            x={currentTimeStr}
            stroke="hsl(var(--primary))"
            strokeDasharray="3 3"
            label={{
              value: "Now",
              position: "top",
              fill: "hsl(var(--primary))",
            }}
          />
          {intakes.map((intake, index) => {
            const drinkName = intake.drink?.name || `Drink ${index + 1}`;
            const color = intake.drink?.color || defaultColors[index % defaultColors.length];
            return (
              <Line
                key={index}
                type="monotone"
                dataKey={drinkName}
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}