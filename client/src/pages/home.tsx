import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Plus } from "lucide-react";
import { AddDrinkModal } from "@/components/add-drink-modal";
import { MetabolismChart } from "@/components/metabolism-chart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const { toast } = useToast();

  // Initialize default drinks
  const initDrinksMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/drinks/init");
    },
  });

  useEffect(() => {
    initDrinksMutation.mutate();
  }, []);

  // Get recent intakes
  const { data: intakes } = useQuery({
    queryKey: ["/api/intakes"],
  });

  // Get all drinks
  const { data: drinks } = useQuery({
    queryKey: ["/api/drinks"],
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Coffee className="h-8 w-8 text-primary" />
            Caffeine Tracker
          </h1>
          <AddDrinkModal>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Drink
            </Button>
          </AddDrinkModal>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>24-Hour Metabolism</CardTitle>
          </CardHeader>
          <CardContent>
            <MetabolismChart intakes={intakes || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Intakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {intakes?.map((intake: any) => (
                <div
                  key={intake.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <div className="font-medium">{intake.drink.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(intake.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="font-medium">{intake.amount}mg</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
