import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './AdminLogin.module.css';

export default function AdminLogin({ baseUrl, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [requireCaptcha, setRequireCaptcha] = useState(false);
  const [captchaTimestamp, setCaptchaTimestamp] = useState(Date.now());

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { username, password };
      if (requireCaptcha) {
        payload.captchaToken = captchaToken;
      }

      const response = await fetch(`${baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.requireCaptcha) {
          setRequireCaptcha(true);
          setCaptchaTimestamp(Date.now());
          setCaptchaToken('');
        }
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
        <div className={styles.header}>
          <h1>Acceso administrador</h1>
          <p>Ingresa tus credenciales para continuar.</p>
        </div>

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
          <div className={styles.inputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={styles.input}
              required
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Alternar visibilidad de la contraseña"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </label>

        {requireCaptcha && (
          <label className={styles.label}>
            Resuelve la suma (Seguridad)
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', marginTop: '5px' }}>
              <img 
                src={`${baseUrl}/api/admin/captcha?t=${captchaTimestamp}`} 
                alt="Captcha Matemático" 
                style={{ borderRadius: '6px', border: '1px solid #444', background: '#fff', height: '40px' }}
              />
              <button 
                type="button" 
                onClick={() => setCaptchaTimestamp(Date.now())}
                style={{ 
                  padding: '0.4rem 0.8rem', 
                  borderRadius: '6px', 
                  border: 'none', 
                  background: '#333', 
                  color: 'white', 
                  cursor: 'pointer',
                  height: '40px'
                }}
                title="Recargar CAPTCHA"
              >
                ↻
              </button>
            </div>
            <input
              type="text"
              value={captchaToken}
              onChange={(event) => setCaptchaToken(event.target.value)}
              className={styles.input}
              placeholder="Ej: 8"
              required
            />
          </label>
        )}

        {error ? <div className={styles.error}>{error}</div> : null}

        <button type="submit" className={styles.primary} disabled={loading}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
