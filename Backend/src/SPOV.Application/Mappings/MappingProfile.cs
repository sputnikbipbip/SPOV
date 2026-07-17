using AutoMapper;
using SPOV.Application.DTOs.AdminUsers;
using SPOV.Application.DTOs.Articles;
using SPOV.Application.DTOs.Contacts;
using SPOV.Application.DTOs.Documents;
using SPOV.Application.DTOs.EventRegistrations;
using SPOV.Application.DTOs.Events;
using SPOV.Application.DTOs.MembershipTiers;
using SPOV.Application.DTOs.News;
using SPOV.Application.DTOs.Partners;
using SPOV.Application.DTOs.Payments;
using SPOV.Domain.Entities;

namespace SPOV.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<NewsPost, NewsPostDto>();
        CreateMap<SharedDocument, DocumentDto>();
        CreateMap<Partner, PartnerDto>()
            .ForMember(d => d.MembershipStatus, o => o.MapFrom(s => s.MembershipStatus.ToString()))
            .ForMember(d => d.MembershipTierName, o => o.MapFrom(s => s.MembershipTier != null ? s.MembershipTier.Name : null));
        CreateMap<Partner, PartnerProfileDto>()
            .ForMember(d => d.MembershipStatus, o => o.MapFrom(s => s.MembershipStatus.ToString()))
            .ForMember(d => d.MembershipTierName, o => o.MapFrom(s => s.MembershipTier != null ? s.MembershipTier.Name : null))
            .ForMember(d => d.PartnerType, o => o.MapFrom(s => s.PartnerType.ToString()))
            .ForMember(d => d.Payments, o => o.Ignore());
        CreateMap<MembershipTier, MembershipTierDto>()
            .ForMember(d => d.BillingInterval, o => o.MapFrom(s => s.BillingInterval.ToString()));
        CreateMap<Payment, PaymentDto>();
        CreateMap<Event, EventDto>();
        CreateMap<EventRegistration, EventRegistrationDto>();
        CreateMap<Article, ArticleDto>();
        CreateMap<AdminUser, AdminUserDto>()
            .ForMember(d => d.Role, o => o.MapFrom(s => s.Role.ToString()));
        CreateMap<ContactMessage, ContactMessageDto>();
    }
}
