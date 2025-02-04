import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function generateRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
}

export function AddDrinkModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [customColor, setCustomColor] = useState(generateRandomColor());
  const [customTime, setCustomTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });
  const { toast } = useToast();

  const { data: drinks } = useQuery({
    queryKey: ["/api/drinks"],
  });

  const addIntakeMutation = useMutation({
    mutationFn: async ({
      drinkId,
      amount,
      timestamp,
    }: {
      drinkId: number;
      amount: number;
      timestamp: string;
    }) => {
      await apiRequest("POST", "/api/intakes", { drinkId, amount, timestamp });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intakes"] });
      setOpen(false);
      toast({
        title: "Drink added",
        description: "Your caffeine intake has been logged.",
      });
    },
  });

  const addCustomDrinkMutation = useMutation({
    mutationFn: async ({
      name,
      caffeineAmount,
      color,
      timestamp,
    }: {
      name: string;
      caffeineAmount: number;
      color: string;
      timestamp: string;
    }) => {
      const drink = await apiRequest("POST", "/api/drinks", {
        name,
        caffeineAmount,
        color,
      }).then(res => res.json());

      await addIntakeMutation.mutateAsync({
        drinkId: drink.id,
        amount: caffeineAmount,
        timestamp,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drinks"] });
      setCustomName("");
      setCustomAmount("");
      setCustomColor(generateRandomColor());
      setCustomTime(() => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      });
    },
  });

  const handleAddExistingDrink = (drink: any) => {
    const now = new Date();
    const [hours, minutes] = customTime.split(':').map(Number);
    now.setHours(hours, minutes, 0, 0);

    addIntakeMutation.mutate({
      drinkId: drink.id,
      amount: drink.caffeineAmount,
      timestamp: now.toISOString(),
    });
  };

  const handleAddCustomDrink = () => {
    const now = new Date();
    const [hours, minutes] = customTime.split(':').map(Number);
    now.setHours(hours, minutes, 0, 0);

    addCustomDrinkMutation.mutate({
      name: customName,
      caffeineAmount: parseInt(customAmount),
      color: customColor,
      timestamp: now.toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Caffeine Intake</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-4">
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
            </div>

            <Label>Common Drinks</Label>
            <div className="grid gap-4">
              {drinks?.map((drink: any) => (
                <Button
                  key={drink.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleAddExistingDrink(drink)}
                  style={{
                    borderColor: drink.color,
                    borderWidth: '2px',
                  }}
                >
                  <span>{drink.name}</span>
                  <span className="text-muted-foreground">
                    {drink.caffeineAmount}mg
                  </span>
                </Button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <Label>Custom Drink</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Drink name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Caffeine amount (mg)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-16"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCustomColor(generateRandomColor())}
                    className="flex-1"
                  >
                    Random Color
                  </Button>
                </div>
                <Button
                  className="w-full"
                  onClick={handleAddCustomDrink}
                  disabled={!customName || !customAmount}
                >
                  Add Custom Drink
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}