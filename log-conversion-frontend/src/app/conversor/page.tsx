"use client";
import React, { useState } from "react";
import {
  Typography,
  Container,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import LogDisplay from "@/components/LogDisplay";

function ConvertLogs() {
  const [url, setUrl] = useState("");
  const [logs, setLogs] = useState({ received: "", converted: "" });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "info" | "warning" | "error",
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleUrlSubmit = async () => {
    if (!url) {
      setSnackbar({
        open: true,
        message: "Por favor, insira uma URL válida.",
        severity: "warning",
      });
      return;
    }

    try {
      const response = await fetch(`/api/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sourceUrl: url }),
      });

      if (!response.ok) throw new Error("Falha na resposta do servidor.");

      const blob = await response.blob();
      const urlReceived = URL.createObjectURL(blob);

      setLogs({ received: url, converted: urlReceived });
      setSnackbar({
        open: true,
        message: "Logs convertidos com sucesso!",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: "Erro ao converter logs: " + error.message,
        severity: "error",
      });
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    element.href = logs.converted;
    element.download = "convertedLog.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        Converta seus logs do formato <strong>MINHA CDN</strong> para o formato{" "}
        <strong>Agora</strong>
      </Typography>
      <TextField
        label="URL do Log MINHA CDN"
        fullWidth
        margin="normal"
        variant="outlined"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyPress={(event) => {
          if (event.key === "Enter") {
            handleUrlSubmit();
          }
        }}
      />
      <Button
        onClick={handleUrlSubmit}
        variant="contained"
        color="primary"
        style={{ marginTop: 16, float: "right" }}
      >
        Converter
      </Button>

      <Grid container spacing={2} style={{ marginTop: 32 }}>
        <Grid item xs={12} md={6}>
          <LogDisplay title="Log Recebido" log={logs.received} />
        </Grid>
        <Grid item xs={12} md={6}>
          <LogDisplay
            title="Log Convertido"
            log={logs.converted}
            handleDownload={handleDownload}
          />
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ConvertLogs;
