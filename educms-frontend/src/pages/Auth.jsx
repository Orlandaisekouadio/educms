import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../auth';

export function Login() {
  const [email, setEmail] = useState('admin@educms.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try { await login(email, password); nav('/'); }
    catch (err) {
      if (!err.response) setError(`Cannot reach API at ${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'} — is the backend running?`);
      else setError(err.response.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={submit} sx={{ mt: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4">EduCMS Login</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" variant="contained">Login</Button>
        <Typography variant="body2">No account? <Link to="/register">Register</Link></Typography>
      </Box>
    </Container>
  );
}

export function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try { await register(form); nav('/'); }
    catch { setError('Registration failed (username/email may be taken)'); }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={submit} sx={{ mt: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4">Register</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <Button type="submit" variant="contained">Register</Button>
      </Box>
    </Container>
  );
}
