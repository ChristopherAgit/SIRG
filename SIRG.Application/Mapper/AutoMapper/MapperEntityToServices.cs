using AutoMapper;
using SIRG.Application.Dtos;
using SIRG.Application.Dtos.EntitiesDto;
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
            CreateMap(typeof(ReservationStatus), typeof(ReservationStatusDto)).ReverseMap();
            CreateMap(typeof(SaleDetails), typeof(SaleDetailsDto)).ReverseMap();
            CreateMap(typeof(Sales), typeof(SalesDto)).ReverseMap();

            CreateMap<RestaurantTables, RestaurantTablesDto>()
                .ReverseMap()
                .ForMember(dest => dest.Reservations, opt => opt.Ignore());

            // Se puede hacer en la misma configuración usando ReverseMap, pero se muestra de esta forma para mayor claridad
            //CreateMap<RestaurantTablesDto, RestaurantTables>()
            //    .ForMember(dest => dest.Reservations, opt => opt.Ignore());

            CreateMap<Reservations, ReservationsDto>();
            CreateMap<ReservationsDto, Reservations>()
                .ForMember(dest => dest.RestaurantTables, opt => opt.Ignore())
                .ForMember(dest => dest.ReservationStatus, opt => opt.Ignore())
                .ForMember(dest => dest.Customers, opt => opt.Ignore())
                .ForMember(dest => dest.Orders, opt => opt.Ignore());

            CreateMap<Orders, OrdersDto>()
                .ReverseMap()
                .ForMember(dest => dest.Reservations, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDetails, opt => opt.Ignore())
                .ForMember(dest => dest.OrderStatus, opt => opt.Ignore());
            #endregion
        }
    }
}
