namespace SPOV.Domain.Common;

public enum ErrorType
{
    NotFound,
    Validation,
    Conflict,
    Unauthorized,
    Failure
}

public sealed record Error(string Code, string Description, ErrorType Type)
{
    public static Error NotFound(string description) =>
        new("NOT_FOUND", description, ErrorType.NotFound);

    public static Error Validation(string description) =>
        new("VALIDATION", description, ErrorType.Validation);

    public static Error Conflict(string description) =>
        new("CONFLICT", description, ErrorType.Conflict);

    public static Error Unauthorized(string description) =>
        new("UNAUTHORIZED", description, ErrorType.Unauthorized);

    public static Error Failure(string description) =>
        new("FAILURE", description, ErrorType.Failure);
}
