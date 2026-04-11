using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class ReservationRepository : BaseRepository<Reservations>, IReservationsRepository
    {
        private readonly SIRGContext _context;
        public ReservationRepository(SIRGContext context) : base(context)
        {
            _context = context;
        }
    }
}
