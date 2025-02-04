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
} from "recharts";
import { Card } from "@/components/ui/card";
import { calculateCaffeineLevel } from "@/lib/caffeine";

interface Props {
  intakes: Array<{
    amount: number;
    timestamp: string;
  }>;
}

export function MetabolismChart({ intakes }: Props) {
  const [data, setData] = useState<Array<{ time: string; level: number }>>([]);
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

    const dataPoints: { time: string; level: number }[] = [];
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Generate data points every 10 minutes
    for (let i = 0; i <= 144; i++) {
      const pointTime = new Date(startTime.getTime() + i * 10 * 60 * 1000);
      const level = calculateCaffeineLevel(intakes, pointTime);

      dataPoints.push({
        time: pointTime.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
        }),
        level: Math.round(level),
      });
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

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            interval={23}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ 
              value: 'Caffeine (mg)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 12 },
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.length) {
                return (
                  <Card className="p-2">
                    <div className="text-sm">
                      <div>{payload[0].payload.time}</div>
                      <div className="font-bold">
                        {Math.round(payload[0].value as number)}mg
                      </div>
                    </div>
                  </Card>
                );
              }
              return null;
            }}
          />
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
          <Line
            type="monotone"
            dataKey="level"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}