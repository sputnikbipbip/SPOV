using AutoMapper;
using SPOV.Application.DTOs.Documents;
using SPOV.Application.DTOs.News;
using SPOV.Application.DTOs.Subscriptions;
using SPOV.Domain.Entities;

namespace SPOV.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<NewsPost, NewsPostDto>();
        CreateMap<SharedDocument, DocumentDto>();
        CreateMap<Subscription, SubscriptionDto>()
            .ForMember(d => d.IsActive, o => o.MapFrom(s => s.IsActive));
    }
}
