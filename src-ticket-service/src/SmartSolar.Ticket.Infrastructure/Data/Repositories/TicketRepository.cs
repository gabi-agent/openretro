using Microsoft.EntityFrameworkCore;
using SmartSolar.Ticket.Core.Interfaces;
using SmartSolar.Ticket.Infrastructure.Data.Context;
using System.Linq;

namespace SmartSolar.Ticket.Infrastructure.Data.Repositories
{
    public class TicketRepository : ITicketRepository
    {
        private readonly TicketDbContext _context;

        public TicketRepository(TicketDbContext context)
        {
            _context = context;
        }

        public IQueryable<SmartSolar.Ticket.Core.Entities.Ticket> GetQueryable()
        {
            return _context.Tickets.AsQueryable();
        }

        public async Task<IEnumerable<SmartSolar.Ticket.Core.Entities.Ticket>> GetAllAsync()
        {
            return await _context.Tickets.ToListAsync();
        }

        public async Task<SmartSolar.Ticket.Core.Entities.Ticket?> GetByIdAsync(int id)
        {
            return await _context.Tickets.FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<SmartSolar.Ticket.Core.Entities.Ticket?> GetBySlugAsync(string slug)
        {
            return await _context.Tickets.FirstOrDefaultAsync(t => t.Slug == slug);
        }

        public async Task AddAsync(SmartSolar.Ticket.Core.Entities.Ticket ticket)
        {
            await _context.Tickets.AddAsync(ticket);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(SmartSolar.Ticket.Core.Entities.Ticket ticket)
        {
            _context.Entry(ticket).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(SmartSolar.Ticket.Core.Entities.Ticket ticket)
        {
            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();
        }
    }
}
