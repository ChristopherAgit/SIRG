using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIRG.Application.Interfaces.Contracts
{
    public interface IRestaurantTablesServices : IBaseServices<RestaurantTables, RestaurantTablesDto>
    {
    }
}
