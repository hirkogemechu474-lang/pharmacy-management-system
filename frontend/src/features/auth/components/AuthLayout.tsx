import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="auth-screen">
      <section className="auth-brand-panel">
        <div className="brand-wrapper">
          <div className="brand-mark">
            <span />
            <strong>PharmaFlow</strong>
          </div>
          <div className="brand-copy">
            <h2>{title}</h2>
            <p>{subtitle ?? 'Sign in to manage your pharmacy account.'}</p>
          </div>
          <div className="brand-stats" aria-hidden="true">
            <div className="stat">
              <strong>98%</strong>
              <span>Stock health</span>
            </div>
            <div className="stat">
              <strong>42</strong>
              <span>Active orders</span>
            </div>
            <div className="stat">
              <strong>24/7</strong>
              <span>Secure access</span>
            </div>
          </div>
          <div className="brand-glow brand-glow-top" />
          <div className="brand-glow brand-glow-bottom" />
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">{children}</div>
      </section>
    </div>
  );
}
