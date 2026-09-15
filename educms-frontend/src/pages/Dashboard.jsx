import { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import api from '../api';

export function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/posts?limit=1').then((r) => r.data.data.pagination.totalItems).catch(() => 0),
      api.get('/users/stats/overview').then((r) => r.data.data.totals).catch(() => null),
    ]).then(([totalPosts, totals]) => setStats({ totalPosts, totals }));
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}><Typography variant="h4">Analytics Dashboard</Typography></Grid>
      {[
        ['Total posts (paginated)', stats?.totalPosts ?? '…'],
        ['Published posts', stats?.totals?.published_posts ?? '…'],
        ['Total views', stats?.totals?.total_views ?? '…'],
      ].map(([label, value]) => (
        <Grid item xs={12} sm={4} key={label}>
          <Card><CardContent>
            <Typography color="text.secondary">{label}</Typography>
            <Typography variant="h4">{String(value)}</Typography>
          </CardContent></Card>
        </Grid>
      ))}
    </Grid>
  );
}
