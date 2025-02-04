const HALF_LIFE = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

export function calculateCaffeineLevel(
  intakes: Array<{ amount: number; timestamp: string }>,
  currentTime: Date
): number {
  // Add logging for debugging
  console.log('Calculating caffeine level at:', currentTime, 'with intakes:', intakes);

  return intakes.reduce((total, intake) => {
    const intakeTime = new Date(intake.timestamp);
    const timeDiff = currentTime.getTime() - intakeTime.getTime();

    // If intake is in the future relative to current time, ignore it
    if (timeDiff < 0) {
      console.log('Ignoring future intake:', intake);
      return total;
    }

    // Calculate remaining caffeine using half-life formula
    const halfLives = timeDiff / HALF_LIFE;
    const remainingCaffeine = intake.amount * Math.pow(0.5, halfLives);

    console.log('Intake:', intake, 'Remaining caffeine:', remainingCaffeine);

    return total + remainingCaffeine;
  }, 0);
}