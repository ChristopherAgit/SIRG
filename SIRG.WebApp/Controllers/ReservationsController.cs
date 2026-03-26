using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;

namespace SIRG.WebApp.Controllers
{
    public class ReservationsController : Controller
    {
        private readonly IReservationsServices _reservationsServices;
        private readonly IRestaurantTablesServices _restaurantTablesServices;
        private readonly IReservationStatusServices _reservationStatusServices;

        public ReservationsController(
            IReservationsServices reservationsServices,
            IRestaurantTablesServices restaurantTablesServices,
            IReservationStatusServices reservationStatusServices)
        {
            _reservationsServices = reservationsServices;
            _restaurantTablesServices = restaurantTablesServices;
            _reservationStatusServices = reservationStatusServices;
        }

        public async Task<IActionResult> Index(DateOnly? date, TimeOnly? time, int? statusId)
        {
            var result = await _reservationsServices.GetAllReservationsAsync(date, time, statusId);

            await LoadFilterData(statusId);

            return View(result);
        }

        public async Task<IActionResult> Details(int id)
        {
            var reservation = await _reservationsServices.GetDtoById(id);

            if (reservation == null)
                return NotFound();

            return View(reservation);
        }

        public async Task<IActionResult> Create()
        {
            await LoadFormData();
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Create(ReservationsDto dto)
        {
            if (!ModelState.IsValid)
            {
                await LoadFormData(dto.TableID, dto.StatusID);
                return View(dto);
            }

            await _reservationsServices.SaveReservationAsync(dto);

            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Edit(int id)
        {
            var reservation = await _reservationsServices.GetDtoById(id);

            if (reservation == null)
                return NotFound();

            await LoadFormData(reservation.TableID, reservation.StatusID);

            return View(reservation);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(int id, ReservationsDto dto)
        {
            if (!ModelState.IsValid)
            {
                await LoadFormData(dto.TableID, dto.StatusID);
                return View(dto);
            }

            await _reservationsServices.UpdateReservationAsync(id, dto);

            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Cancel(int id)
        {
            var reservation = await _reservationsServices.GetDtoById(id);

            if (reservation == null)
                return NotFound();

            return View(reservation);
        }

        [HttpPost]
        public async Task<IActionResult> CancelConfirmed(int id)
        {
            await _reservationsServices.CancelReservationAsync(id);

            return RedirectToAction(nameof(Index));
        }

        private async Task LoadFormData(int? tableId = null, int? statusId = null)
        {
            var tables = await _restaurantTablesServices.GetAllListDto();
            var statuses = await _reservationStatusServices.GetAllListDto();

            ViewBag.Tables = new SelectList(
                tables.Where(t => t.IsActive),
                "TableID",
                "TableNumber",
                tableId);

            ViewBag.Statuses = new SelectList(
                statuses,
                "StatusID",
                "StatusName",
                statusId);
        }

        private async Task LoadFilterData(int? statusId)
        {
            var statuses = await _reservationStatusServices.GetAllListDto();

            ViewBag.Statuses = new SelectList(
                statuses,
                "StatusID",
                "StatusName",
                statusId);
        }
    }
}