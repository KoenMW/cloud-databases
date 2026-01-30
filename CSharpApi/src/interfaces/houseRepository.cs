using CSharpApi.src.model;

namespace CSharpApi.src.interfaces
{
    public interface IHouseRepository : IBaseRepository<House>
    {
        List<House> GetHousesByPriceRange(double minPrice, double maxPrice);
    }
}