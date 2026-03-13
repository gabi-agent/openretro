namespace SmartSolar.Ticket.Core.Entities
{
    public class Ticket
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public int CreatedBy { get; set; }
        public DateTime TimeCreated { get; set; }
        public int Status { get; set; }
        public int Assignee { get; set; }
        public int TicketType { get; set; }
        public DateTime TimeModified { get; set; }
        public int Priority { get; set; }
        public string? Slug { get; set; }
    }
}
