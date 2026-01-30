namespace CSharpApi.src.model
{
    public class MortgageOffer
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal AnnualIncome { get; set; }
        public decimal LoanAmount { get; set; }
        public int LoanTermYears { get; set; }
    }
}