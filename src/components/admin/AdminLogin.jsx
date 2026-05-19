import { useState } from 'react';
import styles from './AdminApp.module.css';

export default function AdminLogin({ baseUrl, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesion');
      }

      if (data.token) {
        onSuccess(data.token);
      } else {
        throw new Error('Token invalido');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <form className={styles.loginCard} onSubmit={handleSubmit}>
        <h1>Acceso administrador</h1>
        <p>Ingresa con las credenciales configuradas en el backend.</p>

        <label className={styles.label}>
          Usuario
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className={styles.input}
            required
          />
        </label>

        <label className={styles.label}>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={styles.input}
            required
          />
        </label>

        {error ? <div className={styles.error}>{error}</div> : null}

        <button type="submit" className={styles.primary} disabled={loading}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
