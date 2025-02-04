const HALF_LIFE = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

export function calculateCaffeineLevel(
  intakes: Array<{ amount: number; timestamp: string }>,
  currentTime: Date
): number {
  return intakes.reduce((total, intake) => {
    const intakeTime = new Date(intake.timestamp);
    const timeDiff = currentTime.getTime() - intakeTime.getTime();
    
    // If intake is in the future relative to current time, ignore it
    if (timeDiff < 0) return total;
    
    // Calculate remaining caffeine using half-life formula
    const halfLives = timeDiff / HALF_LIFE;
    const remainingCaffeine = intake.amount * Math.pow(0.5, halfLives);
    
    return total + remainingCaffeine;
  }, 0);
}
