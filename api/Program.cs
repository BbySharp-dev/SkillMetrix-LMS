using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SkillMetrix_LMS.API.Infrastructure.Middleware;
using System.Text;
using SkillMetrix_LMS.API.Infrastructure.OpenApi;
using Scalar.AspNetCore;
using SkillMetrix_LMS.API.Features.Seed;
using SkillMetrix_LMS.API.Features.Auth;
using SkillMetrix_LMS.API.Features.Courses;
using SkillMetrix_LMS.API.Features.Reviews;
using SkillMetrix_LMS.API.Features.Chapters;
using SkillMetrix_LMS.API.Features.Enrollments;
using SkillMetrix_LMS.API.Features.Lessons.Core;
using SkillMetrix_LMS.API.Features.Lessons.Documents;
using SkillMetrix_LMS.API.Features.Lessons.Notes;
using SkillMetrix_LMS.API.Features.Lessons.QA;
using SkillMetrix_LMS.API.Features.Upload;
using SkillMetrix_LMS.API.Features.Transactions;
using SkillMetrix_LMS.API.Features.Quizzes;
using SkillMetrix_LMS.API.Features.Progress;
using SkillMetrix_LMS.API.Features.Statistics;
using SkillMetrix_LMS.API.Features.Admin;
using SkillMetrix_LMS.API.Features.Certificates;
using SkillMetrix_LMS.API.Infrastructure.Email;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("Database connection string not configured");

var jwtSecretKey = builder.Configuration["Jwt:SecretKey"]
    ?? Environment.GetEnvironmentVariable("Jwt__SecretKey");
if (string.IsNullOrWhiteSpace(jwtSecretKey))
    throw new InvalidOperationException("JWT SecretKey not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? Environment.GetEnvironmentVariable("Jwt__Issuer")
    ?? "SkillMetrixLMS";
var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? Environment.GetEnvironmentVariable("Jwt__Audience")
    ?? "SkillMetrixLMS";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey))
    };
});

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireInstructorOrAdmin", policy =>
        policy.RequireRole("Instructor", "Admin"))
    .AddPolicy("RequireAdminOrModerator", policy =>
        policy.RequireRole("Admin", "Moderator"))
    .AddPolicy("RequireAdmin", policy =>
        policy.RequireRole("Admin"));

builder.Services.AddRouting(options => options.LowercaseUrls = true);
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddScoped<IFileUploadService, CloudinaryUploadService>();
builder.Services.AddScoped<IReviewService, ReviewService>();

builder.Services.AddMapster();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<DataSeederService>();
builder.Services.AddHostedService<DatabaseResetBackgroundService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IChapterService, ChapterService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<ILessonDocumentService, LessonDocumentService>();
builder.Services.AddScoped<ILessonNoteService, LessonNoteService>();
builder.Services.AddScoped<ILessonQAService, LessonQAService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IProgressService, ProgressService>();
builder.Services.AddScoped<IStatisticsService, StatisticsService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<SkillMetrix_LMS.API.Features.Profiles.IProfileService, SkillMetrix_LMS.API.Features.Profiles.ProfileService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<ICertificateService, CertificateService>();
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SkillMetrix LMS API", Version = "v1" });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    c.SchemaFilter<RequestDtoExampleSchemaFilter>();
    c.OperationFilter<ValidationResponseOperationFilter>();

    c.CustomSchemaIds(type => type.FullName);

    c.OrderActionsBy(apiDesc => OpenApiOrdering.ActionSortKey(apiDesc));
    c.DocumentFilter<TagOrderDocumentFilter>();
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
     ?? [
         "http://localhost:5173",
         "https://client-gamma-sepia.vercel.app",
         "https://skill-metrix-lms.vercel.app"
     ];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowViteClient", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Logging.AddConsole();

var app = builder.Build();

// Automatically apply EF Core migrations on startup (especially for environments like Railway)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        dbContext.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

app.UseMiddleware<GlobalExceptionHandler>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "SkillMetrix LMS API v1");
        options.ConfigObject.AdditionalItems["operationsSorter"] = "method";
    });
    app.MapScalarApiReference("/scalar", options =>
    {
        options.Title = "SkillMetrix LMS API";
        options.Theme = ScalarTheme.BluePlanet;
        options.OpenApiRoutePattern = "/swagger/{documentName}/swagger.json";
        options.DefaultHttpClient = new(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowViteClient");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();