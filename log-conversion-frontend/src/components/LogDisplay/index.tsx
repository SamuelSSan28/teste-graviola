import React from "react";
import { Typography, Paper, Button, Box } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';

interface Props {
  title: string;
  log: string;
  handleDownload?: () => void;
}

const LogDisplay: React.FC<Props> = ({ title, log, handleDownload }) => {
  return (
    <Paper style={{ padding: 16, display: "flex", flexDirection: "column", height: "100%" }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">{title}</Typography>
        {handleDownload && (
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            size="small"
            style={{ minWidth: 'initial' }}
          >
            Baixar
          </Button>
        )}
      </Box>
      <div style={{ overflowY: 'auto', maxHeight: 430, marginTop: 8 }}>
        <Typography variant="body1" style={{ whiteSpace: "pre-wrap" }}>
          {log || "Nenhum log disponível"}
        </Typography>
      </div>
    </Paper>
  );
};

export default LogDisplay;
