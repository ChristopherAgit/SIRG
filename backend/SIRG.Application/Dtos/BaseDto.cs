namespace SIRG.Application.Dtos
{
    public abstract class BaseDto<Type>
    {
        public abstract Type Id { get; set; }
    }
}
