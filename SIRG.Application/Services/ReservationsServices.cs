using System;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Dtos.Emails;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Application.Interfaces;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class ReservationsServices
        : BaseServices<Reservations, ReservationsDto>, IReservationsServices
    {
        private readonly IReservationsRepository _reservationRepository;
        private readonly IRetaurantTableRepository _tableRepository;
        private readonly IEmailService _emailService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public ReservationsServices(IReservationsRepository reservationRepository,
                                    IRetaurantTableRepository tableRepository,
                                    IEmailService emailService,
                                    IMapper mapper,
                                    IConfiguration configuration) : base(reservationRepository, mapper)
        {
            _reservationRepository = reservationRepository;
            _tableRepository = tableRepository;
            _emailService = emailService;
            _mapper = mapper;
            _configuration = configuration;
        }

        

        public async Task<ReservationsDto?> SaveReservationAsync(ReservationsDto dto)
        {
            // Validación: permitir reservas el mismo día solo si se realizan
            // con al menos 2 horas de anticipación respecto al tiempo del servidor.
            try
            {
                var reservationDateTime = dto.ReservationDate.ToDateTime(dto.ReservationTime);
                // Tratar la fecha/hora como hora local del servidor para la comparación
                reservationDateTime = DateTime.SpecifyKind(reservationDateTime, DateTimeKind.Local);
                var nowLocal = DateTime.Now;

                if (reservationDateTime <= nowLocal)
                    throw new Exception("La fecha/hora de la reserva debe ser en el futuro.");

                var diff = reservationDateTime - nowLocal;
                if (diff < TimeSpan.FromHours(2))
                    throw new Exception("Debe reservar con al menos 2 horas de anticipación.");
            }
            catch (Exception ex) when (!(ex is NullReferenceException))
            {
                // Re-lanzar excepciones de validación para que el controlador las devuelva al usuario
                throw;
            }

            var table = await _tableRepository.GetEntityByIdAsync(dto.TableID);

            if (table == null)
                throw new Exception("La mesa no existe.");

            if (!table.IsActive)
                throw new Exception("La mesa está inactiva.");

            if (dto.NumberOfPeople > table.Capacity)
                throw new Exception("La cantidad de personas excede la capacidad.");

            bool conflict = await _reservationRepository.GetAllQuerry()
                .AnyAsync(r =>
                    r.TableID == dto.TableID &&
                    r.ReservationDate == dto.ReservationDate &&
                    r.ReservationTime == dto.ReservationTime &&
                    (r.StatusID == 1 || r.StatusID == 2));

            if (conflict)
                throw new Exception("Ya existe una reserva activa para esa mesa.");

            // Evitar que la misma persona (por teléfono o email) haga otra reserva
            // en la misma fecha y hora.
            if (dto.CustomersDto != null)
            {
                var phone = dto.CustomersDto.Phone?.Trim();
                var email = dto.CustomersDto.Email?.Trim().ToLower();

                if (!string.IsNullOrEmpty(phone) || !string.IsNullOrEmpty(email))
                {
                    bool samePerson = await _reservationRepository.GetAllQuerry()
                        .Include(r => r.Customers)
                        .AnyAsync(r =>
                            r.ReservationDate == dto.ReservationDate &&
                            r.ReservationTime == dto.ReservationTime &&
                            (r.StatusID == 1 || r.StatusID == 2) &&
                            ( (phone != null && r.Customers != null && r.Customers.Phone == phone) ||
                              (email != null && r.Customers != null && r.Customers.Email != null && r.Customers.Email.ToLower() == email) )
                        );

                    if (samePerson)
                        throw new Exception("Ya existe una reserva para esta persona en la misma fecha y hora.");
                }
            }

            dto.CreatedAt = DateTime.UtcNow;
            // Generar token único para confirmación
            dto.ConfirmationToken = Guid.NewGuid().ToString();

            if (dto.StatusID == 0)
                dto.StatusID = 1;

            var entity = _mapper.Map<Reservations>(dto);

            // Si el cliente fue provisto en el DTO, crear la entidad Customers
            // y asociarla a la reserva para evitar violaciones de FK si la columna
            // espera un valor o para persistir la información del cliente.
            if (dto.CustomersDto != null)
            {
                entity.Customers = new Customers
                {
                    // CustomerID is declared as 'required' in the domain model; set to 0
                    // to satisfy the compiler — EF will treat this as a new entity.
                    CustomerID = 0,
                    FullName = dto.CustomersDto.FullName,
                    Email = dto.CustomersDto.Email,
                    Phone = dto.CustomersDto.Phone,
                    CreatedAt = dto.CustomersDto.CreatedAt.HasValue
                        ? DateTime.SpecifyKind(dto.CustomersDto.CreatedAt.Value, DateTimeKind.Utc)
                        : DateTime.UtcNow
                };
            }

            var saved = await _reservationRepository.SaveEntityAsync(entity);

            var resultDto = _mapper.Map<ReservationsDto>(saved);

            // 📧 Enviar email de confirmación si el cliente proporcionó correo
            if (!string.IsNullOrEmpty(dto.CustomersDto?.Email))
            {
                try
                {
                    // Preferir el número de mesa recuperado desde la entidad guardada si está disponible
                    var tableNumberForEmail = saved.RestaurantTables?.TableNumber ?? table.TableNumber;

                    var emailBody = GenerateReservationConfirmationEmail(
                        customerName: dto.CustomersDto.FullName,
                        reservationDate: dto.ReservationDate,
                        reservationTime: dto.ReservationTime,
                        numberOfPeople: dto.NumberOfPeople,
                        reservationId: saved.ReservationID,
                        tableNumber: tableNumberForEmail,
                        confirmationToken: dto.ConfirmationToken
                    );

                    var emailRequest = new EmailRequestDto
                    {
                        To = dto.CustomersDto.Email,
                        Subject = "Confirmación de Reserva - Constantinopla",
                        HtmlBody = emailBody
                    };

                    await _emailService.SendAsync(emailRequest);
                }
                catch (Exception ex)
                {
                    // Log pero no fallar la reserva si falla el email
                    Console.WriteLine($"Error al enviar email de confirmación: {ex.Message}");
                }
            }

            return resultDto;
        }

        /// <summary>
        /// Genera el HTML del email de confirmación de reserva
        /// </summary>
        private string GenerateReservationConfirmationEmail(
            string customerName,
            DateOnly reservationDate,
            TimeOnly reservationTime,
            int numberOfPeople,
            int reservationId,
            int tableNumber,
            string confirmationToken)
        {
            var dateFormatted = reservationDate.ToString("dd/MM/yyyy");
            var timeFormatted = reservationTime.ToString("HH:mm");

            // Obtener base URL desde configuración. Preferimos `FrontendUrl` (enlaces hacia la UI),
            // caer a `ApiBaseUrl` si no está presente, y finalmente usar la URL de producción.
            var configuredBase = _configuration?.GetValue<string>("FrontendUrl")?.TrimEnd('/');
            if (string.IsNullOrEmpty(configuredBase))
            {
                configuredBase = _configuration?.GetValue<string>("ApiBaseUrl")?.TrimEnd('/') ?? "https://constantinopla.onrender.com";
            }

            var baseUrl = configuredBase;
            var confirmUrl = $"{baseUrl}/reservas/confirm/{confirmationToken}?rid={reservationId}";
            var cancelUrl = $"{baseUrl}/reservas/cancel/{confirmationToken}?rid={reservationId}";

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 20px auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 20px; }}
        .header h1 {{ color: #7c3aed; margin: 0; font-size: 28px; }}
        .content {{ color: #333; line-height: 1.6; }}
        .content p {{ margin: 10px 0; }}
        .reservation-details {{ background-color: #f9f9f9; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0; border-radius: 4px; }}
        .detail-item {{ margin: 10px 0; }}
        .detail-label {{ font-weight: bold; color: #7c3aed; }}
        .action-buttons {{ text-align: center; margin: 30px 0; }}
        .btn {{ display: inline-block; padding: 12px 30px; margin: 10px 5px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; }}
        .btn-confirm {{ background-color: #22c55e; color: white; }}
        .btn-cancel {{ background-color: #ef4444; color: white; }}
        .btn:hover {{ opacity: 0.9; }}
        .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }}
        .pending-badge {{ display: inline-block; background-color: #f59e0b; color: white; padding: 10px 20px; border-radius: 4px; margin: 20px 0; font-weight: bold; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🍽️ Reserva Pendiente de Confirmar</h1>
        </div>
        
        <div class='content'>
            <p>Estimado(a) <strong>{customerName}</strong>,</p>
            
            <p>Tu reserva ha sido registrada en <strong>Constantinopla</strong>. Ahora necesitamos que <strong>confirmes tu asistencia</strong> haciendo clic en el botón de abajo.</p>
            
            <div class='pending-badge'>⏳ Pendiente de Confirmación</div>
            
            <div class='reservation-details'>
                <h3 style='color: #7c3aed; margin-top: 0;'>Detalles de tu Reserva:</h3>
                
                <div class='detail-item'>
                    <span class='detail-label'>📅 Fecha:</span> {dateFormatted}
                </div>
                
                <div class='detail-item'>
                    <span class='detail-label'>🕐 Hora:</span> {timeFormatted}
                </div>
                
                <div class='detail-item'>
                    <span class='detail-label'>👥 Número de Personas:</span> {numberOfPeople} {(numberOfPeople == 1 ? "persona" : "personas")}
                </div>
                
                <div class='detail-item'>
                    <span class='detail-label'>🪑 Mesa Asignada:</span> Mesa #{tableNumber}
                </div>
            </div>

            <div style='margin: 20px 0; padding: 18px; background-color: #f0e6ff; border-radius: 8px; text-align: center; border: 2px dashed #7c3aed;'>
                <p style='margin: 0 0 6px 0; color: #5b21b6; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;'>🎫 Código de tu reserva</p>
                <p style='margin: 0; font-size: 36px; font-weight: 900; color: #7c3aed; letter-spacing: 6px;'>#{reservationId}</p>
                <p style='margin: 8px 0 0 0; color: #666; font-size: 12px;'>Muestra este código al mesero cuando llegues al restaurante</p>
            </div>

            <p><strong>¿Qué debo hacer ahora?</strong></p>
            <ul>
                <li>✓ <strong>Confirma tu reserva</strong> haciendo clic en el botón ""Confirmar Reserva"" abajo</li>
                <li>✓ Si no puedes asistir, haz clic en ""Cancelar Reserva""</li>
                <li>✓ Te recomendamos llegar 10-15 minutos antes de tu hora</li>
            </ul>
            
            <div class='action-buttons'>
                <a href='{confirmUrl}' class='btn btn-confirm'>✓ Confirmar Reserva</a>
                <a href='{cancelUrl}' class='btn btn-cancel'>✕ Cancelar Reserva</a>
            </div>
            
            <p style='text-align: center; color: #999; font-size: 12px;'>O copia y pega este link en tu navegador:<br><code style='background: #f0f0f0; padding: 2px 6px;'>{confirmUrl}</code></p>
            
            <p>Si tienes dudas, contáctanos directamente.</p>
            
            <p>¡Esperamos verte pronto en <strong>Constantinopla</strong>!</p>
            
            <p>Cordialmente,<br><strong>El equipo de Constantinopla</strong></p>
        </div>
        
        <div class='footer'>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>&copy; 2026 Constantinopla - Restaurante. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>";
        }

        public async Task<ReservationsDto?> UpdateReservationAsync(int id, ReservationsDto dto)
        {
            var current = await _reservationRepository.GetEntityByIdAsync(id);

            if (current == null)
                return null;

            // Validar tabla existe y está activa
            var table = await _tableRepository.GetEntityByIdAsync(dto.TableID);

            if (table == null)
                throw new Exception("La mesa no existe.");

            if (!table.IsActive)
                throw new Exception("La mesa está inactiva.");

            // Revalidar capacidad si cambió el número de personas
            if (dto.NumberOfPeople > table.Capacity)
                throw new Exception("La cantidad de personas excede la capacidad.");

            bool conflict = await _reservationRepository.GetAllQuerry()
                .AnyAsync(r =>
                    r.ReservationID != id &&
                    r.TableID == dto.TableID &&
                    r.ReservationDate == dto.ReservationDate &&
                    r.ReservationTime == dto.ReservationTime &&
                    (r.StatusID == 1 || r.StatusID == 2));

            if (conflict)
                throw new Exception("Ya existe una reserva activa para esa mesa.");

            dto.ReservationID = id;
            dto.CreatedAt = current.CreatedAt;

            var entity = _mapper.Map<Reservations>(dto);

            var updated = await _reservationRepository.UpdateEntityAsync(id, entity);

            return _mapper.Map<ReservationsDto>(updated);
        }

        public async Task<bool> CancelReservationAsync(int id)
        {
            var reservation = await _reservationRepository.GetEntityByIdAsync(id);

            if (reservation == null)
                return false;

            reservation.StatusID = 3;

            var updated = await _reservationRepository.UpdateEntityAsync(id, reservation);

            return updated != null;
        }

        public async Task<bool> UpdateReservationStatusAsync(int id, int statusId)
        {
            var reservation = await _reservationRepository.GetEntityByIdAsync(id);

            if (reservation == null)
                return false;

            reservation.StatusID = statusId;

            var updated = await _reservationRepository.UpdateEntityAsync(id, reservation);

            return updated != null;
        }

        public async Task<List<ReservationsDto>> GetAllReservationsAsync(DateOnly? date = null, TimeOnly? time = null, int? statusId = null, string? reservationType = null)
        {
            var query = _reservationRepository.GetAllQuerry()
                .Include(r => r.RestaurantTables)
                .Include(r => r.ReservationStatus)
                .Include(r => r.Customers)
                .AsQueryable();

            if (date.HasValue)
                query = query.Where(r => r.ReservationDate == date.Value);

            if (time.HasValue)
                query = query.Where(r => r.ReservationTime == time.Value);

            if (statusId.HasValue)
                query = query.Where(r => r.StatusID == statusId.Value);

            // reservationType parameter present in interface for future filtering; currently unused

            try
            {
                return await query
                    .ProjectTo<ReservationsDto>(_mapper.ConfigurationProvider)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                // Log and return empty list on mapping/database projection errors
                Console.WriteLine($"Error obteniendo reservaciones: {ex}");
                return new List<ReservationsDto>();
            }
        }

        public async Task<ReservationsDto?> GetReservationWithDetailsById(int id)
        {
            var query = _reservationRepository.GetAllQuerry()
                .Include(r => r.RestaurantTables)
                .Include(r => r.ReservationStatus)
                .Include(r => r.Customers)
                .Include(r => r.Orders!).ThenInclude(o => o.OrderDetails)
                .AsQueryable();

            var entity = await query.FirstOrDefaultAsync(r => r.ReservationID == id);

            if (entity == null) return null;

            return _mapper.Map<ReservationsDto>(entity);
        }

        /// <summary>
        /// Obtiene las mesas disponibles para una fecha, hora y número de personas.
        /// Filtra por: capacidad >= numberOfPeople, estado activo, sin reservas activas en esa fecha/hora.
        /// </summary>
        public async Task<List<RestaurantTablesDto>> GetAvailableTablesAsync(DateOnly date, TimeOnly time, int numberOfPeople)
        {
            // Obtener IDs de mesas ocupadas en esa fecha/hora (reservas activas: StatusID 1 o 2)
            var occupiedTableIds = await _reservationRepository.GetAllQuerry()
                .Where(r =>
                    r.ReservationDate == date &&
                    r.ReservationTime == time &&
                    (r.StatusID == 1 || r.StatusID == 2))
                .Select(r => r.TableID)
                .Distinct()
                .ToListAsync();

            // Obtener mesas disponibles: activas, con capacidad suficiente, no ocupadas
            var availableTables = await _tableRepository.GetAllQuerry()
                .Where(t =>
                    t.IsActive &&
                    t.Capacity >= numberOfPeople &&
                    !occupiedTableIds.Contains(t.TableID))
                .OrderBy(t => t.Capacity) // Mostrar primero las más pequeñas que caben
                .ProjectTo<RestaurantTablesDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return availableTables;
        }

        /// <summary>
        /// Confirma una reserva por token (desde el email del cliente)
        /// Actualiza el estado a "Confirmada" (StatusID = 2)
        /// </summary>
        public async Task<ReservationsDto?> ConfirmReservationByTokenAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
                return null;

            var reservation = await _reservationRepository.GetAllQuerry()
                .Include(r => r.Customers)
                .Include(r => r.RestaurantTables)
                .FirstOrDefaultAsync(r => r.ConfirmationToken == token);

            if (reservation == null)
                return null;

            // Actualizar estado a Confirmada
            reservation.StatusID = 2; // Confirmada
            reservation.IsConfirmed = true;
            reservation.ConfirmedAt = DateTime.UtcNow;

            await _reservationRepository.UpdateEntityAsync(reservation.ReservationID, reservation);

            // Enviar email informando que la reserva fue confirmada
            try
            {
                if (!string.IsNullOrEmpty(reservation.Customers?.Email))
                {
                    var emailBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 20px auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; border-bottom: 3px solid #22c55e; padding-bottom: 20px; margin-bottom: 20px; }}
        .header h1 {{ color: #22c55e; margin: 0; font-size: 28px; }}
        .content {{ color: #333; line-height: 1.6; }}
        .content p {{ margin: 10px 0; }}
        .success-badge {{ display: inline-block; background-color: #22c55e; color: white; padding: 10px 20px; border-radius: 4px; margin: 20px 0; font-weight: bold; }}
        .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>✓ ¡Reserva Confirmada!</h1>
        </div>
        
        <div class='content'>
            <p>Estimado(a) <strong>{reservation.Customers.FullName}</strong>,</p>
            
            <p>¡Excelente! Tu reserva ha sido <strong>confirmada exitosamente</strong>.</p>
            
            <div class='success-badge'>✓ Reserva Confirmada</div>
            
            <div style='margin: 16px 0; padding: 16px; background-color: #f0fdf4; border-radius: 8px; text-align: center; border: 2px dashed #22c55e;'>
                <p style='margin: 0 0 6px 0; color: #16a34a; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;'>🎫 Código de tu reserva</p>
                <p style='margin: 0; font-size: 36px; font-weight: 900; color: #16a34a; letter-spacing: 6px;'>#{reservation.ReservationID}</p>
                <p style='margin: 8px 0 0 0; color: #666; font-size: 12px;'>Muestra este código al mesero cuando llegues al restaurante</p>
            </div>

            <p><strong>Detalles de tu Reserva:</strong></p>
            <ul>
                <li>📅 Fecha: {reservation.ReservationDate:dd/MM/yyyy}</li>
                <li>🕐 Hora: {reservation.ReservationTime:HH:mm}</li>
                <li>👥 Personas: {reservation.NumberOfPeople}</li>
                <li>🪑 Mesa: #{reservation.RestaurantTables?.TableNumber}</li>
            </ul>

            <p>Te recomendamos llegar 10-15 minutos antes de tu hora.</p>
            
            <p>¡Te esperamos en <strong>Constantinopla</strong>!</p>
            
            <p>Cordialmente,<br><strong>El equipo de Constantinopla</strong></p>
        </div>
        
        <div class='footer'>
            <p>&copy; 2026 Constantinopla - Restaurante. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>";

                    var emailRequest = new EmailRequestDto
                    {
                        To = reservation.Customers.Email,
                        Subject = "✓ Reserva Confirmada - Constantinopla",
                        HtmlBody = emailBody
                    };

                    await _emailService.SendAsync(emailRequest);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al enviar email de confirmación: {ex.Message}");
            }

            return _mapper.Map<ReservationsDto>(reservation);
        }

        /// <summary>
        /// Cancela una reserva por token (desde el email del cliente)
        /// Actualiza el estado a "Cancelada" (StatusID = 3)
        /// </summary>
        public async Task<ReservationsDto?> CancelReservationByTokenAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
                return null;

            var reservation = await _reservationRepository.GetAllQuerry()
                .Include(r => r.Customers)
                .Include(r => r.RestaurantTables)
                .FirstOrDefaultAsync(r => r.ConfirmationToken == token);

            if (reservation == null)
                return null;

            // Actualizar estado a Cancelada
            reservation.StatusID = 3; // Cancelada

            await _reservationRepository.UpdateEntityAsync(reservation.ReservationID, reservation);

            // Enviar email informando que la reserva fue cancelada
            try
            {
                await SendCancellationEmailAsync(reservation, "Solicitud del cliente");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al enviar email de cancelación: {ex.Message}");
            }

            return _mapper.Map<ReservationsDto>(reservation);
        }

        /// <summary>
        /// Envía email al cliente notificando la cancelación de su reserva
        /// </summary>
        public async Task SendCancellationEmailAsync(Reservations reservation, string reason = "Cancelada")
        {
            if (string.IsNullOrEmpty(reservation.Customers?.Email))
                return;

            var emailBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 20px auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; border-bottom: 3px solid #ef4444; padding-bottom: 20px; margin-bottom: 20px; }}
        .header h1 {{ color: #ef4444; margin: 0; font-size: 28px; }}
        .content {{ color: #333; line-height: 1.6; }}
        .content p {{ margin: 10px 0; }}
        .cancel-badge {{ display: inline-block; background-color: #ef4444; color: white; padding: 10px 20px; border-radius: 4px; margin: 20px 0; font-weight: bold; }}
        .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>✕ Reserva Cancelada</h1>
        </div>
        
        <div class='content'>
            <p>Estimado(a) <strong>{reservation.Customers.FullName}</strong>,</p>
            
            <p>Te informamos que tu reserva ha sido <strong>cancelada exitosamente</strong>.</p>
            
            <div class='cancel-badge'>✕ Reserva Cancelada</div>
            
            <p><strong>Detalles de la Reserva Cancelada:</strong></p>
            <ul>
                <li>📅 Fecha: {reservation.ReservationDate:dd/MM/yyyy}</li>
                <li>🕐 Hora: {reservation.ReservationTime:HH:mm}</li>
                <li>👥 Personas: {reservation.NumberOfPeople}</li>
                <li>🪑 Mesa: #{reservation.RestaurantTables?.TableNumber}</li>
                <li>📌 Motivo: {reason}</li>
            </ul>
            
            <p>Si deseas realizar una nueva reserva, puedes hacerlo en cualquier momento a través de nuestra plataforma.</p>
            
            <p>¡Te esperamos pronto en <strong>Constantinopla</strong>!</p>
            
            <p>Cordialmente,<br><strong>El equipo de Constantinopla</strong></p>
        </div>
        
        <div class='footer'>
            <p>&copy; 2026 Constantinopla - Restaurante. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>";

            var emailRequest = new EmailRequestDto
            {
                To = reservation.Customers.Email,
                Subject = "✕ Reserva Cancelada - Constantinopla",
                HtmlBody = emailBody
            };

            await _emailService.SendAsync(emailRequest);
        }
    }
}