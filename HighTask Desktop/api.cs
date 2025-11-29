using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text;
using System.Text.Json.Serialization;

namespace HighTask.API
{
    public class HighTaskApi
    {
        private readonly HttpClient _http;
        private readonly string _apiBase = "https://{projectId}.supabase.co/functions/v1/make-server-194bf14c"; 
        private readonly string _publicAnonKey = "{publicAnonKey}";

        public HighTaskApi(HttpClient http)
        {
            _http = http;
            _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {_publicAnonKey}");
        }

        private async Task<T> Request<T>(string endpoint, HttpMethod method, object? body = null)
        {
            var request = new HttpRequestMessage(method, _apiBase + endpoint);

            if (body != null)
            {
                request.Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            }

            var response = await _http.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new ApiError(error, (int)response.StatusCode);
            }

            return await response.Content.ReadFromJsonAsync<T>()
                   ?? throw new ApiError("Empty API Response");
        }


public class Attachment
{
    public string Id { get; set; } = "";
    public string FileName { get; set; } = "";
    public string FilePath { get; set; } = "";
    public string FileType { get; set; } = "";
    public string UploadedAt { get; set; } = "";
    public string? Url { get; set; }
}

public class TimelineEntry
{
    public string Id { get; set; } = "";
    public string Action { get; set; } = "";
    public string Description { get; set; } = "";
    public string UserId { get; set; } = "";
    public string UserName { get; set; } = "";
    public string Timestamp { get; set; } = "";
}

public class Ticket
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string Category { get; set; } = "";
    public string Priority { get; set; } = "";
    public string Status { get; set; } = "";
    public string CreatedBy { get; set; } = "";
    public string CreatedByEmail { get; set; } = "";
    public string CreatedByName { get; set; } = "";
    public string? AssignedTo { get; set; }
    public string? AssignedToName { get; set; }
    public List<Attachment>? Attachments { get; set; }
    public string CreatedAt { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
    public List<TimelineEntry> Timeline { get; set; } = new();
    public bool? RequestedReassignment { get; set; }
    public string? ReassignmentReason { get; set; }
}

public class Stats {
    public int Total { get; set; }
    public int Open { get; set; }
    public int InProgress { get; set; }
    public int Resolved { get; set; }
    public int Closed { get; set; }
    public int HighPriority { get; set; }
    public int MediumPriority { get; set; }
    public int LowPriority { get; set; }
    public Dictionary<string, int> ByCategory { get; set; } = new();
}

public class AISuggestion {
    public string Category { get; set; } = "";
    public string Priority { get; set; } = "";
    public List<string> PossibleSolutions { get; set; } = new();
    public string? SuggestedTechnician { get; set; }
}

public class ApiError : Exception {
    public int Status { get; }
    public ApiError(string message, int status = 0) : base(message) => Status = status;
}

// --- AUTH ---
public Task<object> Signup(string email, string password, string name) =>
    Request<object>("/signup", HttpMethod.Post, new { email, password, name });

public Task<object> SignupWithApproval(string email, string password, string fullName, string department, string birthDate) =>
    Request<object>("/signup-with-approval", HttpMethod.Post, new { email, password, fullName, department, birthDate });

public Task<object> ApproveUser(string userId) =>
    Request<object>("/admin/approve-user", HttpMethod.Post, new { userId });

public Task<object> RejectUser(string userId, string reason) =>
    Request<object>("/admin/reject-user", HttpMethod.Post, new { userId, reason });

public Task<List<object>> GetUsers() =>
    Request<List<object>>("/users", HttpMethod.Get);


// --- TICKETS ---
public Task<List<Ticket>> GetTickets(string? status=null, string? priority=null, string? category=null)
{
    string q = $"?status={status}&priority={priority}&category={category}".Replace("=null","");
    return Request<List<Ticket>>($"/tickets{q}", HttpMethod.Get);
}

public Task<Ticket> GetTicket(string id) =>
    Request<Ticket>($"/tickets/{id}", HttpMethod.Get);

public Task<object> CreateTicket(object data) =>
    Request<object>("/tickets", HttpMethod.Post, data);

public Task<object> UploadAttachment(string fileName,string fileData,string fileType) =>
    Request<object>("/attachments/upload", HttpMethod.Post,new { fileName,fileData,fileType });

public Task<List<Attachment>> GetTicketAttachments(string ticketId) =>
    Request<List<Attachment>>($"/tickets/{ticketId}/attachments", HttpMethod.Get);

public Task<object> AddComment(string ticketId, string comment) =>
    Request<object>($"/tickets/{ticketId}/comments", HttpMethod.Post,new { comment });

public Task<Stats> GetStats() =>
    Request<Stats>("/stats", HttpMethod.Get);

public Task<List<object>> GetTechnicians() =>
    Request<List<object>>("/technicians", HttpMethod.Get);

public Task<AISuggestion> GetAISuggestions(string desc) =>
    Request<AISuggestion>("/ai-suggest", HttpMethod.Post,new { description = desc });

public Task<object> RequestReassignment(string ticketId,string reason) =>
    Request<object>($"/tickets/{ticketId}/request-reassignment",HttpMethod.Post,new { reason });

public Task<object> ReassignTicket(string ticketId,string techId,string? reason=null) =>
    Request<object>($"/tickets/{ticketId}/reassign",HttpMethod.Post,new { newTechnicianId = techId, reason });
