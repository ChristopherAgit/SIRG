// Ignore Spelling: SIRG

namespace SIRG.Application.Wrappers
{
    public class ApiResponse<Type>
    {
        public ApiResponse() { }

        public ApiResponse(Type data, string? message = null)
        {
            Succeeded = true;
            Data = data;
            Message = message ?? string.Empty;
        }

        public ApiResponse(string message)
        {
            Succeeded = false;
            Message = message;
        }

        public bool Succeeded { get; set; }
        public string? Message { get; set; }
        public List<string>? Errors { get; set; }
        public Type? Data { get; set; }
    }
}
