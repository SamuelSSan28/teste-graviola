const dev = {
  baseURL: "http://localhost:4000",
};

const prod = {
  baseURL: "https://production-example-server.examble",
};

const config = process.env.NODE_ENV === "production" ? prod : dev;

const BASE_URL = config.baseURL;

export interface IConvertLogsResponse {
  received: string;
  converted: string;
}

export interface IDashboardResponse {
  totalConversions: number;
  totalSuccess: number;
  totalErrors: number;
  conversionsPerDay: Record<string, number>;
  timeProcessedByDay: Record<string, number>;
  averageProcessingTime: number;
}

export const convertLogs = async (
  sourceUrl: string
): Promise<IConvertLogsResponse> => {
  const response = await fetch(`${BASE_URL}/parser/convert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sourceUrl, format: 'json' }),
  });

  if (response.status != 200) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.message);
  }

  return response.json();
};

export const fetchDashboardData = async (): Promise<IDashboardResponse> => {
  const response = await fetch(`${BASE_URL}/analytics/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Falha na resposta do servidor.");
  }

  const data: IDashboardResponse = await response.json();
  
  return data;
};
