using CSharpApi.src.model;

namespace CSharpApi.src.interfaces
{
    public interface IHouseService
    {
        void CreateHouse(House house);
        House? RetrieveHouseById(int id);

        List<House> RetrieveAllHouses();

        List<House> RetrieveHousesByPriceRange(double minPrice, double maxPrice);

        void ModifyHouse(House house);
        void RemoveHouse(int id);
    }
}