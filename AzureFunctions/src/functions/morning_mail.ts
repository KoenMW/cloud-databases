import { app, InvocationContext, Timer } from "@azure/functions";

export async function morning_mail(
  myTimer: Timer,
  context: InvocationContext,
): Promise<void> {
  context.log("Timer function processed request.");
}

app.timer("morning_mail", {
  schedule: "0 0 7 * * *",
  handler: morning_mail,
  runOnStartup: true,
});
