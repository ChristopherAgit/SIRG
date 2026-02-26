using AutoMapper;
using SIRG.Application.Dtos;
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
            #endregion
        }
    }
}
