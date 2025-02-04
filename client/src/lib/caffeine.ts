const HALF_LIFE = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

export function calculateCaffeineLevel(
  intakes: Array<{ amount: number; timestamp: string }>,
  currentTime: Date
): number {
  return intakes.reduce((total, intake) => {
    const intakeTime = new Date(intake.timestamp);
    const timeDiff = currentTime.getTime() - intakeTime.getTime();

    // If intake is in the future relative to current time, don't include it
    if (timeDiff < 0) {
      console.log('Ignoring future intake:', intake);
      return total;
    }

    // Calculate remaining caffeine using half-life formula: A = A₀ * (1/2)^(t/t₁/₂)
    // where A is the remaining amount, A₀ is the initial amount,
    // t is time elapsed, and t₁/₂ is the half-life
    const halfLives = timeDiff / HALF_LIFE;
    const remainingCaffeine = intake.amount * Math.pow(0.5, halfLives);

    // Round to avoid floating point errors and improve performance
    return total + Math.max(0, Math.round(remainingCaffeine));
  }, 0);
}
