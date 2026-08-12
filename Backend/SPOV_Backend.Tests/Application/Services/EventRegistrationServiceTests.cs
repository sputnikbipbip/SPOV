using Xunit;
using AutoMapper;
using NSubstitute;
using FluentAssertions;
using SPOV.Application.Mappings;
using SPOV.Application.Services;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;

namespace SPOV_Backend.Tests.Application.Services;

public sealed class EventRegistrationServiceTests
{
    private readonly IEventRegistrationRepository _registrationRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IPartnerRepository _partnerRepository;
    private readonly IMapper _mapper;
    private readonly EventRegistrationService _sut;

    public EventRegistrationServiceTests()
    {
        _registrationRepository = Substitute.For<IEventRegistrationRepository>();
        _eventRepository = Substitute.For<IEventRepository>();
        _partnerRepository = Substitute.For<IPartnerRepository>();
        _mapper = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>()).CreateMapper();
        _sut = new EventRegistrationService(_registrationRepository, _eventRepository, _partnerRepository, _mapper);
    }

    [Fact]
    public async Task GetByEventIdAsync_Should_IncludePartnerInfo()
    {
        _registrationRepository.GetByEventIdAsync(1).Returns(new List<EventRegistration>
        {
            new() { Id = 1, EventId = 1, PartnerId = 7, RegisteredAt = new DateTime(2026, 1, 1) },
            new() { Id = 2, EventId = 1, PartnerId = 8, RegisteredAt = new DateTime(2026, 1, 2) }
        });

        _partnerRepository.GetByIdAsync(7).Returns(new Partner { Id = 7, FullName = "Maria Silva", Email = "maria@test.com" });
        _partnerRepository.GetByIdAsync(8).Returns(new Partner { Id = 8, FullName = "João Sousa", Email = "joao@test.com" });

        var result = await _sut.GetByEventIdAsync(1);

        result.IsSuccess.Should().BeTrue();
        result.Data.Should().HaveCount(2);
        result.Data![0].PartnerFullName.Should().Be("Maria Silva");
        result.Data[0].PartnerEmail.Should().Be("maria@test.com");
        result.Data[1].PartnerFullName.Should().Be("João Sousa");
        result.Data[1].PartnerEmail.Should().Be("joao@test.com");
    }
}
