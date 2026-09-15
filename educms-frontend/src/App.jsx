import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { AuthProvider, useAuth } from './auth';
import { Login, Register } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Posts, PostDetail, PostEditor } from './pages/Posts';
import { AdminPanels } from './pages/Admin';

function Guard({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Typography sx={{ p: 3 }}>Loading…</Typography>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function Nav() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>EduCMS</Link></Typography>
        <Button color="inherit" component={Link} to="/posts">Posts</Button>
        {user && <Button color="inherit" component={Link} to="/admin">Admin</Button>}
        {user
          ? <><Typography sx={{ mx: 2 }}>{user.username} ({user.role})</Typography><Button color="inherit" onClick={() => { logout(); nav('/login'); }}>Logout</Button></>
          : <Button color="inherit" component={Link} to="/login">Login</Button>}
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Nav />
      <Container sx={{ my: 3 }}>
        <Box component="main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Guard><Dashboard /></Guard>} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/new" element={<Guard roles={['admin', 'editor', 'author']}><PostEditor /></Guard>} />
            <Route path="/posts/:slug" element={<PostDetail />} />
            <Route path="/admin" element={<Guard roles={['admin', 'editor']}><AdminPanels /></Guard>} />
          </Routes>
        </Box>
      </Container>
    </AuthProvider>
  );
}
