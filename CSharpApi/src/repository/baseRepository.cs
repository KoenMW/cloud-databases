using CSharpApi.src.data;
using CSharpApi.src.interfaces;

namespace CSharpApi.src.repository
{
    public class BaseRepository<T>(EntityContext<T> context) : IBaseRepository<T> where T : class, IEntityBase, new()
    {
        protected EntityContext<T> _context = context;

        public virtual void Add(T entity)
        {
            _context.Entities.Add(entity);
            _context.SaveChanges();
        }

        public virtual T? GetById(int id)
        {
            return _context.Entities.Find(id);
        }

        public virtual List<T> GetAll()
        {
            return [.. _context.Entities];
        }

        public virtual void Update(T entity)
        {
            _context.Entities.Remove(entity);
            _context.Entities.Add(entity);
            _context.SaveChanges();
        }

        public virtual void Delete(int id)
        {
            var entity = _context.Entities.Find(id);
            if (entity != null)
            {
                _context.Entities.Remove(entity);
                _context.SaveChanges();
            }
        }
    }
}