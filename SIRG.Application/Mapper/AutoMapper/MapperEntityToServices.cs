using AutoMapper;
using SIRG.Application.Dtos;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Domain.Base;

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

            CreateMap<RestaurantTables, RestaurantTablesDto>();
            CreateMap<RestaurantTablesDto, RestaurantTables>()
                .ForMember(dest => dest.Reservations, opt => opt.Ignore());

            CreateMap<Reservations, ReservationsDto>();
            CreateMap<ReservationsDto, Reservations>()
                .ForMember(dest => dest.RestaurantTables, opt => opt.Ignore())
                .ForMember(dest => dest.ReservationStatus, opt => opt.Ignore())
                .ForMember(dest => dest.Customers, opt => opt.Ignore())
                .ForMember(dest => dest.Orders, opt => opt.Ignore());
            #endregion
        }
    }
}
