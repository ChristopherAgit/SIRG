using AutoMapper;
using SIRG.Application.Dtos;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Dtos.Login;
using SIRG.Application.Services;
using SIRG.Domain.Base;
using SIRG.Domain.Entities;

namespace SIRG.Application.Mapper.AutoMapper
{
    public class MapperEntityToServices : Profile
    {
        public MapperEntityToServices()
        {
            #region Base Entity
            CreateMap(typeof(BaseDto<>), typeof(BaseEntity<>)).ReverseMap();
            #endregion

            #region Mapper entity to Dto
            CreateMap(typeof(Categories), typeof(CategoriesDto)).ReverseMap();
            CreateMap(typeof(Customers), typeof(CustomersDto)).ReverseMap();
            CreateMap(typeof(Dishes), typeof(DishesDto)).ReverseMap();
            CreateMap(typeof(DishIngredients), typeof(DishIngredientsDto)).ReverseMap();
            CreateMap(typeof(Ingredients), typeof(IngredientsDto)).ReverseMap();
            CreateMap(typeof(InventoryMovements), typeof(InventoryMovementDto)).ReverseMap();
            CreateMap(typeof(Inventory), typeof(InventoryDto)).ReverseMap();
            CreateMap(typeof(OrderDetails), typeof(OrdersDetailsDto)).ReverseMap();
            CreateMap(typeof(Orders), typeof(OrdersDto)).ReverseMap();
            CreateMap(typeof(OrderStatus), typeof(OrdersStatusDto)).ReverseMap();
            CreateMap(typeof(Reservations), typeof(ReservationsDto)).ReverseMap();
            CreateMap(typeof(ReservationStatus), typeof(ReservationStatusDto)).ReverseMap();
            CreateMap(typeof(RestaurantTables), typeof(RestaurantTablesDto)).ReverseMap();
            CreateMap(typeof(SaleDetails), typeof(SaleDetailsDto)).ReverseMap();
            CreateMap(typeof(Sales), typeof(SalesDto)).ReverseMap();


            #endregion
        }
    }
}
