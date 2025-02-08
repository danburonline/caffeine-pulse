import { Card, CardContent } from "@/components/ui/card";

export function WelcomeCard() {
  return (
    <Card className="bg-white border-none drop-shadow-none">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-semibold mb-2">
          Willkommen bei deinem persönlichen Koffein-Tracker!
        </h2>
        <p className="text-muted-foreground">
          Behalte deinen Koffeinkonsum im Blick und optimiere deine Energie über
          den Tag.
        </p>
      </CardContent>
    </Card>
  );
}
