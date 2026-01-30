namespace CSharpApi.src.interfaces
{
    public interface IEntityBase
    {
        public int Id { get; set; }
        public ArgumentException? Validate();
    }
}