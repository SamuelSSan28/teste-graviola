// src/components/DashboardSkeleton.tsx
import React from "react";
import { Grid, Card, CardContent, Skeleton } from "@mui/material";

const DashboardSkeleton: React.FC = () => {
  return (
    <Grid container spacing={3}>
      {Array.from(new Array(4)).map((_, index) => (
        <Grid item xs={12} md={3} key={index}>
          <Card>
            <CardContent>
              <Skeleton variant="text" height={40} />
              <Skeleton variant="rectangular" height={80} />
            </CardContent>
          </Card>
        </Grid>
      ))}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" height={300} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" height={300} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardSkeleton;
