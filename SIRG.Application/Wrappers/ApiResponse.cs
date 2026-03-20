// Ignore Spelling: SIRG

namespace SIRG.Application.Wrappers
{
    public class ApiResponse
    {
        public ApiResponse() { }
        public ApiResponse(string message, bool succeeded = false)
        {
            Succeeded = succeeded;
            Message = message;
        }

        public ApiResponse(List<string> errors, string? message = null)
        {
            Errors = errors;
            Message = message;
        }

        protected bool Succeeded { get; set; }
        protected string? Message { get; set; }
        protected List<string>? Errors { get; set; }
    }

    public class ApiResponse<Type> : ApiResponse
    {
        public ApiResponse(Type data, string? message = null) : base(message!, true)
        {
            Data = data;
        }

        public ApiResponse(string message) : base(message) { }

        public Type? Data { get; set; }
    }
}
