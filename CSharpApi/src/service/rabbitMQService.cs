using CSharpApi.src.interfaces;
using CSharpApi.src.model;
using RabbitMQ.Client;

namespace CSharpApi.src.service
{
    public class RabbitMQService : IRabbitMQService
    {
        private readonly string queueName = Environment.GetEnvironmentVariable("QUEUE_NAME") ?? "mortgage";
        private IChannel? _channel;

        public async Task InitRabbitMQ()
        {
            string hostname = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
            ConnectionFactory factory = new() { HostName = hostname };
            IConnection connection = await factory.CreateConnectionAsync();
            IChannel channel = await connection.CreateChannelAsync();


            await channel.QueueDeclareAsync(queue: queueName, durable: true, exclusive: false, autoDelete: false,
                arguments: null);

            _channel = channel;
        }

        public async Task SendMortgageAsync(MortgageOffer offer)
        {
            if (_channel == null)
            {
                await InitRabbitMQ();
            }

            if (_channel == null)
            {
                throw new Exception("Failed to initialize RabbitMQ channel.");
            }

            string message = System.Text.Json.JsonSerializer.Serialize(offer);
            byte[] body = System.Text.Encoding.UTF8.GetBytes(message);

            await _channel.BasicPublishAsync(exchange: string.Empty, routingKey: queueName, body: body);
        }
    }
}