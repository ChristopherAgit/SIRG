namespace SIRG.Domain.Base
{
    public abstract class BaseEntity<Type>
    {
        public abstract Type Id { get; set; }
    }
}
