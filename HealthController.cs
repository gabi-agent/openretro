using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text.Json;

namespace IdentityService.Controllers;

/// <summary>
/// Health check endpoint for monitoring service status
/// </summary>
[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    private readonly HealthCheckService _healthCheckService;
    private readonly ILogger<HealthController> _logger;
    private readonly IWebHostEnvironment _env;

    public HealthController(
        HealthCheckService healthCheckService,
        ILogger<HealthController> logger,
        IWebHostEnvironment env)
    {
        _healthCheckService = healthCheckService;
        _logger = logger;
        _env = env;
    }

    /// <summary>
    /// Get service health status
    /// </summary>
    /// <returns>Health status with 200 OK</returns>
    [HttpGet]
    [EnableRateLimiting("HealthCheck")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHealth()
    {
        try
        {
            var report = await _healthCheckService.CheckHealthAsync();

            // Only show description in development environment
            var showDescription = _env.IsDevelopment();

            var healthData = new HealthResponse
            {
                Status = report.Status.ToString(),
                Timestamp = DateTime.UtcNow,
                Checks = report.Entries.Select(e => new HealthCheck
                {
                    Name = e.Key,
                    Status = e.Value.Status.ToString(),
                    Description = showDescription ? e.Value.Description : null,
                    Duration = e.Value.Duration.TotalMilliseconds
                }).ToList()
            };

            // Always return 200 OK - health status in response body
            return Ok(healthData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            var errorHealth = new HealthResponse
            {
                Status = "Unhealthy",
                Timestamp = DateTime.UtcNow,
                Checks = new List<HealthCheck>
                {
                    new HealthCheck
                    {
                        Name = "HealthCheckService",
                        Status = "Unhealthy",
                        Description = "Health check failed"
                    }
                }
            };
            return Ok(errorHealth);
        }
    }

    /// <summary>
    /// Health check response model
    /// </summary>
    private class HealthResponse
    {
        public string Status { get; set; } = "Healthy";
        public DateTime Timestamp { get; set; }
        public List<HealthCheck> Checks { get; set; } = new();
    }

    /// <summary>
    /// Individual health check result
    /// </summary>
    private class HealthCheck
    {
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Description { get; set; }
        public double Duration { get; set; }
    }
}
