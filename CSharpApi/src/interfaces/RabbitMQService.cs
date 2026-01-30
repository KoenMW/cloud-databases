using CSharpApi.src.model;

namespace CSharpApi.src.interfaces
{
    public interface IRabbitMQService
    {
        public Task SendMortgageAsync(MortgageOffer offer);
    }
}