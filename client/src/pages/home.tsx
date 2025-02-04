import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Plus, Pencil, Trash2 } from "lucide-react";
import { AddDrinkModal } from "@/components/add-drink-modal";
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
  const { data: intakes = [] } = useQuery({
    queryKey: ["/api/intakes"],
  });

  // Get all drinks
  const { data: drinks = [] } = useQuery({
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
            <MetabolismChart intakes={intakes} />
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
                    <div className="font-medium">
                      {intake.drink?.name || 'Custom Drink'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(intake.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-medium">{intake.amount}mg</div>
                    <AddDrinkModal editIntake={intake}>
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