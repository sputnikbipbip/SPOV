using Xunit;
using AutoMapper;
using NSubstitute;
using FluentAssertions;
using SPOV.Application.DTOs.Events;
using SPOV.Application.Mappings;
using SPOV.Application.Services;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;

namespace SPOV_Backend.Tests.Application.Services;

public sealed class EventServiceTests
{
    private readonly IEventRepository _eventRepository;
    private readonly IMapper _mapper;
    private readonly EventService _sut;

    public EventServiceTests()
    {
        _eventRepository = Substitute.For<IEventRepository>();
        _mapper = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>()).CreateMapper();
        _sut = new EventService(_eventRepository, _mapper);
    }

    [Fact]
    public async Task GetAllAsync_Should_ReturnPagedEventsWithMetadata()
    {
        var events = new List<Event>
        {
            new() { Id = 1, Title = "First", StartDate = new DateTime(2026, 1, 1), EndDate = new DateTime(2026, 1, 2) },
            new() { Id = 2, Title = "Second", StartDate = new DateTime(2026, 2, 1), EndDate = new DateTime(2026, 2, 2) },
            new() { Id = 3, Title = "Third", StartDate = new DateTime(2026, 3, 1), EndDate = new DateTime(2026, 3, 2) }
        };
        _eventRepository.GetAllAsync(Arg.Any<QueryFilter>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Event>(events, events.Count, 1, 2));

        var result = await _sut.GetAllAsync(new QueryFilter(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Data!.Data.Should().HaveCount(3);
        result.Data.Data[0].Title.Should().Be("First");
        result.Data.TotalRecords.Should().Be(3);
        result.Data.TotalPages.Should().Be(2);
    }

    [Fact]
    public async Task GetAllAsync_Should_ForwardQueryFilterToRepository()
    {
        var filter = new QueryFilter { PageNumber = 2, PageSize = 25, Search = "webinar", SortBy = "title desc" };
        _eventRepository.GetAllAsync(Arg.Any<QueryFilter>(), Arg.Any<CancellationToken>())
            .Returns(new PagedResult<Event>([], 0, 2, 25));

        await _sut.GetAllAsync(filter, CancellationToken.None);

        await _eventRepository.Received(1).GetAllAsync(
            Arg.Is<QueryFilter>(f => f.PageNumber == 2 && f.PageSize == 25 && f.Search == "webinar" && f.SortBy == "title desc"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_Should_PersistImageData()
    {
        var request = new CreateEventRequest
        {
            Title = "Novo Evento",
            StartDate = new DateTime(2026, 5, 1),
            EndDate = new DateTime(2026, 5, 2),
            ImageData = "data:image/png;base64,iVBORw0KGgo="
        };

        Event? created = null;
        _eventRepository.AddAsync(Arg.Do<Event>(e => created = e))
            .Returns(ci => ci.Arg<Event>());

        var result = await _sut.CreateAsync(request);

        result.IsSuccess.Should().BeTrue();
        created.Should().NotBeNull();
        created!.ImageData.Should().Be(request.ImageData);
        result.Data!.ImageData.Should().Be(request.ImageData);
    }

    [Fact]
    public async Task UpdateAsync_Should_UpdateImageData()
    {
        var existing = new Event
        {
            Id = 1,
            Title = "Old",
            StartDate = new DateTime(2026, 5, 1),
            EndDate = new DateTime(2026, 5, 2),
            ImageData = "data:image/png;base64,old"
        };
        _eventRepository.GetByIdAsync(1).Returns(existing);
        _eventRepository.UpdateAsync(existing).Returns(existing);

        var request = new UpdateEventRequest
        {
            Title = "New",
            StartDate = new DateTime(2026, 6, 1),
            EndDate = new DateTime(2026, 6, 2),
            ImageData = "data:image/jpeg;base64,new"
        };

        var result = await _sut.UpdateAsync(1, request);

        result.IsSuccess.Should().BeTrue();
        existing.ImageData.Should().Be(request.ImageData);
        result.Data!.ImageData.Should().Be(request.ImageData);
    }
}