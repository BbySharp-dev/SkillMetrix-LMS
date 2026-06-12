namespace SkillMetrix_LMS.API.Features.Seed;

public class DatabaseResetBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseResetBackgroundService> _logger;
    private readonly IConfiguration _configuration;

    public DatabaseResetBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<DatabaseResetBackgroundService> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Check if database auto-reset is enabled
        var autoResetEnabledValue = _configuration["AUTO_RESET_ENABLED"]
            ?? _configuration["Database:AutoResetEnabled"];

        bool isEnabled = false;
        if (!string.IsNullOrEmpty(autoResetEnabledValue) && bool.TryParse(autoResetEnabledValue, out var parsed))
        {
            isEnabled = parsed;
        }

        if (!isEnabled)
        {
            _logger.LogInformation("Database Auto-Reset is disabled.");
            return;
        }

        _logger.LogInformation("Database Auto-Reset is enabled.");

        // Target hour: 20:00 UTC (which is 3:00 AM GMT+7/Vietnam Time)
        const int targetHourUtc = 20;

        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            var nextRun = now.Date.AddHours(targetHourUtc);
            if (now >= nextRun)
            {
                nextRun = nextRun.AddDays(1);
            }

            var delay = nextRun - now;
            _logger.LogInformation("Next Database Auto-Reset scheduled at: {Time} UTC", nextRun);

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                break;
            }

            _logger.LogInformation("Starting database auto-reset...");

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var seeder = scope.ServiceProvider.GetRequiredService<DataSeederService>();
                    await seeder.ResetAndSeedStrictInternalAsync();
                }
                _logger.LogInformation("Database auto-reset completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during database auto-reset.");
            }
        }
    }
}