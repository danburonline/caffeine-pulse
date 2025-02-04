import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const { data: user } = useQuery({ queryKey: ["/api/user"] });

  const form = useForm({
    defaultValues: {
      sleepStart: user?.sleepStart || "22:00",
      sleepEnd: user?.sleepEnd || "06:00",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (values: { sleepStart: string; sleepEnd: string }) => {
      await apiRequest("PATCH", "/api/user", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Settings saved",
        description: "Your sleep schedule has been updated.",
      });
    },
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Sleep Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => updateUserMutation.mutate(values))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="sleepStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sleepEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wake Up Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
