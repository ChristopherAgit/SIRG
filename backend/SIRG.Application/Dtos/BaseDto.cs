using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIRG.Application.Dtos
{
    public abstract class BaseDto<Type>
    {
        public abstract Type Id { get; set; }
    }
}
