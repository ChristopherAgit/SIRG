using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace SIRG.WebApp.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
