import { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, TextField } from '@mui/material';
import api from '../api';

export function AdminPanels() {
  const [categories, setCategories] = useState([]);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [newCat, setNewCat] = useState('');

  const reload = () => {
    api.get('/categories').then((r) => setCategories(r.data.data)).catch(() => {});
    api.get('/comments').then((r) => setComments(r.data.data.comments)).catch(() => {});
    api.get('/users').then((r) => setUsers(r.data.data.users)).catch(() => {});
  };
  useEffect(reload, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h5">Categories ({categories.length})</Typography>
        <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
          <TextField size="small" label="New category" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
          <Button variant="outlined" onClick={() => api.post('/categories', { name: newCat }).then(() => { setNewCat(''); reload(); })}>Add</Button>
        </Box>
        <List>{categories.map((c) => <ListItem key={c.category_id}><ListItemText primary={c.name} secondary={c.slug} /></ListItem>)}</List>
      </Box>
      <Box>
        <Typography variant="h5">Comments moderation ({comments.length})</Typography>
        <List>{comments.map((c) => (
          <ListItem key={c.comment_id} secondaryAction={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={() => api.patch(`/comments/${c.comment_id}`, { status: 'approved' }).then(reload)}>Approve</Button>
              <Button size="small" color="error" onClick={() => api.delete(`/comments/${c.comment_id}`).then(reload)}>Delete</Button>
            </Box>
          }><ListItemText primary={c.content} secondary={`${c.post_title || ''} · ${c.status}`} /></ListItem>
        ))}</List>
      </Box>
      <Box>
        <Typography variant="h5">Users ({users.length})</Typography>
        <List>{users.map((u) => <ListItem key={u.user_id}><ListItemText primary={`${u.username} (${u.role})`} secondary={u.email} /></ListItem>)}</List>
      </Box>
    </Box>
  );
}
