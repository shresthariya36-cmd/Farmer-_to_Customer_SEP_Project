namespace TajaFarm.Api.Data;

public static class OrderTracking
{
    private static readonly string[] Stages = { "placed", "confirmed", "processing", "shipped", "out_for_delivery", "delivered" };
    public static string[] AllStageKeys() => Stages;
    public static int StageIndex(string stage) => Array.IndexOf(Stages, stage);
    public static bool IsValid(string stage) => Stages.Contains(stage);
}
