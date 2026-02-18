using SIRG.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIRG.Application.Dtos.EntitiesDto
{
    public class DishesDto
    {
        public required int DishID { get; set; }
        public required string CategoryID { get; set; }
        public required string DishName { get; set; }
        public decimal? Price { get; set; }
        public bool IsActive { get; set; }

        //Navigation property
        public CategoriesDto? CategoryDto { get; set; }
        public List<DishIngredientsDto>? DishIngredientsDto { get; set; }
        public List<OrderDetailsDto>? OrderDetailsDto { get; set; }
        public List<SaleDetailsDto>? SaleDetailsDto { get; set; }
    }
}
