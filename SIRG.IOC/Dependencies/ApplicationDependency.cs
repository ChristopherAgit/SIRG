using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SIRG.Application.Interfaces;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Application.Mapper.AutoMapper;
using SIRG.Application.Services;
using SIRG.Domain.Setting;
using SIRG.Shared.Services;
using AutoMapper;

namespace SIRG.IOC.Dependencies
{
    public static class ApplicationDependency
    {
        public static void AddApplicationDependencies(this IServiceCollection services, IConfiguration config)
        {
            services.AddAutoMapper(cfg => { }, typeof(ApplicationDependency).Assembly);
            services.AddAutoMapper(cfg => { }, typeof(MapperEntityToServices).Assembly);


            services.Configure<MailSettings>(config.GetSection("MailSettings"));

            #region Services
            services.AddTransient(typeof(IBaseServices<,>), typeof(BaseServices<,>));
            services.AddScoped<IRestaurantTablesServices, RestaurantTableServices>();
            services.AddScoped<IReservationsServices, ReservationsServices>();
            services.AddScoped<ICategoriesServices, CategoriesServices>();
            services.AddScoped<ICustomersServices, CustomersServices>();
            services.AddScoped<IDisherServices, DishesServices>();
            services.AddScoped<IInventoryServices, InventoryServices>();
            services.AddScoped<IInventoryMovementServices, InventoryMovementServices>();
            services.AddScoped<IOrdersServices, OrdersServices>();
            services.AddScoped<IOrderDetailsServices, OrdersDetailsServices>();
            services.AddScoped<IOrdersStatusServices, OrdersStatusServices>();
            services.AddScoped<IReservationStatusServices, ReservationStatusServices>();
            services.AddScoped<IRestaurantTablesServices, RestaurantTableServices>();
            services.AddScoped<ISalesServices, SaleServices>();
            services.AddScoped<ISaleDetailsServices, SaleDetailsServices>();

            services.AddScoped<IEmailService, EmailService>();



            #endregion
        }
    }
}
