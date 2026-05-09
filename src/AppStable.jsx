import React, { useMemo, useState } from 'react';

const theme = {
  navy: '#0D3B6E',
  orange: '#F5831F',
  bg: '#F4F7FB',
  card: '#FFFFFF',
  border: '#DDE4EE',
  text: '#0D1F35',
  sub: '#64748B',
  green: '#059669',
  red: '#DC2626',
};

const employees = [
  { id: 1, name: 'Max Meister', role: 'Manager', dept: 'Leitung', status: 'Aktiv' },
  { id: 2, name: 'Thomas Becker', role: 'Vorarbeiter', dept: 'Bauhandwerk', status: 'Aktiv' },
  { id: 3, name: 'Lisa Hoffmann', role: 'Vorarbeiterin', dept: 'Reinigung', status: 'Aktiv' },
  { id: 4, name: 'Stefan Müller', role: 'Mitarbeiter', dept: 'Trockenbau', status: 'Aktiv' },
];

const projects = [
  { id: 1, name: 'Trockenbau Bürokomplex Nord', status: 'Aktiv', progress: 68, location: 'Hamburg' },
  { id: 2, name: 'Grundreinigung Bürogebäude', status: 'Wartet auf Material', progress: 42, location: 'Hamburg Mitte' },
  { id: 3, name: 'Laminat verlegen Nord', status: 'Abgeschlossen', progress: 100, location: 'Nordviertel' },
];

const inventory = [
  { id: 1, item: 'Trockenbauplatten', qty: 40, unit: 'Stk' },
  { id: 2, item: 'Reinigungsmittel Typ B', qty: 20, unit: 'L' },
  { id: 3, item: 'Schutzfolie', qty: 5, unit: 'Rolle' },
];

function StatCard({ label, value, hint }) {
  return (
    <div style={styles.card}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.hint}>{hint}</div>
    </div>
  );
}

function AppStable() {
  const [tab, setTab] = useState('dashboard');

  const activeProjects = useMemo(() => projects.filter(p => p.status !== 'Abgeschlossen').length, []);

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>⚡ WorkHub</div>
        <div style={styles.subtitle}>by ovivo.io</div>
        {[
          ['dashboard', 'Dashboard'],
          ['employees', 'Mitarbeiter'],
          ['projects', 'Projekte'],
          ['inventory', 'Lager'],
          ['tasks', 'Aufgaben'],
          ['reports', 'Berichte'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{ ...styles.navBtn, ...(tab === key ? styles.navBtnActive : {}) }}
          >
            {label}
          </button>
        ))}
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>WorkHub Dashboard</h1>
            <p style={styles.description}>Stabile Version geladen. Die alte App.jsx wird jetzt Schritt für Schritt repariert.</p>
          </div>
          <div style={styles.status}>Online ✅</div>
        </header>

        {tab === 'dashboard' && (
          <section>
            <div style={styles.grid}>
              <StatCard label="Aktive Projekte" value={activeProjects} hint="Live Übersicht" />
              <StatCard label="Mitarbeiter" value={employees.length} hint="Rollen & Rechte vorbereitet" />
              <StatCard label="Lager Artikel" value={inventory.length} hint="Inventar Basis aktiv" />
              <StatCard label="PDF Reports" value="Ready" hint="Modul vorbereitet" />
            </div>

            <div style={styles.panel}>
              <h2 style={styles.h2}>Aktuelle Projekte</h2>
              {projects.map(project => (
                <div key={project.id} style={styles.row}>
                  <div>
                    <strong>{project.name}</strong>
                    <div style={styles.small}>{project.location} · {project.status}</div>
                  </div>
                  <div style={styles.progressWrap}>
                    <div style={{ ...styles.progress, width: `${project.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'employees' && (
          <section style={styles.panel}>
            <h2 style={styles.h2}>Mitarbeiter</h2>
            {employees.map(emp => (
              <div key={emp.id} style={styles.row}>
                <div><strong>{emp.name}</strong><div style={styles.small}>{emp.role} · {emp.dept}</div></div>
                <span style={styles.badge}>{emp.status}</span>
              </div>
            ))}
          </section>
        )}

        {tab === 'projects' && (
          <section style={styles.panel}>
            <h2 style={styles.h2}>Projekte</h2>
            {projects.map(project => (
              <div key={project.id} style={styles.row}>
                <div><strong>{project.name}</strong><div style={styles.small}>{project.location}</div></div>
                <span style={styles.badge}>{project.status}</span>
              </div>
            ))}
          </section>
        )}

        {tab === 'inventory' && (
          <section style={styles.panel}>
            <h2 style={styles.h2}>Lager & Material</h2>
            {inventory.map(item => (
              <div key={item.id} style={styles.row}>
                <strong>{item.item}</strong>
                <span>{item.qty} {item.unit}</span>
              </div>
            ))}
          </section>
        )}

        {tab === 'tasks' && (
          <section style={styles.panel}>
            <h2 style={styles.h2}>Aufgaben</h2>
            <div style={styles.empty}>Aufgabenmodul bereit. Nächster Schritt: echte Aufgabenlogik aus App.jsx sauber integrieren.</div>
          </section>
        )}

        {tab === 'reports' && (
          <section style={styles.panel}>
            <h2 style={styles.h2}>Berichte</h2>
            <div style={styles.empty}>PDF-Reports vorbereitet. Nächster Schritt: Export-Funktion wieder aktivieren.</div>
          </section>
        )}
      </main>
    </div>
  );
}

const styles = {
  app: { minHeight: '100vh', display: 'flex', background: theme.bg, color: theme.text, fontFamily: 'Arial, sans-serif' },
  sidebar: { width: 260, background: theme.navy, color: 'white', padding: 24, boxSizing: 'border-box' },
  logo: { fontSize: 24, fontWeight: 800, marginBottom: 4 },
  subtitle: { fontSize: 13, opacity: 0.75, marginBottom: 28 },
  navBtn: { display: 'block', width: '100%', padding: '12px 14px', marginBottom: 8, border: 0, borderRadius: 12, background: 'transparent', color: 'white', textAlign: 'left', cursor: 'pointer', fontSize: 15 },
  navBtnActive: { background: theme.orange },
  main: { flex: 1, padding: 32, boxSizing: 'border-box' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { margin: 0, fontSize: 32 },
  description: { margin: '6px 0 0', color: theme.sub },
  status: { background: '#ECFDF5', color: theme.green, padding: '10px 14px', borderRadius: 999, fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 20 },
  card: { background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 20, boxShadow: '0 8px 24px rgba(13, 59, 110, 0.06)' },
  statLabel: { color: theme.sub, fontSize: 14 },
  statValue: { fontSize: 30, fontWeight: 800, marginTop: 8 },
  hint: { marginTop: 6, color: theme.sub, fontSize: 13 },
  panel: { background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 18, padding: 22, boxShadow: '0 8px 24px rgba(13, 59, 110, 0.06)' },
  h2: { marginTop: 0 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${theme.border}`, gap: 16 },
  small: { color: theme.sub, fontSize: 13, marginTop: 4 },
  badge: { background: '#E8F0F9', color: theme.navy, padding: '7px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 },
  progressWrap: { width: 160, height: 8, background: '#E8F0F9', borderRadius: 999, overflow: 'hidden' },
  progress: { height: '100%', background: theme.orange },
  empty: { padding: 24, background: '#F8FAFC', borderRadius: 14, color: theme.sub },
};

export default AppStable;
