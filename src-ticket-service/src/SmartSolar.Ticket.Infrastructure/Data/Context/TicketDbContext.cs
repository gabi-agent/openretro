using Microsoft.EntityFrameworkCore;

namespace SmartSolar.Ticket.Infrastructure.Data.Context
{
    public class TicketDbContext : DbContext
    {
        public TicketDbContext(DbContextOptions<TicketDbContext> options)
            : base(options)
        {
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        }

        public virtual DbSet<SmartSolar.Ticket.Core.Entities.Ticket> Tickets { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SmartSolar.Ticket.Core.Entities.Ticket>(entity =>
            {
                entity.ToTable("Tickets");

                entity.Property(e => e.Id)
                    .HasColumnName("Id")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.Title)
                    .HasMaxLength(512);
            });
        }
    }
}
