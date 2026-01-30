using CSharpApi.src.model;
using CSharpApi.src.interfaces;
using CSharpApi.src.data;

namespace CSharpApi.src.repository
{
    public class HouseRepository(EntityContext<House> context) : BaseRepository<House>(context), IHouseRepository
    {
        public List<House> GetHousesByPriceRange(double minPrice, double maxPrice)
        {
            return [.. _context.Entities.Where(house => house.Price >= minPrice && house.Price <= maxPrice)];
        }
    }
}