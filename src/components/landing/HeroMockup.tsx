export function HeroMockup() {
  return (
    <div className="hero-scale mockup-stage mt-20 px-4 md:px-0">
      <div className="pointer-events-none absolute -top-10 inset-x-0 mx-auto h-[340px] w-[340px] bg-primary opacity-20 blur-[110px] orb-pulse" />

      <div className="float-card float-card-1">
        <div className="float-label">Nächster Post</div>
        <div className="sched-time">Heute · 09:15</div>
        <div className="sched-sub">Instagram · KI-generiert ✦</div>
      </div>

      <div className="float-card float-card-2">
        <div className="float-label">Reichweite ↑</div>
        <div className="float-value">
          +24 %
          <span className="float-pill">90 Tage</span>
        </div>
      </div>

      <div className="float-card float-card-3">
        <div className="float-label">Neue Nachrichten</div>
        <div className="avatar-row">
          <div className="mock-avatar">LK</div>
          <div className="mock-avatar">MR</div>
          <div className="mock-avatar">TN</div>
        </div>
        <div className="float-value">
          12 DMs
          <span className="float-pill blue">KI-Antwort</span>
        </div>
      </div>

      <div className="mockup-main">
        <div className="mockup-topbar">
          <div className="mock-dots">
            <div className="mock-dot r" />
            <div className="mock-dot y" />
            <div className="mock-dot g" />
          </div>
          <div className="mockup-topbar-title">Klicklocal · KI-Studio</div>
        </div>

        <div className="mockup-body">
          <div className="mock-sidebar">
            <div className="mock-sidebar-item active">
              <span>✦</span> KI-Studio
            </div>
            <div className="mock-sidebar-item">
              <span>📅</span> Kalender
            </div>
            <div className="mock-sidebar-item">
              <span>💬</span> Posteingang
            </div>
            <div className="mock-sidebar-item">
              <span>📊</span> Insights
            </div>
            <div className="mock-sidebar-item" style={{ marginTop: 'auto' }}>
              <span>⚙</span> Einstellungen
            </div>
          </div>

          <div className="mock-content">
            <div className="mock-header">Content diese Woche · 3 Posts geplant</div>

            <div className="post-card">
              <div className="post-platform ig">📸</div>
              <div className="post-meta">
                <div className="post-title">Frühlingsangebot – Reel</div>
                <div className="post-body">
                  Entdecke unsere neuen Produkte – frisch, farbenfroh und perfekt
                  für die Saison …
                </div>
                <div className="post-chips">
                  <span className="post-chip green">Geplant · Mo 09:15</span>
                  <span className="post-chip">#frühling</span>
                  <span className="post-chip">#angebot</span>
                </div>
              </div>
            </div>

            <div className="post-card">
              <div className="post-platform tt">🎵</div>
              <div className="post-meta">
                <div className="post-title">Behind the Scenes</div>
                <div className="post-body">
                  Wie wir jeden Morgen starten – ein Blick hinter die Kulissen …
                </div>
                <div className="post-chips">
                  <span className="post-chip">Entwurf</span>
                  <span className="post-chip">#bts</span>
                </div>
              </div>
            </div>

            <div className="mock-ai-row">
              <div className="ai-dot" />
              <div className="ai-text">
                <strong>KI schlägt vor:</strong> Poste mittwochs zwischen 18–20
                Uhr für +31 % mehr Reichweite.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
