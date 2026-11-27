import { useState, type FormEvent, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../components/AuthLayout';
import { SocialLoginButtons } from '../components/SocialLoginButtons';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem('rememberMe') === 'true',
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const computePasswordStrength = useCallback((val: string) => {
    let score = 0;
    if (val.length >= 8) score += 1;
    if (/[A-Z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;
    if (val.length >= 12) score += 1;
    return Math.min(score, 4);
  }, []);

  useEffect(() => {
    setPasswordStrength(password ? computePasswordStrength(password) : 0);
  }, [password, computePasswordStrength]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email.trim().toLowerCase(), password);
      if (result && 'requiresTwoFactor' in result) {
        sessionStorage.setItem('totpTempToken', result.tempToken);
        navigate('/auth/totp-verify', {
          state: { tempToken: result.tempToken },
        });
      } else {
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        navigate('/dashboard');
      }
    } catch (err: any) {
      const graphQLErrors = err?.graphQLErrors ?? err?.errors ?? [];
      const graphqlMessage = graphQLErrors[0]?.message;
      const httpMessage = err?.response?.data?.message;
      setError(graphqlMessage || httpMessage || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your pharmacy account">
      <div className="login-shell">
        <aside className="login-brand">
          <div className="brand-content">
            <div className="brand-mark">
              <span className="mark-glyph">+</span>
            </div>
            <div className="brand-identity">
              <strong className="brand-name">PharmaFlow</strong>
              <span className="brand-kind">Pharmacy ERP</span>
            </div>
            <p className="brand-tagline">
              Secure access to inventory, sales, purchasing, and reporting for
              modern pharmacy teams.
            </p>
            <div className="brand-features">
              <div className="feature-row">
                <span className="feature-dot" aria-hidden="true"></span>
                <span>Real-time inventory tracking</span>
              </div>
              <div className="feature-row">
                <span className="feature-dot" aria-hidden="true"></span>
                <span>Purchase order management</span>
              </div>
              <div className="feature-row">
                <span className="feature-dot" aria-hidden="true"></span>
                <span>Sales analytics &amp; reporting</span>
              </div>
            </div>
          </div>
          <div className="brand-glow brand-glow-top" aria-hidden="true"></div>
          <div className="brand-glow brand-glow-bottom" aria-hidden="true"></div>
        </aside>

        <main className="login-form-side">
          <div className="form-card">
            <div className="form-header">
              <h2 className="form-title">Sign in</h2>
              <p className="form-subtitle">
                Enter your credentials below to continue
              </p>
            </div>

            {error && (
              <div className="form-banner form-banner-error" role="alert">
                <span className="banner-icon" aria-hidden="true">!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="auth-form">
              <div className="field-group">
                <label htmlFor="email" className="field-label">
                  Email or phone
                </label>
                <div className="field-input">
                  <span className="field-icon">@</span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@pharmacy.com"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <div className="field-label-row">
                  <label htmlFor="password" className="field-label">
                    Password
                  </label>
                  <button
                    type="button"
                    className="field-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <div className="field-input">
                  <span className="field-icon">🔒</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                {password && (
                  <div className="strength-meter">
                    <span className="strength-label">Password strength</span>
                    <div className="strength-track">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`strength-cell ${
                            i < passwordStrength ? 'strength-cell-filled' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="auth-actions-row">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Keep me signed in</span>
                </label>
                <Link to="/auth/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                <span className="submit-label">
                  {loading ? 'Signing in…' : 'Continue'}
                </span>
                {loading && (
                  <span className="submit-spinner" aria-hidden="true">
                    ↻
                  </span>
                )}
              </button>
            </form>

            <div className="form-divider">
              <span>or continue with</span>
            </div>

            <SocialLoginButtons />

            <div className="demo-hint">
              <strong className="demo-hint-label">Demo accounts</strong>
              <div className="demo-hint-list">
                <div className="demo-hint-row">
                  <span className="demo-hint-email">admin@pharmacy.com</span>
                  <span className="demo-hint-pass">password123</span>
                </div>
                <div className="demo-hint-row">
                  <span className="demo-hint-email">employee@pharmacy.com</span>
                  <span className="demo-hint-pass">password123</span>
                </div>
                <div className="demo-hint-row">
                  <span className="demo-hint-email">customer@pharmacy.com</span>
                  <span className="demo-hint-pass">password123</span>
                </div>
              </div>
            </div>

            <div className="form-footer">
              Don't have an account?{' '}
              <Link to="/auth/register" className="footer-link">
                Create an account
              </Link>
            </div>
          </div>
        </main>
      </div>
    </AuthLayout>
  );
}
