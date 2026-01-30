namespace CSharpApi.src.model
{
    public class House : EntityBase
    {

        public int NumberOfRooms { get; set; }

        public double SizeInSquareMeters { get; set; }
        public double Price { get; set; }

        public bool HasGarage { get; set; }

        public bool HasGarden { get; set; }
        public string? ImageUrl { get; set; }

        public override ArgumentException? Validate()
        {
            if (Price <= 0)
            {
                return new ArgumentException("Price must be greater than zero.");
            }
            if (NumberOfRooms <= 0)
            {
                return new ArgumentException("Number of rooms must be greater than zero.");
            }
            if (SizeInSquareMeters <= 0)
            {
                return new ArgumentException("Size in square meters must be greater than zero.");
            }
            return null;
        }
    }
}