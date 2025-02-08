import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { AddDrinkModal } from "@/components/add-drink-modal";
import { Intake } from "@/pages/home";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

interface RecentIntakesProps {
  intakes: Intake[];
  onDeleteIntake: (id: number) => void;
}

export function RecentIntakes({ intakes, onDeleteIntake }: RecentIntakesProps) {
  const today = new Date();
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  const filterIntakes = (startDate: Date) => {
    return intakes.filter((intake) => new Date(intake.timestamp) >= startDate);
  };

  const renderIntakesList = (filteredIntakes: Intake[]) => (
    <div className="space-y-4">
      {filteredIntakes.map((intake) => (
        <div
          key={intake.id}
          className="flex items-center justify-between border-b pb-2"
        >
          <div>
            <div className="font-medium">
              {intake.drink?.name || "Custom Drink"}
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
                    Are you sure you want to delete this caffeine intake? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteIntake(intake.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
      {filteredIntakes.length === 0 && (
        <div className="text-center text-muted-foreground">
          Keine Einnahmen in diesem Zeitraum
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Einnahmen Historie</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Heute</TabsTrigger>
            <TabsTrigger value="week">7 Tage</TabsTrigger>
            <TabsTrigger value="month">30 Tage</TabsTrigger>
            <TabsTrigger value="all">Alle</TabsTrigger>
          </TabsList>
          <TabsContent value="today">
            {renderIntakesList(
              filterIntakes(new Date(today.setHours(0, 0, 0, 0)))
            )}
          </TabsContent>
          <TabsContent value="week">
            {renderIntakesList(filterIntakes(last7Days))}
          </TabsContent>
          <TabsContent value="month">
            {renderIntakesList(filterIntakes(lastMonth))}
          </TabsContent>
          <TabsContent value="all">{renderIntakesList(intakes)}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
