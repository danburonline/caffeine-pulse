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
    };
  }>;
}

export function MetabolismChart({ intakes }: Props) {
  const [data, setData] = useState<Array<{ time: string; [key: string]: number }>>([]);
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

    const dataPoints: Array<{ time: string; total: number; [key: string]: number }> = [];
    const startTime = currentTime;
    const endTime = new Date(startTime.getTime() + 16 * 60 * 60 * 1000); // 16 hours into future

    // Generate data points every 10 minutes
    for (let i = 0; i <= 96; i++) { // 96 points = 16 hours with 10-minute intervals
      const pointTime = new Date(startTime.getTime() + i * 10 * 60 * 1000);

      const point: { time: string; total: number; [key: string]: number } = {
        time: pointTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
        }),
        total: 0,
      };

      // Calculate levels for each intake
      intakes.forEach((intake, index) => {
        const drinkName = intake.drink?.name || `Drink ${index + 1}`;
        const level = calculateCaffeineLevelForIntake(intake, pointTime);
        point[drinkName] = level;
        point.total += level;
      });

      dataPoints.push(point);
    }

    console.log('Generated chart data points:', dataPoints);
    setData(dataPoints);
  }, [intakes, currentTime]);

  if (!intakes.length) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No caffeine intake data to display
      </div>
    );
  }

  const currentTimeStr = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Generate colors for each drink line
  const colors = [
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
            interval={23} // Show fewer time labels
            tick={{ fontSize: 12 }}
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
          {/* Line for each drink */}
          {intakes.map((intake, index) => {
            const drinkName = intake.drink?.name || `Drink ${index + 1}`;
            return (
              <Line
                key={index}
                type="monotone"
                dataKey={drinkName}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
              />
            );
          })}
          {/* Total line */}
          <Line
            type="monotone"
            dataKey="total"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            name="Total"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}