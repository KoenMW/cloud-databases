using Microsoft.EntityFrameworkCore;
using CSharpApi.src.interfaces;

namespace CSharpApi.src.data
{
    public class EntityContext<T> : DbContext where T : class, IEntityBase
    {
        public DbSet<T> Entities => Set<T>();


        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            var conn =
                Environment.GetEnvironmentVariable("POSTGRES_CONNECTION")
                ?? "Host=localhost;Port=5432;Database=buy_my_house;Username=postgres;Password=postgres";

            options.UseNpgsql(conn);

            base.OnConfiguring(options);
        }
    }
}
