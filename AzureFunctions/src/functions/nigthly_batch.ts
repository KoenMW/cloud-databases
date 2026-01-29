import { app, InvocationContext, Timer } from "@azure/functions";

export async function nigthly_batch(
  myTimer: Timer,
  context: InvocationContext,
): Promise<void> {
  context.log("Timer function processed request.");
}

app.timer("nigthly_batch", {
  schedule: "0 0 0 * * *", // {second} {minute} {hour} {day} {month} {day of week} // Every day at midnight: 0 0 0 * * *
  handler: nigthly_batch,
  runOnStartup: true,
});
