namespace SPOV.Domain.Common;

public class Result<T>
{
    public T? Data { get; }
    public Error? Error { get; }
    public bool IsSuccess => Error is null;
    public bool IsFailure => Error is not null;

    private Result(T data) => Data = data;
    private Result(Error error) => Error = error;

    public static Result<T> Success(T data) => new(data);
    public static Result<T> Failure(Error error) => new(error);

    public TResult Match<TResult>(Func<T, TResult> onSuccess, Func<Error, TResult> onFailure) =>
        IsSuccess ? onSuccess(Data!) : onFailure(Error!);
}

public class Result
{
    public Error? Error { get; }
    public bool IsSuccess => Error is null;
    public bool IsFailure => Error is not null;

    private Result() { }
    private Result(Error error) => Error = error;

    public static Result Success() => new();
    public static Result Failure(Error error) => new(error);
}
