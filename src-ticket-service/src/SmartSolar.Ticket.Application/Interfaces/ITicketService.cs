using SmartSolar.Ticket.Application.DTOs;

namespace SmartSolar.Ticket.Application.Interfaces
{
    public interface ITicketService
    {
        Task<PagedResult<SmartSolar.Ticket.Core.Entities.Ticket>> GetTicketsAsync(int userId, bool isAdmin, TicketQueryRequest request);
        Task<PagedResult<SmartSolar.Ticket.Core.Entities.Ticket>> SearchTicketsAsync(int userId, bool isAdmin, TicketSearchRequest request);
        Task<SmartSolar.Ticket.Core.Entities.Ticket?> GetTicketByIdAsync(int id);
        Task<SmartSolar.Ticket.Core.Entities.Ticket?> GetTicketBySlugAsync(string slug);
        Task<SmartSolar.Ticket.Core.Entities.Ticket> CreateTicketAsync(SmartSolar.Ticket.Core.Entities.Ticket ticket);
        Task<bool> UpdateTicketAsync(int id, SmartSolar.Ticket.Core.Entities.Ticket updated);
        Task<bool> DeleteTicketAsync(int id);
    }
}
