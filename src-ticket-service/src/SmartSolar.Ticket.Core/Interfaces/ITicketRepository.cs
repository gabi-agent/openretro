using System.Linq;

namespace SmartSolar.Ticket.Core.Interfaces
{
    public interface ITicketRepository
    {
        IQueryable<SmartSolar.Ticket.Core.Entities.Ticket> GetQueryable();
        Task<IEnumerable<SmartSolar.Ticket.Core.Entities.Ticket>> GetAllAsync();
        Task<SmartSolar.Ticket.Core.Entities.Ticket?> GetByIdAsync(int id);
        Task<SmartSolar.Ticket.Core.Entities.Ticket?> GetBySlugAsync(string slug);
        Task AddAsync(SmartSolar.Ticket.Core.Entities.Ticket ticket);
        Task UpdateAsync(SmartSolar.Ticket.Core.Entities.Ticket ticket);
        Task DeleteAsync(SmartSolar.Ticket.Core.Entities.Ticket ticket);
    }
}
