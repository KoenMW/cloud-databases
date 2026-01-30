using CSharpApi.src.model;
using CSharpApi.src.interfaces;

namespace CSharpApi.src.service
{
    public class HouseService(IHouseRepository repository) : IHouseService
    {
        private readonly IHouseRepository _repository = repository;

        public void CreateHouse(House house)
        {
            ArgumentException? validationError = house.Validate();
            if (validationError != null)
            {
                throw validationError;
            }

            _repository.Add(house);
        }

        public House? RetrieveHouseById(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Id is required.");
            }

            return _repository.GetById(id);
        }

        public List<House> RetrieveAllHouses()
        {
            return _repository.GetAll();
        }

        public List<House> RetrieveHousesByPriceRange(double minPrice, double maxPrice)
        {
            if (minPrice < 0 || maxPrice < 0)
            {
                throw new ArgumentException("Price values must be non-negative.");
            }
            if (minPrice > maxPrice)
            {
                throw new ArgumentException("Minimum price cannot be greater than maximum price.");
            }
            if (minPrice == maxPrice)
            {
                throw new ArgumentException("Minimum and maximum price cannot be the same.");
            }

            return _repository.GetHousesByPriceRange(minPrice, maxPrice);
        }

        public void ModifyHouse(House house)
        {
            ArgumentException? validationError = house.Validate();
            if (validationError != null)
            {
                throw validationError;
            }

            _repository.Update(house);
        }

        public void RemoveHouse(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Id is required.");
            }

            _repository.Delete(id);
        }
    }
}