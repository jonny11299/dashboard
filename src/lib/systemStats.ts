import { invoke } from "@tauri-apps/api/core";

export interface SystemStats {
    cpu_usage_percent: number;
    ram_used_mb: number;
    ram_total_mb: number;
    cpu_temp_celsius: number | null;
}

export async function getSystemStats(): Promise<SystemStats> {
    return await invoke<SystemStats>("get_system_stats");
}