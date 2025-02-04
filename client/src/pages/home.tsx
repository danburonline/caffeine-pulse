import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Plus, Pencil, Trash2, Mic } from "lucide-react";
import { AddDrinkModal } from "@/components/add-drink-modal";
import { SpeechToTextModal } from "@/components/speech-to-text-modal";
import { MetabolismChart } from "@/components/metabolism-chart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TimeRange = '24h' | '48h' | '72h' | '1w';

interface UserSettings {
  sleepStart: string;
  sleepEnd: string;
}

interface Drink {
  id: number;
  name: string;
  caffeineAmount: number;
  isCustom: boolean;
  userId: number | null;
  color?: string;
}

interface Intake {
  id: number;
  userId: number;
  drinkId: number;
  amount: number;
  timestamp: string;
  drink?: Drink;
}

export default function Home() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // Initialize default drinks
  const initDrinksMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/drinks/init");
    },
  });

  useEffect(() => {
    initDrinksMutation.mutate();
  }, []);

  // Get user settings for sleep time
  const { data: userSettings } = useQuery<UserSettings>({
    queryKey: ["/api/user"],
  });

  // Get recent intakes
  const { data: intakes = [] } = useQuery<Intake[]>({
    queryKey: ["/api/intakes"],
  });

  // Get all drinks
  const { data: drinks = [] } = useQuery<Drink[]>({
    queryKey: ["/api/drinks"],
  });

  // Delete intake mutation
  const deleteIntakeMutation = useMutation({
    mutationFn: async (intakeId: number) => {
      await apiRequest("DELETE", `/api/intakes/${intakeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intakes"] });
      toast({
        title: "Intake deleted",
        description: "The caffeine intake has been removed.",
      });
    },
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Coffee className="h-8 w-8 text-primary" />
            Caffeine Tracker
          </h1>
          <div className="flex gap-2">
            <SpeechToTextModal>
              <Button size="lg">
                <Mic className="mr-2 h-5 w-5" />
                Speech Input
              </Button>
            </SpeechToTextModal>
            <AddDrinkModal>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Drink
              </Button>
            </AddDrinkModal>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Metabolism Chart</CardTitle>
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as TimeRange)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="48h">Last 48 Hours</SelectItem>
                <SelectItem value="72h">Last 72 Hours</SelectItem>
                <SelectItem value="1w">Last Week</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <MetabolismChart
              intakes={intakes}
              timeRange={timeRange}
              sleepStart={userSettings?.sleepStart}
              sleepEnd={userSettings?.sleepEnd}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Intakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {intakes?.map((intake) => (
                <div
                  key={intake.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <div className="font-medium">
                      {intake.drink?.name || 'Custom Drink'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(intake.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-medium">{intake.amount}mg</div>
                    <AddDrinkModal editIntakeData={intake}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </AddDrinkModal>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Intake</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this caffeine intake? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteIntakeMutation.mutate(intake.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}