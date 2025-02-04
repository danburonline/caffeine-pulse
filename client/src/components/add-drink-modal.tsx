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

export function AddDrinkModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const { toast } = useToast();

  const { data: drinks } = useQuery({
    queryKey: ["/api/drinks"],
  });

  const addIntakeMutation = useMutation({
    mutationFn: async ({
      drinkId,
      amount,
    }: {
      drinkId: number;
      amount: number;
    }) => {
      await apiRequest("POST", "/api/intakes", { drinkId, amount });
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
    }: {
      name: string;
      caffeineAmount: number;
    }) => {
      const drink = await apiRequest("POST", "/api/drinks", {
        name,
        caffeineAmount,
      });
      await addIntakeMutation.mutateAsync({
        drinkId: drink.id,
        amount: caffeineAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drinks"] });
      setCustomName("");
      setCustomAmount("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Caffeine Intake</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[300px] pr-4">
          <div className="grid gap-4">
            {drinks?.map((drink: any) => (
              <Button
                key={drink.id}
                variant="outline"
                className="w-full justify-between"
                onClick={() =>
                  addIntakeMutation.mutate({
                    drinkId: drink.id,
                    amount: drink.caffeineAmount,
                  })
                }
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
              <Button
                className="w-full"
                onClick={() =>
                  addCustomDrinkMutation.mutate({
                    name: customName,
                    caffeineAmount: parseInt(customAmount),
                  })
                }
                disabled={!customName || !customAmount}
              >
                Add Custom Drink
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
