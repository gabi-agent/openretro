using SmartSolar.Ticket.Application.DTOs;
using SmartSolar.Ticket.Application.Interfaces;
using SmartSolar.Ticket.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace SmartSolar.Ticket.Application.Services
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository _repository;

        public TicketService(ITicketRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<SmartSolar.Ticket.Core.Entities.Ticket>> GetTicketsAsync(int userId, bool isAdmin, TicketQueryRequest request)
        {
            var query = _repository.GetQueryable();

            if (!isAdmin)
            {
                query = query.Where(t => t.CreatedBy == userId || t.Assignee == userId);
            }

            if (request.Status.HasValue) query = query.Where(t => t.Status == request.Status.Value);
            if (request.Priority.HasValue) query = query.Where(t => t.Priority == request.Priority.Value);

            var totalRecords = await query.CountAsync();
            var items = await query.Skip((request.Page - 1) * request.PageSize)
                                   .Take(request.PageSize)
                                   .ToListAsync();

            return new PagedResult<SmartSolar.Ticket.Core.Entities.Ticket>
            {
                Items = items,
                TotalRecords = totalRecords,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }

        public async Task<PagedResult<SmartSolar.Ticket.Core.Entities.Ticket>> SearchTicketsAsync(int userId, bool isAdmin, TicketSearchRequest request)
        {
            var query = _repository.GetQueryable();

            if (!isAdmin)
            {
                query = query.Where(t => t.CreatedBy == userId || t.Assignee == userId);
            }

            if (!string.IsNullOrEmpty(request.Query))
            {
                query = query.Where(t => t.Title!.Contains(request.Query) || t.Content!.Contains(request.Query));
            }

            var totalRecords = await query.CountAsync();
            var items = await query.Skip((request.Page - 1) * request.PageSize)
                                   .Take(request.PageSize)
                                   .ToListAsync();

            return new PagedResult<SmartSolar.Ticket.Core.Entities.Ticket>
            {
                Items = items,
                TotalRecords = totalRecords,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }

        public Task<SmartSolar.Ticket.Core.Entities.Ticket?> GetTicketByIdAsync(int id) => _repository.GetByIdAsync(id);

        public Task<SmartSolar.Ticket.Core.Entities.Ticket?> GetTicketBySlugAsync(string slug) => _repository.GetBySlugAsync(slug);

        public async Task<SmartSolar.Ticket.Core.Entities.Ticket> CreateTicketAsync(SmartSolar.Ticket.Core.Entities.Ticket ticket)
        {
            if (string.IsNullOrEmpty(ticket.Slug))
            {
                ticket.Slug = ticket.Title?.ToLower().Replace(" ", "-");
            }
            await _repository.AddAsync(ticket);
            return ticket;
        }

        public async Task<bool> UpdateTicketAsync(int id, SmartSolar.Ticket.Core.Entities.Ticket updated)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Title = updated.Title;
            existing.Content = updated.Content;
            existing.Status = updated.Status;
            existing.Assignee = updated.Assignee;
            existing.TicketType = updated.TicketType;
            existing.TimeModified = DateTime.UtcNow;
            existing.Priority = updated.Priority;

            await _repository.UpdateAsync(existing);
            return true;
        }

        public async Task<bool> DeleteTicketAsync(int id)
        {
            var ticket = await _repository.GetByIdAsync(id);
            if (ticket == null) return false;

            await _repository.DeleteAsync(ticket);
            return true;
        }
    }
}
