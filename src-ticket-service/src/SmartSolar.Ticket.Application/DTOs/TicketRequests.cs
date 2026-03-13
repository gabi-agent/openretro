namespace SmartSolar.Ticket.Application.DTOs
{
    public class PagingRequest
    {
        private int _page = 1;
        private int _pageSize = 10;

        public int Page
        {
            get => _page;
            set => _page = value <= 0 ? 1 : value;
        }

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value <= 0 ? 10 : Math.Min(value, 100);
        }
    }

    public class TicketQueryRequest : PagingRequest
    {
        public int? Status { get; set; }
        public int? Priority { get; set; }
    }

    public class TicketSearchRequest : PagingRequest
    {
        public string? Query { get; set; }
    }
}
