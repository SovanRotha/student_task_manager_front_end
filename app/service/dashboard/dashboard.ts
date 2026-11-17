import Api from "../Api/api";
import type { DashboardData } from "../../model/dashboard/dashboard";

export async function getDashboard(): Promise<DashboardData> {
    const response = await Api.get<DashboardData>("/dashboard");
    return response.data;
}
