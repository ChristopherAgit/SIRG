import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/login.css';

function decodeJwtRoles(token: string): string[] {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    const roles = decoded.roles;
    if (!roles) return [];
    return Array.isArray(roles) ? roles : [roles];
  } catch {
    return [];
  }
}

export default function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, password }),
      });
      const data = await res.json();
      if (!res.ok || data.hasError) {
        alert('Credenciales incorrectas');
        setLoading(false);
        return;
      }
      const token = data.accessToken || data.accessToken || data.accessToken; // try potential keys
      const access = token ?? data.AccessToken ?? data.accessToken;
      if (!access) {
        alert('No se recibió token');
        setLoading(false);
        return;
      }
      const roles = decodeJwtRoles(access);
      const auth = { token: access, roles, name: data.name ?? data.Name ?? '' };
      localStorage.setItem('sirg_auth', JSON.stringify(auth));

      // redirect to admin if admin, mesero if mesero, otherwise home
      if (roles.includes('Administrador')) navigate('/admin');
      else if (roles.includes('Mesero')) navigate('/mesero');
      else navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" role="form" aria-labelledby="loginTitle">
        <h2 id="loginTitle" className="login-title">Iniciar sesión</h2>
        <form onSubmit={submit}>
          <div className="login-field">
            <label htmlFor="userName">Usuario</label>
            <input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} required placeholder="ej. mesero" />
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>

          <div className="login-actions">
            <small style={{ color: '#475569' }}>¿Olvidaste la contraseña?</small>
            <button className="login-btn" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
