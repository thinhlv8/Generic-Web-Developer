namespace EventEase.Models
{
    public class EventModel
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
