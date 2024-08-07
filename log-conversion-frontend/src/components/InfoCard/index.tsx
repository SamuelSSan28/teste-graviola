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
        <Box>
          <Box display="flex" alignItems="center">
            <Icon color="primary"   sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
            <Typography
              sx={{
                fontSize: { xs: '0.9rem', sm: '1.2rem', md: '1.15rem' },
              }}
            >
              {title}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: { xs: '1.2rem', sm: '1.2rem', md: '1.5rem' },
            }}
          >
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
