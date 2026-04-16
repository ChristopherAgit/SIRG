using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;
using SIRG.Persistences.Repositories;

namespace SIRG.IOC.Dependencies
{
    public static class PersistenceDependency
    {
        public static void AddPersistenceDependencies(this IServiceCollection services, IConfiguration config)
        {
            #region Contexts
            if (config.GetValue<bool>("UseInMemoryDatabase"))
            {
                services.AddDbContext<SIRGContext>(opt => opt.UseInMemoryDatabase("Memory"));
            }
            else
            {
                var connectionString = config.GetConnectionString("ConnectionDb");
                services.AddDbContext<SIRGContext>(opt =>
                opt.UseNpgsql(connectionString,
                m => m.MigrationsAssembly(typeof(SIRGContext).Assembly.FullName)), 
                ServiceLifetime.Scoped);
            }

            #endregion
            services.AddScoped<ICategoriesRepository, CategoriesRepository>();
            services.AddScoped<ICustomersRepository, CustomersRepository>();
            services.AddScoped<IDishersRepository, DishersRepository>();
            services.AddScoped<IDishIngredientsRepository, DishIngredientsRepository>();
            services.AddScoped<IInventoryRepository, InventoryRepository>();
            services.AddScoped<IInventoryMovementsRepository, InventoryMovementsRepository>();
            services.AddScoped<IOrdersRepository, OrdersRepository>();
            services.AddScoped<IOrderDetailsRepository, OrdersDetailsRepository>();
            services.AddScoped<IOrderStatusRepository, OrdersStatusRepository>();
            services.AddScoped<IReservationsRepository, ReservationRepository>();
            services.AddScoped<IReservationStatusRepository, ReservationStatusRepository>();
            services.AddScoped<IRetaurantTableRepository, RetaurantTableRepository>();
            services.AddScoped<ISalesRepository, SaleRepository>();
            services.AddScoped<ISalesDetailsRepository, SalesDetailsRepository>();



        }
    }
}
