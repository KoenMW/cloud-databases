import { app, InvocationContext, Timer } from "@azure/functions";
import Connection from "rabbitmq-client";

const rabbit = new Connection("amqp://guest:guest@localhost:5672");
rabbit.on("error", (err) => {
  console.log("RabbitMQ connection error", err);
});
rabbit.on("connection", () => {
  console.log("Connection successfully (re)established");
});

const consumer = rabbit.createConsumer(
  {
    queue: process.env.RABBITMQ_QUEUE || "default_queue",
    queueOptions: { durable: true },
  },
  async (msg) => {
    console.log("received message", msg);
  },
);

consumer.on("error", (err) => {
  console.log("Consumer error", err);
});

const processQueueMessages = async () => {
  // get queue count
  const queue = process.env.RABBITMQ_QUEUE || "default_queue";
  const { messageCount } = await rabbit.queueDeclare({ queue, passive: true });
  let processedCount = 0;

  const consumer = rabbit.createConsumer(
    {
      queue,
      queueOptions: { durable: true },
    },
    async (msg) => {
      console.log("Processing message:", msg);
      // Simulate message processing
      await new Promise((resolve) => setTimeout(resolve, 100));
      processedCount++;
      console.log(`Processed ${processedCount}/${messageCount} messages`);
    },
  );
  consumer.on("error", (err) => {
    console.log("Consumer error", err);
  });

  consumer.start();

  await new Promise<void>((resolve) => {
    while (processedCount < messageCount) {
      continue;
    }
    resolve();
  });
  await consumer.close();
};

export async function nigthly_batch(
  myTimer: Timer,
  context: InvocationContext,
): Promise<void> {
  context.log("Nightly batch function started at:", new Date().toISOString());

  try {
    await processQueueMessages();
    context.log(
      "Nightly batch function completed successfully at:",
      new Date().toISOString(),
    );
  } catch (error) {
    context.error("Error in nightly batch function:", error);
  }
}

app.timer("nigthly_batch", {
  schedule: "0 0 0 * * *", // {second} {minute} {hour} {day} {month} {day of week} // Every day at midnight: 0 0 0 * * *
  handler: nigthly_batch,
  runOnStartup: true,
});
