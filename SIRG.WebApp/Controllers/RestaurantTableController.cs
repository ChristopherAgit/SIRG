using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;

namespace SIRG.WebApp.Controllers
{
    public class RestaurantTableController : Controller
    {
        private readonly IRestaurantTablesServices _restaurantTablesServices;
        private readonly IMapper _mapper;

        public RestaurantTableController(IRestaurantTablesServices services, IMapper mapper)
        {
            _mapper = mapper;
            _restaurantTablesServices = services;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var result = await _restaurantTablesServices.GetAllListDto();
            return View(result);
        }

        [HttpGet]
        public async Task<IActionResult> Details(int id)
        {
            var result = await _restaurantTablesServices.GetDtoById(id);

            if (result == null)
            {
                return NotFound();
            }

            return View(result);
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(RestaurantTablesDto dto)
        {
            if (!ModelState.IsValid)
            {
                return View(dto);
            }

            var result = await _restaurantTablesServices.SaveDtoAsync(dto);

            if (result == null)
            {
                ModelState.AddModelError("", "No se pudo guardar la mesa.");
                return View(dto);
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var result = await _restaurantTablesServices.GetDtoById(id);

            if (result == null)
            {
                return NotFound();
            }

            return View(result);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, RestaurantTablesDto dto)
        {
            if (!ModelState.IsValid)
            {
                return View(dto);
            }

            var result = await _restaurantTablesServices.UpdateDtoByAsync(dto, id);

            if (result == null)
            {
                ModelState.AddModelError("", "No se pudo actualizar la mesa.");
                return View(dto);
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _restaurantTablesServices.GetDtoById(id);

            if (result == null)
            {
                return NotFound();
            }

            return View(result);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var deleted = await _restaurantTablesServices.DeleteDtoAync(id);

            if (!deleted)
            {
                ModelState.AddModelError("", "No se pudo eliminar la mesa.");
                var dto = await _restaurantTablesServices.GetDtoById(id);
                return View(dto);
            }

            return RedirectToAction(nameof(Index));
        }
    }
}