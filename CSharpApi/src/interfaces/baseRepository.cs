namespace CSharpApi.src.interfaces
{

    public interface IBaseRepository<T> where T : class, IEntityBase
    {
        void Add(T entity);
        T? GetById(int id);
        List<T> GetAll();
        void Update(T entity);
        void Delete(int id);

    }
}