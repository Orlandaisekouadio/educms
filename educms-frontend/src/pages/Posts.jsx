import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, TextField, MenuItem, Chip } from '@mui/material';
import api from '../api';
import { useAuth } from '../auth';

export function Posts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const canWrite = user && ['admin', 'editor', 'author'].includes(user.role);

  const load = (q = '') => api.get(`/posts?limit=20${q ? `&search=${encodeURIComponent(q)}` : ''}`).then((r) => setPosts(r.data.data.posts));
  useEffect(() => { load(); }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>Posts</Typography>
        <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load(search)} />
        {canWrite && <Button component={Link} to="/posts/new" variant="contained">New post</Button>}
      </Box>
      {posts.map((p) => (
        <Card key={p.post_id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6"><Link to={`/posts/${p.slug}`}>{p.title}</Link></Typography>
            <Typography color="text.secondary" variant="body2">{p.excerpt} — by {p.author_name} · {p.view_count} views · {p.status}</Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>{(p.tags || []).map((t) => <Chip key={t} label={t} size="small" />)}</Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    api.get(`/posts/${slug}`).then((r) => {
      setPost(r.data.data);
      api.get(`/comments/post/${r.data.data.post_id}`).then((c) => setComments(c.data.data)).catch(() => {});
    }).catch(() => setPost(false));
  }, [slug]);

  const submitComment = async () => {
    await api.post(`/comments/post/${post.post_id}`, { content: draft });
    setDraft('');
    const c = await api.get(`/comments/post/${post.post_id}`);
    setComments(c.data.data);
  };

  if (post === null) return <Typography>Loading…</Typography>;
  if (post === false) return <Typography>Post not found</Typography>;

  return (
    <Box>
      <Typography variant="h4">{post.title}</Typography>
      <Typography color="text.secondary" variant="body2">By {post.author_name} · {post.view_count} views · {post.like_count} likes</Typography>
      <Box sx={{ my: 2 }} dangerouslySetInnerHTML={{ __html: post.content }} />
      <Button variant="outlined" onClick={() => api.post(`/posts/${post.post_id}/like`).then((r) => setPost({ ...post, like_count: r.data.data.like_count }))}>Like ({post.like_count})</Button>
      <Typography variant="h6" sx={{ mt: 3 }}>Comments ({comments.length})</Typography>
      {comments.map((c) => <Typography key={c.comment_id} variant="body2" sx={{ my: 1 }}>• {c.content} <i>— {c.username || 'guest'}</i></Typography>)}
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <TextField fullWidth size="small" label="Write a comment" value={draft} onChange={(e) => setDraft(e.target.value)} />
        <Button variant="contained" onClick={submitComment} disabled={!draft}>Send</Button>
      </Box>
    </Box>
  );
}

export function PostEditor() {
  const nav = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', status: 'draft' });

  const save = async () => {
    await api.post('/posts', { ...form });
    nav('/posts');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4">New post</Typography>
      <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      <TextField label="Content (HTML allowed)" multiline rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
      <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
        <MenuItem value="draft">Draft</MenuItem>
        <MenuItem value="published">Published</MenuItem>
        <MenuItem value="archived">Archived</MenuItem>
      </TextField>
      <Button variant="contained" onClick={save}>Save</Button>
    </Box>
  );
}
