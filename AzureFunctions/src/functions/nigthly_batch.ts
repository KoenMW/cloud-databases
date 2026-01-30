import { app, InvocationContext, Timer } from "@azure/functions";
import Connection, { ConsumerHandler } from "rabbitmq-client";
import { ensureTableExists, getDbClient } from "../lib/pg";
import { ProcessedMortgage } from "../lib/types";

const recordProcessedMessage = async (
  message: string,
  context: InvocationContext,
) => {
  const client = await getDbClient();
  try {
    await ensureTableExists();
    const data: ProcessedMortgage = JSON.parse(message);
    data.processed_at = new Date();
    data.accepted = Math.random() < 0.5;

    context.log(
      `Recording processed mortgage for ${data.FullName}, accepted: ${data.accepted}`,
    );
    await client.query(
      `
      INSERT INTO processed_mortgages
      (full_name, email, annual_income, loan_amount, loan_term_years, accepted)
      VALUES ($1, $2, $3, $4, $5, $6);
    `,
      [
        data.FullName,
        data.Email,
        data.AnnualIncome,
        data.LoanAmount,
        data.LoanTermYears,
        data.accepted,
      ],
    );
  } finally {
    client.release();
  }
};

const startupRabbitMQ = async (context: InvocationContext) => {
  const rabbit = new Connection("amqp://guest:guest@localhost:5672");
  rabbit.on("error", (err) => {
    context.log("RabbitMQ connection error", err);
  });
  rabbit.on("connection", () => {
    context.log("Connection successfully (re)established");
  });

  return rabbit;
};

const startupConsumer = async (
  context: InvocationContext,
  rabbit: Connection,
  cb: ConsumerHandler,
) => {
  const queue = process.env.RABBITMQ_QUEUE || "mortgage";
  const { messageCount } = await rabbit.queueDeclare({ queue, passive: true });

  const consumer = rabbit.createConsumer(
    {
      queue,
      queueOptions: { durable: true },
    },
    cb,
  );
  consumer.on("error", (err) => {
    context.log("Consumer error", err);
  });

  return { consumer, messageCount };
};

const processQueueMessages = async (context: InvocationContext) => {
  const rabbit = await startupRabbitMQ(context);
  let processedCount = 0;
  let lastMessageAt = Date.now();

  const cb: ConsumerHandler = async (msg) => {
    lastMessageAt = Date.now();
    try {
      await recordProcessedMessage(msg.body.toString(), context);
    } catch (err) {
      context.log("Error processing message:", err);
    } finally {
      processedCount++;
    }
  };

  const { consumer } = await startupConsumer(context, rabbit, cb);

  consumer.start();
  context.log("Consumer started");

  const IDLE_TIMEOUT_MS = 1000;

  while (Date.now() - lastMessageAt < IDLE_TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, 100));
  }

  await consumer.close();
  await rabbit.close();

  context.log(`Snapshot complete. Processed ${processedCount} messages.`);
};

export async function nigthly_batch(
  _: Timer,
  context: InvocationContext,
): Promise<void> {
  context.log("Nightly batch function started at:", new Date().toISOString());

  try {
    await processQueueMessages(context);
    context.log(
      "Nightly batch function completed successfully at:",
      new Date().toISOString(),
    );
  } catch (error) {
    context.error("Error in nightly batch function:", error);
  }
}

app.timer("nigthly_batch", {
  schedule: !!process.env.TESTING ? "0 */2 * * * *" : "0 0 0 * * *", // {second} {minute} {hour} {day} {month} {day of week}
  handler: nigthly_batch,
});
