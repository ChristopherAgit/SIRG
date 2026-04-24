using AutoMapper;
using SIRG.Application.Dtos;
using SIRG.Application.Dtos.Categories;
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
            // Categories: DishesDto ignorado para evitar referencia circular Dishes→Category→Dishes
            CreateMap<Categories, CategoriesDto>()
                .ForMember(dest => dest.DishesDto, opt => opt.Ignore());
            CreateMap<CategoriesDto, Categories>()
                .ForMember(dest => dest.Dishes, opt => opt.Ignore());

            CreateMap<CreateCategoriesViewModel, CategoriesDto>()
                .ForMember(dest => dest.CategoryID, opt => opt.Ignore())
                .ForMember(dest => dest.DishesDto, opt => opt.Ignore()).ReverseMap();

            CreateMap<CreateCategoriesViewModel, Categories>()
            .ForMember(dest => dest.CategoryID, opt => opt.Ignore()) 
            .ForMember(dest => dest.Dishes, opt => opt.Ignore()).ReverseMap();     


            CreateMap(typeof(Customers), typeof(CustomersDto)).ReverseMap();
            CreateMap(typeof(Ingredients), typeof(IngredientsDto)).ReverseMap();
            CreateMap(typeof(InventoryMovements), typeof(InventoryMovementDto)).ReverseMap();
            CreateMap(typeof(Inventory), typeof(InventoryDto)).ReverseMap();
            CreateMap(typeof(ReservationStatus), typeof(ReservationStatusDto)).ReverseMap();
            CreateMap(typeof(SaleDetails), typeof(SaleDetailsDto)).ReverseMap();
            CreateMap(typeof(Sales), typeof(SalesDto)).ReverseMap();

            // Dishes: mapear CategoryDto desde Category; ignorar nav circulares restantes
            CreateMap<Dishes, DishesDto>()
                .ForMember(dest => dest.CategoryDto, opt => opt.MapFrom(src => src.Category))
                .ForMember(dest => dest.DishIngredientsDto, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDetailsDto, opt => opt.Ignore())
                .ForMember(dest => dest.SaleDetailsDto, opt => opt.Ignore());
            CreateMap<DishesDto, Dishes>()
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.DishIngredients, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDetails, opt => opt.Ignore())
                .ForMember(dest => dest.SaleDetails, opt => opt.Ignore());

            CreateMap<DishIngredients, DishIngredientsDto>()
                .ForMember(dest => dest.DishDto, opt => opt.Ignore())
                .ForMember(dest => dest.IngredientsDto, opt => opt.Ignore());
            CreateMap<DishIngredientsDto, DishIngredients>()
                .ForMember(dest => dest.Dish, opt => opt.Ignore())
                .ForMember(dest => dest.Ingredients, opt => opt.Ignore());

            // OrderDetails: ignorar nav circular de vuelta a Orders
            CreateMap<OrderDetails, OrdersDetailsDto>()
                .ForMember(dest => dest.Orders, opt => opt.Ignore())
                .ForMember(dest => dest.Dishes, opt => opt.MapFrom(src => src.Dishes));
            CreateMap<OrdersDetailsDto, OrderDetails>()
                .ForMember(dest => dest.Orders, opt => opt.Ignore())
                .ForMember(dest => dest.Dishes, opt => opt.Ignore());

            // Orders: ignorar nav circular de vuelta a Reservations
            CreateMap<Orders, OrdersDto>()
                .ForMember(dest => dest.ReservationsDto, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDetailsDto, opt => opt.MapFrom(src => src.OrderDetails))
                .ForMember(dest => dest.OrderStatusDto, opt => opt.MapFrom(src => src.OrderStatus));
            CreateMap<OrdersDto, Orders>()
                .ForMember(dest => dest.Reservations, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDetails, opt => opt.Ignore())
                .ForMember(dest => dest.OrderStatus, opt => opt.Ignore());

            // OrderStatus: ignorar nav circular a Orders
            CreateMap<OrderStatus, OrdersStatusDto>()
                .ForMember(dest => dest.Orders, opt => opt.Ignore());
            CreateMap<OrdersStatusDto, OrderStatus>()
                .ForMember(dest => dest.Orders, opt => opt.Ignore());

            CreateMap<RestaurantTables, RestaurantTablesDto>()
                .ForMember(dest => dest.Reservations, opt => opt.Ignore());
            CreateMap<RestaurantTablesDto, RestaurantTables>()
                .ForMember(dest => dest.Reservations, opt => opt.Ignore());

            CreateMap<Reservations, ReservationsDto>()
                .ForMember(dest => dest.CustomersDto, opt => opt.MapFrom(src => src.Customers))
                .ForMember(dest => dest.RestaurantTablesDto, opt => opt.MapFrom(src => src.RestaurantTables))
                .ForMember(dest => dest.ReservationStatusDto, opt => opt.MapFrom(src => src.ReservationStatus))
                .ForMember(dest => dest.OrdersDto, opt => opt.MapFrom(src => src.Orders));

            CreateMap<ReservationsDto, Reservations>()
                .ForMember(dest => dest.RestaurantTables, opt => opt.Ignore())
                .ForMember(dest => dest.ReservationStatus, opt => opt.Ignore())
                .ForMember(dest => dest.Customers, opt => opt.Ignore())
                .ForMember(dest => dest.Orders, opt => opt.Ignore());

            #endregion
        }
    }
}
