using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SmartSolar.Ticket.Application.Interfaces;
using SmartSolar.Ticket.Core.Interfaces;
using SmartSolar.Ticket.Infrastructure.Data.Context;
using SmartSolar.Ticket.Infrastructure.Data.Repositories;
using System.Text;
using DotNetEnv;
using SmartSolar.Ticket.Application.Services;

try
{
    Env.Load();
}
catch { }

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

ConfigurationManager configuration = builder.Configuration;
var connectionString = configuration.GetConnectionString("PostgresConnection");

if (string.IsNullOrEmpty(connectionString))
{
    var host = configuration["ConnectionStrings__PostgresConnection__Host"];
    var port = configuration["ConnectionStrings__PostgresConnection__Port"] ?? "5432";
    var database = configuration["ConnectionStrings__PostgresConnection__Database"];
    var user = configuration["ConnectionStrings__PostgresConnection__Username"];
    var password = configuration["ConnectionStrings__PostgresConnection__Password"];
    
    if (!string.IsNullOrEmpty(host) && !string.IsNullOrEmpty(database))
    {
        connectionString = $"Host={host};Port={port};Database={database};Username={user};Password={password};Include Error Detail=true";
    }
}

builder.Services.AddDbContext<TicketDbContext>(option => option.UseNpgsql(connectionString));

// Register services and repositories
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<ITicketService, SmartSolar.Ticket.Application.Services.TicketService>();

var strJwtAudience = configuration["JWT:ValidAudience"] ?? configuration["JWT:Audience"] ?? configuration["JWT__ValidAudience"];
var strJwtIssuer = configuration["JWT:ValidIssuer"] ?? configuration["JWT:Issuer"] ?? configuration["JWT__ValidIssuer"];
var strJwtSecretKey = configuration["JWT:Secret"] ?? configuration["JWT__Secret"];
var strJwtSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(strJwtSecretKey ?? "sadjkwankjiuafnksdfkasfksdnfjkd"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = strJwtAudience,
        ValidIssuer = strJwtIssuer,
        IssuerSigningKey = strJwtSecurityKey,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "SmartSolar Ticket Service", Version = "v1.0.0" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[]{}
        }
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
