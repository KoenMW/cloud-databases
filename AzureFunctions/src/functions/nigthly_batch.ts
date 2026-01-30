import { app, InvocationContext, Timer } from "@azure/functions";
import Connection, { ConsumerHandler } from "rabbitmq-client";

const startupRabbitMQ = async (context: InvocationContext) => {
  const rabbit = new Connection("amqp://guest:guest@localhost:5672");
  rabbit.on("error", (err) => {
    console.log("RabbitMQ connection error", err);
  });
  rabbit.on("connection", () => {
    console.log("Connection successfully (re)established");
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

  const cb: ConsumerHandler = async (msg) => {
    try {
      context.log("Processing message:", msg.toString());
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      context.log("Error processing message:", error);
    } finally {
      processedCount++;
    }
  };

  const { consumer, messageCount } = await startupConsumer(context, rabbit, cb);

  context.log("Consumer started, waiting for messages...");

  consumer.start();

  // Wait until all messages are processed
  while (processedCount < messageCount) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    context.log(`Processed ${processedCount} of ${messageCount} messages...`);
  }

  consumer.close();
  context.log("All messages processed.");
};

export async function nigthly_batch(
  myTimer: Timer,
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
  schedule: "0 * * * * *", // {second} {minute} {hour} {day} {month} {day of week} // Every day at midnight: 0 0 0 * * *
  handler: nigthly_batch,
  runOnStartup: true,
});
