const HALF_LIFE = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

export function calculateCaffeineLevelForIntake(
  intake: { amount: number; timestamp: string },
  currentTime: Date
): number {
  const intakeTime = new Date(intake.timestamp);
  const timeDiff = currentTime.getTime() - intakeTime.getTime();

  // If intake is in the future relative to current time, don't include it
  if (timeDiff < 0) {
    return 0;
  }

  // Calculate remaining caffeine using half-life formula: A = A₀ * (1/2)^(t/t₁/₂)
  const halfLives = timeDiff / HALF_LIFE;
  const remainingCaffeine = intake.amount * Math.pow(0.5, halfLives);

  // Round to avoid floating point errors and improve performance
  return Math.max(0, Math.round(remainingCaffeine));
}

export function calculateCaffeineLevel(
  intakes: Array<{ amount: number; timestamp: string }>,
  currentTime: Date
): number {
  return intakes.reduce((total, intake) => {
    return total + calculateCaffeineLevelForIntake(intake, currentTime);
  }, 0);
}