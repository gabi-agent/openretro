using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSolar.Ticket.Application.DTOs;
using SmartSolar.Ticket.Application.Interfaces;

namespace SmartSolar.Ticket.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class TicketController : ControllerBase
    {
        private readonly ITicketService _service;

        public TicketController(ITicketService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<SmartSolar.Ticket.Core.Entities.Ticket>>> Get(
        [FromQuery] TicketQueryRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");

            var result = await _service.GetTicketsAsync(userId, isAdmin, request);
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<SmartSolar.Ticket.Core.Entities.Ticket>>> Search(
        [FromQuery] TicketSearchRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");

            var result = await _service.SearchTicketsAsync(userId, isAdmin, request);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SmartSolar.Ticket.Core.Entities.Ticket>> Get(int id)
        {
            var ticket = await _service.GetTicketByIdAsync(id);
            if (ticket == null) return NotFound();
            return Ok(ticket);
        }

        [HttpGet("{slug}")]
        public async Task<ActionResult<SmartSolar.Ticket.Core.Entities.Ticket>> GetBySlug(string slug)
        {
            var ticket = await _service.GetTicketBySlugAsync(slug);
            if (ticket == null) return NotFound();
            return Ok(ticket);
        }

        [HttpPost]
        public async Task<ActionResult<SmartSolar.Ticket.Core.Entities.Ticket>> Post(SmartSolar.Ticket.Core.Entities.Ticket ticket)
        {
            var created = await _service.CreateTicketAsync(ticket);
            return CreatedAtAction("Get", new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, SmartSolar.Ticket.Core.Entities.Ticket ticket)
        {
            if (id != ticket.Id) return BadRequest();
            var success = await _service.UpdateTicketAsync(id, ticket);
            return success ? NoContent() : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteTicketAsync(id);
            return success ? NoContent() : NotFound();
        }
    }
}
