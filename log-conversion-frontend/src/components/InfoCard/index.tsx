import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface InfoCardProps {
  title: string;
  value: number | string;
  Icon: React.ComponentType<SvgIconProps>;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, Icon }) => {
  return (
    <Card>
      <CardContent>
        <Box  >
          <Box display="flex" alignItems="center">
            <Icon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <Typography variant="h4">{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
