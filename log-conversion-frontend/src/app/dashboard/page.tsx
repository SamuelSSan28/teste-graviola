"use client";
import React, { useEffect, useState } from "react";
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Alert,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import TimerIcon from "@mui/icons-material/Timer";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import Histogram from "@/components/Histogram";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { fetchDashboardData, IDashboardResponse } from "@/services/logServise";

// Ajuste no Dashboard ou no ponto de entrada da aplicação
import { Chart, registerables } from "chart.js";
import InfoCard from "@/components/InfoCard";

Chart.register(...registerables);

function Dashboard() {
  const [data, setData] = useState<IDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await fetchDashboardData();
        setData(dashboardData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Container>
        <DashboardSkeleton />
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Preparando os dados para os histogramas
  const conversionsPerDayData = {
    labels: Object.keys(data?.conversionsPerDay || {}),
    datasets: [
      {
        label: "Conversões por Dia",
        data: Object.values(data?.conversionsPerDay || {}),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  const timeProcessedByDayData = {
    labels: Object.keys(data?.timeProcessedByDay || {}),
    datasets: [
      {
        label: "Tempo Processado por Dia",
        data: Object.values(data?.timeProcessedByDay || {}),
        backgroundColor: "rgba(153,102,255,0.6)",
      },
    ],
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <InfoCard
            title="Total de Conversões"
            value={data.totalConversions}
            Icon={SwapHorizIcon}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <InfoCard
            title="Total de Sucessos"
            value={data.totalSuccess}
            Icon={CheckCircleIcon}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <InfoCard
            title="Total de Erros"
            value={data.totalErrors}
            Icon={ErrorIcon}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <InfoCard
            title="Tempo Médio"
            value={`${data.averageProcessingTime} ms`}
            Icon={TimerIcon}
          />
        </Grid>
        <Grid item xs={12}>
          <Histogram title="Conversões por Dia" data={conversionsPerDayData} />
        </Grid>
        <Grid item xs={12}>
          <Histogram
            title="Tempo Médio Processado por Dia"
            data={timeProcessedByDayData}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
