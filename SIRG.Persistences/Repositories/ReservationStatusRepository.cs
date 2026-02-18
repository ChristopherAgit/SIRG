using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class ReservationStatusRepository : BaseRepository<ReservationStatus>, IReservationStatusRepository
    {
        private readonly SIRGContext _context;
        public ReservationStatusRepository(SIRGContext context) : base(context)
        {
            _context = context;
        }
    }
}
