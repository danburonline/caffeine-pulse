import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

  useEffect(() => {
    const now = new Date();
    const dataPoints: { time: string; level: number }[] = [];

    // Generate data points for the last 24 hours
    for (let i = 0; i < 144; i++) {
      const time = new Date(now.getTime() - (24 * 60 * 60 * 1000) + (i * 10 * 60 * 1000));
      const level = calculateCaffeineLevel(intakes, time);
      
      dataPoints.push({
        time: time.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
        }),
        level: Math.round(level),
      });
    }

    setData(dataPoints);
  }, [intakes]);

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
