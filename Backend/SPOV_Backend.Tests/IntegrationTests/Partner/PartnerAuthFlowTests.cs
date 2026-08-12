using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using Xunit;

namespace SPOV_Backend.Tests.IntegrationTests.Partner;

public sealed class PartnerAuthFlowTests
{
    private static ApiApplicationFactory CreateFactory() => new();

    [Fact]
    public async Task RegisterPartner_Should_CreateUserAndReturnProfile()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var email = $"partner-test-{Guid.NewGuid():N}@spov.pt";
        var response = await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Test Partner",
            email,
            password = "Partner123!",
            phone = "+351 900 000 000",
            partnerType = "Professional",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var profile = await response.Content.ReadFromJsonAsync<PartnerProfileResponse>();
        profile.Should().NotBeNull();
        profile!.FullName.Should().Be("Test Partner");
        profile.Email.Should().Be(email);
        profile.MembershipStatus.Should().Be("Pending");
        profile.PartnerType.Should().Be("Professional");
    }

    [Fact]
    public async Task Login_WithPartnerCredentials_Should_ReturnJwtToken()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var email = $"partner-login-{Guid.NewGuid():N}@spov.pt";

        await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Login Test",
            email,
            password = "Partner123!",
            phone = "+351 900 000 000",
            partnerType = "Professional",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "Partner123!"
        });

        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        body.Should().NotBeNull();
        body!.AccessToken.Should().NotBeNullOrEmpty();
        body.TokenType.Should().Be("Bearer");
        body.ExpiresIn.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetMyProfile_WithValidToken_Should_ReturnFullProfile()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var email = $"partner-profile-{Guid.NewGuid():N}@spov.pt";

        await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Profile Test",
            email,
            password = "Partner123!",
            phone = "+351 900 000 001",
            partnerType = "Professional",
            taxId = "123456789",
            address = "Rua Teste, 123",
            city = "Lisboa",
            zipCode = "1000-001",
            country = "Portugal",
            profession = "Médico Veterinário",
            companyName = "Clínica Teste",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "Partner123!"
        });
        var login = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login!.AccessToken);

        var profileResponse = await client.GetAsync("/api/partners/my-profile");

        profileResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var profile = await profileResponse.Content.ReadFromJsonAsync<PartnerProfileResponse>();
        profile.Should().NotBeNull();
        profile!.FullName.Should().Be("Profile Test");
        profile.Email.Should().Be(email);
        profile.Phone.Should().Be("+351 900 000 001");
        profile.TaxId.Should().Be("123456789");
        profile.Address.Should().Be("Rua Teste, 123");
        profile.City.Should().Be("Lisboa");
        profile.ZipCode.Should().Be("1000-001");
        profile.Country.Should().Be("Portugal");
        profile.Profession.Should().Be("Médico Veterinário");
        profile.CompanyName.Should().Be("Clínica Teste");
        profile.MembershipStatus.Should().Be("Pending");
        profile.PartnerType.Should().Be("Professional");
        profile.Payments.Should().NotBeNull();
    }

    [Fact]
    public async Task GetMyProfile_WithoutToken_Should_ReturnUnauthorized()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/partners/my-profile");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_Should_ReturnUnauthorized()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "nonexistent@spov.pt",
            password = "WrongPassword123!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ApprovePartner_AsAdmin_Should_SetStatusToActive()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var email = $"partner-approve-{Guid.NewGuid():N}@spov.pt";

        var registerResponse = await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Approve Me",
            email,
            password = "Partner123!",
            phone = "+351 900 000 000",
            partnerType = "Professional",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });
        registerResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var partner = await registerResponse.Content.ReadFromJsonAsync<PartnerProfileResponse>();

        var adminLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@spov.pt",
            password = "Admin123!"
        });
        var adminToken = await adminLogin.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken!.AccessToken);

        var approveResponse = await client.PostAsync($"/api/partners/{partner!.Id}/approve", null);

        approveResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var approved = await approveResponse.Content.ReadFromJsonAsync<PartnerDtoResponse>();
        approved.Should().NotBeNull();
        approved!.MembershipStatus.Should().Be("Active");
    }

    [Fact]
    public async Task ApprovePartner_WithoutAdminRole_Should_ReturnForbidden()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var email = $"partner-no-admin-{Guid.NewGuid():N}@spov.pt";

        await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Not Admin",
            email,
            password = "Partner123!",
            phone = "+351 900 000 000",
            partnerType = "Professional",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });

        var partnerLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "Partner123!"
        });
        var partnerToken = await partnerLogin.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", partnerToken!.AccessToken);

        var approveResponse = await client.PostAsync("/api/partners/1/approve", null);

        approveResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ApprovePartner_WithNonExistentId_Should_ReturnNotFound()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var adminLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@spov.pt",
            password = "Admin123!"
        });
        var adminToken = await adminLogin.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken!.AccessToken);

        var approveResponse = await client.PostAsync("/api/partners/99999/approve", null);

        approveResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task RegisterPartner_WithDuplicateEmail_Should_ReturnConflict()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var email = $"partner-duplicate-{Guid.NewGuid():N}@spov.pt";

        var first = await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "First Partner",
            email,
            password = "Partner123!",
            phone = "+351 900 000 000",
            partnerType = "Professional",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });
        first.StatusCode.Should().Be(HttpStatusCode.Created);

        var second = await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Second Partner",
            email,
            password = "Partner456!",
            phone = "+351 900 000 001",
            partnerType = "Student",
            initiationFee = 30m,
            quotaValue = 20m,
            totalAmount = 50m
        });

        second.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task GetPartners_WithMembershipStatusFilter_Should_ReturnOnlyPending()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var email = $"partner-filter-{Guid.NewGuid():N}@spov.pt";

        await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Filter Me",
            email,
            password = "Partner123!",
            phone = "+351 900 000 000",
            partnerType = "Professional",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });

        var adminLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@spov.pt",
            password = "Admin123!"
        });
        var adminToken = await adminLogin.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken!.AccessToken);

        var listResponse = await client.GetAsync("/api/partners?MembershipStatus=Pending");

        listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var paged = await listResponse.Content.ReadFromJsonAsync<PagedPartnersResponse>();
        paged.Should().NotBeNull();
        paged!.Data.Should().NotBeEmpty();
        paged.Data.Should().OnlyContain(p => p.MembershipStatus == "Pending");
    }

    [Fact]
    public async Task GetPartnerProfile_AsAdmin_Should_ReturnFullProfile()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var email = $"partner-detail-{Guid.NewGuid():N}@spov.pt";

        var registerResponse = await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Detail View",
            email,
            password = "Partner123!",
            phone = "+351 900 000 009",
            partnerType = "Professional",
            taxId = "987654321",
            city = "Coimbra",
            profession = "Veterinary Oncologist",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });
        registerResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var registered = await registerResponse.Content.ReadFromJsonAsync<PartnerProfileResponse>();

        var adminLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@spov.pt",
            password = "Admin123!"
        });
        var adminToken = await adminLogin.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken!.AccessToken);

        var profileResponse = await client.GetAsync($"/api/partners/{registered!.Id}/profile");

        profileResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var profile = await profileResponse.Content.ReadFromJsonAsync<PartnerProfileResponse>();
        profile.Should().NotBeNull();
        profile!.FullName.Should().Be("Detail View");
        profile.Email.Should().Be(email);
        profile.Phone.Should().Be("+351 900 000 009");
        profile.TaxId.Should().Be("987654321");
        profile.MembershipStatus.Should().Be("Pending");
    }

    [Fact]
    public async Task GetPartnerProfile_AsPartner_Should_ReturnForbidden()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var email = $"partner-detail-forbidden-{Guid.NewGuid():N}@spov.pt";

        await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Not Allowed",
            email,
            password = "Partner123!",
            phone = "+351 900 000 000",
            partnerType = "Professional",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });

        var partnerLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "Partner123!"
        });
        var partnerToken = await partnerLogin.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", partnerToken!.AccessToken);

        var profileResponse = await client.GetAsync("/api/partners/1/profile");

        profileResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    private sealed class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string TokenType { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
    }

    [Fact]
    public async Task CreatePartner_AsAdmin_Should_ReturnCreatedWithActivePartnerAndTempPassword()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var adminLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@spov.pt",
            password = "Admin123!"
        });
        var adminToken = await adminLogin.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken!.AccessToken);

        var email = $"admin-created-{Guid.NewGuid():N}@spov.pt";
        var createResponse = await client.PostAsJsonAsync("/api/partners", new
        {
            fullName = "Manually Added",
            email,
            phone = "+351 900 000 777",
            partnerType = "Professional",
            joinedAt = "2024-03-01T00:00:00Z",
            membershipExpiresAt = "2027-03-01T00:00:00Z",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });

        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await createResponse.Content.ReadFromJsonAsync<CreatePartnerResponse>();
        body.Should().NotBeNull();
        body!.Partner.MembershipStatus.Should().Be("Active");
        body.Partner.Email.Should().Be(email);
        body.TemporaryPassword.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task CreatePartner_AsPartner_Should_ReturnForbidden()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var email = $"create-forbidden-{Guid.NewGuid():N}@spov.pt";
        await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Not Allowed",
            email,
            password = "Partner123!",
            phone = "+351 900 000 000",
            partnerType = "Professional",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });

        var partnerLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "Partner123!"
        });
        var partnerToken = await partnerLogin.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", partnerToken!.AccessToken);

        var createResponse = await client.PostAsJsonAsync("/api/partners", new
        {
            fullName = "Attempt",
            email = $"attempt-{Guid.NewGuid():N}@spov.pt",
            phone = "+351 900 000 001",
            partnerType = "Professional",
            joinedAt = "2024-01-01T00:00:00Z"
        });

        createResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task CreatePartner_WithDuplicateEmail_Should_ReturnConflict()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var adminLogin = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@spov.pt",
            password = "Admin123!"
        });
        var adminToken = await adminLogin.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", adminToken!.AccessToken);

        var email = $"duplicate-create-{Guid.NewGuid():N}@spov.pt";
        var payload = new
        {
            fullName = "Duplicated",
            email,
            phone = "+351 900 000 002",
            partnerType = "Professional",
            joinedAt = "2024-01-01T00:00:00Z"
        };

        var first = await client.PostAsJsonAsync("/api/partners", payload);
        first.StatusCode.Should().Be(HttpStatusCode.Created);

        var second = await client.PostAsJsonAsync("/api/partners", payload);
        second.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    private sealed class CreatePartnerResponse
    {
        public PartnerProfileResponse Partner { get; set; } = null!;
        public string TemporaryPassword { get; set; } = string.Empty;
    }

    private sealed class PartnerDtoResponse
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string MembershipStatus { get; set; } = string.Empty;
    }

    private sealed class PartnerProfileResponse
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? TaxId { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
        public string? Profession { get; set; }
        public string? CompanyName { get; set; }
        public string PartnerType { get; set; } = string.Empty;
        public string MembershipStatus { get; set; } = string.Empty;
        public List<object> Payments { get; set; } = [];
    }

    private sealed class PagedPartnersResponse
    {
        public List<PartnerDtoResponse> Data { get; set; } = [];
    }
}