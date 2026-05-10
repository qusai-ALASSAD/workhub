import React, { useMemo, useState } from "react";

const C = {
  navy: "#081A36",
  navy2: "#0E2A55",
  orange: "#FF7A1A",
  orange2: "#FFF3E8",
  bg: "#F6F8FC",
  card: "#FFFFFF",
  text: "#101828",
  sub: "#667085",
  border: "#D9E2EF",
  green: "#059669",
  greenL: "#ECFDF3",
  red: "#DC2626",
  redL: "#FEF3F2",
  yellow: "#D97706",
  yellowL: "#FFFAEB",
  blueL: "#EEF4FF",
};

const users = [
  { id: 1, name: "Kosy Alassad", role: "admin", dept: "Management", avatar: "KA" },
  { id: 2, name: "Hotel Berlin Account", role: "hotel", dept: "Hotel Berlin", avatar: "HB" },
  { id: 3, name: "Thomas Becker", role: "manager", dept: "Projektleitung", avatar: "TB" },
  { id: 4, name: "Lisa Hoffmann", role: "employee", dept: "Lager", avatar: "LH" },
  { id: 5, name: "Stefan Müller", role: "employee", dept: "Baustelle", avatar: "SM" },
];

const projectsSeed = [
  { id: 1, name: "Hotel Berlin Renovierung", client: "Hotel Berlin", location: "Berlin · Brandenburg", managerId: 3, status: "Aktiv" },
  { id: 2, name: "Grundreinigung Bürogebäude", client: "Kunde GmbH", location: "Hamburg", managerId: 3, status: "Aktiv" },
  { id: 3, name: "Lager & Material Organisation", client: "Intern", location: "Hamburg", managerId: 1, status: "Intern" },
];

const warehouseSeed = [
  { id: 1, name: "Trockenbauplatten", qty: 40, unit: "Stk", min: 10, price: 8.5 },
  { id: 2, name: "Schrauben 4x40mm", qty: 100, unit: "Pkg", min: 20, price: 5.8 },
  { id: 3, name: "Schutzfolie", qty: 5, unit: "Rolle", min: 3, price: 14.9 },
  { id: 4, name: "Reinigungsmittel Typ B", qty: 20, unit: "L", min: 8, price: 4.5 },
];

function today(addDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + addDays);
  return d.toISOString().slice(0, 10);
}

const orderSeed = [
  { id: 1, projectId: 1, type: "warehouse", title: "Schutzfolie", qty: 3, unit: "Rolle", requestedBy: 5, responsibleId: 3, status: "ausstehend", note: "Für Hotel Berlin Baustelle", supplier: "Lager", createdAt: today(), comments: [] },
  { id: 2, projectId: 1, type: "rental", title: "Bohrmaschine", qty: 1, unit: "Stk", requestedBy: 5, responsibleId: 3, status: "genehmigt", note: "Von externer Firma für 2 Tage", supplier: "Externe Mietfirma", createdAt: today(), comments: [{ by: 3, text: "Bitte Lieferung morgen bestätigen.", time: "08:15" }] },
];

const invoiceSeed = [
  { id: 1, nr: "RE-2026-001", projectId: 1, client: "Hotel Berlin", title: "Teilrechnung Renovierung", date: today(), dueDate: today(14), status: "offen", items: [{ name: "Arbeitsleistung", qty: 12, unit: "Std", price: 45 }, { name: "Material", qty: 1, unit: "Pauschal", price: 180 }] },
];

function useStored(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });
  const save = (next) => {
    const resolved = typeof next === "function" ? next(value) : next;
    setValue(resolved);
    localStorage.setItem(key, JSON.stringify(resolved));
  };
  return [value, save];
}

function Logo({ small = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: small ? 34 : 46, height: small ? 34 : 46, borderRadius: 14, background: `linear-gradient(135deg, ${C.orange}, #FFB067)`, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: small ? 20 : 28, boxShadow: "0 10px 26px rgba(255,122,26,.25)" }}>O</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: small ? 16 : 21 }}>Ovivo WorkHub</div>
        <div style={{ color: small ? "rgba(255,255,255,.7)" : C.sub, fontSize: 12 }}>AI Operations Platform</div>
      </div>
    </div>
  );
}

function App() {
  const [tab, setTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useStored("ovivo-current-user", users[0]);
  const [projects] = useStored("ovivo-projects", projectsSeed);
  const [warehouse, setWarehouse] = useStored("ovivo-warehouse", warehouseSeed);
  const [orders, setOrders] = useStored("ovivo-orders", orderSeed);
  const [invoices, setInvoices] = useStored("ovivo-invoices", invoiceSeed);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const notifications = useMemo(() => orders.filter(o => o.responsibleId === currentUser.id && o.status === "ausstehend"), [orders, currentUser]);
  const lowStock = warehouse.filter(m => m.qty <= m.min);

  const tabs = [
    ["dashboard", "Dashboard", "📊"],
    ["orders", "Bestellungen", "🛒"],
    ["warehouse", "Lager", "📦"],
    ["invoices", "Rechnungen", "🧾"],
    ["projects", "Projekte", "🏗"],
    ["accounts", "Accounts", "👥"],
  ];

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <Logo small />
        <div style={{ marginTop: 24 }}>
          {tabs.map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)} style={{ ...styles.nav, ...(tab === id ? styles.navActive : {}) }}>
              <span>{icon}</span><span>{label}</span>
              {id === "orders" && notifications.length > 0 && <b style={styles.navBadge}>{notifications.length}</b>}
            </button>
          ))}
        </div>
        <div style={styles.userBox}>
          <label style={styles.labelLight}>Aktueller Account</label>
          <select value={currentUser.id} onChange={(e) => setCurrentUser(users.find(u => u.id === Number(e.target.value)) || users[0])} style={styles.selectDark}>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>{tabs.find(t => t[0] === tab)?.[1]}</h1>
            <p style={styles.desc}>Hotel Berlin · Warehouse · Orders · Rechnungen · Druckfunktion</p>
          </div>
          <div style={styles.topRight}>
            <div style={styles.online}>Online ✅</div>
            <Avatar user={currentUser} />
          </div>
        </header>

        {tab === "dashboard" && <Dashboard projects={projects} orders={orders} invoices={invoices} lowStock={lowStock} notifications={notifications} />}
        {tab === "orders" && <Orders projects={projects} orders={orders} setOrders={setOrders} warehouse={warehouse} users={users} currentUser={currentUser} editingOrder={editingOrder} setEditingOrder={setEditingOrder} />}
        {tab === "warehouse" && <Warehouse warehouse={warehouse} setWarehouse={setWarehouse} />}
        {tab === "invoices" && <Invoices projects={projects} invoices={invoices} setInvoices={setInvoices} editingInvoice={editingInvoice} setEditingInvoice={setEditingInvoice} />}
        {tab === "projects" && <Projects projects={projects} users={users} />}
        {tab === "accounts" && <Accounts users={users} />}
      </main>
    </div>
  );
}

function Dashboard({ projects, orders, invoices, lowStock, notifications }) {
  return (
    <section>
      <div style={styles.grid4}>
        <Stat label="Aktive Projekte" value={projects.filter(p => p.status === "Aktiv").length} hint="inkl. Hotel Berlin" icon="🏗" />
        <Stat label="Offene Bestellungen" value={orders.filter(o => o.status === "ausstehend").length} hint="an Projektleitung" icon="🛒" />
        <Stat label="Offene Rechnungen" value={invoices.filter(i => i.status === "offen").length} hint="druckbar & editierbar" icon="🧾" />
        <Stat label="Lager Warnungen" value={lowStock.length} hint="Mindestbestand" icon="⚠️" />
      </div>
      {notifications.length > 0 && <div style={styles.alert}>🔔 Neue Bestellungen für dich: {notifications.map(n => n.title).join(" · ")}</div>}
      <Panel title="Letzte Bestellungen">
        {orders.slice(0, 4).map(o => <ListRow key={o.id} left={<><b>{o.title}</b><small>{o.type === "rental" ? "Gemietete Maschine" : "Material aus Lager"}</small></>} right={<Status status={o.status} />} />)}
      </Panel>
    </section>
  );
}

function Orders({ projects, orders, setOrders, warehouse, users, currentUser, editingOrder, setEditingOrder }) {
  const blank = { id: null, projectId: projects[0]?.id || 1, type: "warehouse", title: "", qty: 1, unit: "Stk", requestedBy: currentUser.id, responsibleId: projects[0]?.managerId || 1, status: "ausstehend", note: "", supplier: "Lager", createdAt: today(), comments: [] };
  const [draft, setDraft] = useState(blank);
  const [commentText, setCommentText] = useState({});

  const openForm = (order = null) => {
    const base = order ? JSON.parse(JSON.stringify(order)) : blank;
    setDraft(base);
    setEditingOrder(true);
  };
  const save = () => {
    const project = projects.find(p => p.id === Number(draft.projectId));
    const fixed = { ...draft, projectId: Number(draft.projectId), requestedBy: Number(draft.requestedBy), responsibleId: project?.managerId || Number(draft.responsibleId), qty: Number(draft.qty || 1), createdAt: draft.createdAt || today() };
    if (!fixed.title.trim()) return alert("Bitte Titel/Material eingeben");
    setOrders(prev => fixed.id ? prev.map(o => o.id === fixed.id ? fixed : o) : [{ ...fixed, id: Date.now() }, ...prev]);
    setEditingOrder(false);
  };
  const updateStatus = (id, status) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  const addComment = (id) => {
    const text = (commentText[id] || "").trim();
    if (!text) return;
    setOrders(prev => prev.map(o => o.id === id ? { ...o, comments: [...(o.comments || []), { by: currentUser.id, text, time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) }] } : o));
    setCommentText(prev => ({ ...prev, [id]: "" }));
  };

  return <section>
    <div style={styles.actions}><button style={styles.primary} onClick={() => openForm()}>+ Neue Bestellung</button></div>
    <div style={styles.orderGrid}>{orders.map(o => {
      const p = projects.find(x => x.id === o.projectId);
      const responsible = users.find(u => u.id === o.responsibleId);
      return <div key={o.id} style={styles.card}>
        <div style={styles.cardHead}><div><b>{o.title}</b><small>{p?.name} · {p?.location}</small></div><Status status={o.status} /></div>
        <div style={styles.typeBox}>{o.type === "rental" ? "🏗 Gemietete Maschine von externer Firma" : "📦 Material aus dem Lager"}</div>
        <div style={styles.infoGrid}><Info k="Menge" v={`${o.qty} ${o.unit}`} /><Info k="Lieferant" v={o.supplier || "–"} /><Info k="Angefragt von" v={users.find(u => u.id === o.requestedBy)?.name || "–"} /><Info k="Zuständig" v={responsible?.name || "–"} /></div>
        {o.note && <p style={styles.note}>📝 {o.note}</p>}
        <div style={styles.commentArea}>
          {(o.comments || []).map((c, i) => <div key={i} style={styles.comment}><b>{users.find(u => u.id === c.by)?.name || "User"}</b> <span>{c.time}</span><div>{c.text}</div></div>)}
          <textarea value={commentText[o.id] || ""} onChange={e => setCommentText(v => ({ ...v, [o.id]: e.target.value }))} placeholder="Kommentar schreiben..." style={styles.textarea} rows={2} />
          <button style={styles.secondary} onClick={() => addComment(o.id)}>Kommentar speichern</button>
        </div>
        <div style={styles.btnRow}><button style={styles.secondary} onClick={() => openForm(o)}>Bearbeiten</button><button style={styles.ok} onClick={() => updateStatus(o.id, "genehmigt")}>Genehmigen</button><button style={styles.danger} onClick={() => updateStatus(o.id, "abgelehnt")}>Ablehnen</button><button style={styles.secondary} onClick={() => updateStatus(o.id, "geliefert")}>Geliefert</button></div>
      </div>})}</div>
    {editingOrder && <Modal title="Bestellung bearbeiten" onClose={() => setEditingOrder(false)}><OrderForm draft={draft} setDraft={setDraft} projects={projects} warehouse={warehouse} users={users} save={save} /></Modal>}
  </section>;
}

function OrderForm({ draft, setDraft, projects, warehouse, users, save }) {
  const project = projects.find(p => p.id === Number(draft.projectId));
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  return <div style={styles.formGrid}>
    <Field label="Projekt"><select style={styles.input} value={draft.projectId} onChange={e => { const p = projects.find(x => x.id === Number(e.target.value)); setDraft(d => ({ ...d, projectId: Number(e.target.value), responsibleId: p?.managerId || d.responsibleId })); }}>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
    <Field label="Typ"><select style={styles.input} value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value, supplier: e.target.value === "rental" ? "Externe Mietfirma" : "Lager" }))}><option value="warehouse">Material aus Lager</option><option value="rental">Maschine gemietet</option></select></Field>
    <Field label={draft.type === "rental" ? "Maschine" : "Material"}>{draft.type === "warehouse" ? <select style={styles.input} value={draft.title} onChange={e => set("title", e.target.value)}><option value="">Bitte wählen</option>{warehouse.map(m => <option key={m.id}>{m.name}</option>)}</select> : <input style={styles.input} value={draft.title} onChange={e => set("title", e.target.value)} placeholder="z.B. Bohrmaschine, Hebebühne" />}</Field>
    <Field label="Lieferant / Firma"><input style={styles.input} value={draft.supplier} onChange={e => set("supplier", e.target.value)} /></Field>
    <Field label="Menge"><input style={styles.input} type="number" value={draft.qty} onChange={e => set("qty", e.target.value)} /></Field>
    <Field label="Einheit"><input style={styles.input} value={draft.unit} onChange={e => set("unit", e.target.value)} /></Field>
    <Field label="Angefragt von"><select style={styles.input} value={draft.requestedBy} onChange={e => set("requestedBy", Number(e.target.value))}>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field>
    <Field label="Zuständig"><input style={styles.input} readOnly value={users.find(u => u.id === project?.managerId)?.name || "–"} /></Field>
    <div style={{ gridColumn: "1 / -1" }}><Field label="Notiz"><textarea style={styles.textarea} rows={4} value={draft.note} onChange={e => set("note", e.target.value)} placeholder="Details zur Bestellung..." /></Field></div>
    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 8 }}><button style={styles.primary} onClick={save}>Speichern & an Projektleitung senden</button></div>
  </div>;
}

function Warehouse({ warehouse, setWarehouse }) {
  const [row, setRow] = useState({ name: "", qty: 1, unit: "Stk", min: 1, price: 0 });
  const add = () => { if (!row.name.trim()) return; setWarehouse(prev => [{ ...row, id: Date.now(), qty: Number(row.qty), min: Number(row.min), price: Number(row.price) }, ...prev]); setRow({ name: "", qty: 1, unit: "Stk", min: 1, price: 0 }); };
  return <Panel title="Lagerverwaltung"><div style={styles.formInline}><input style={styles.input} placeholder="Material" value={row.name} onChange={e => setRow(r => ({ ...r, name: e.target.value }))} /><input style={styles.input} type="number" value={row.qty} onChange={e => setRow(r => ({ ...r, qty: e.target.value }))} /><input style={styles.input} value={row.unit} onChange={e => setRow(r => ({ ...r, unit: e.target.value }))} /><button style={styles.primary} onClick={add}>Hinzufügen</button></div>{warehouse.map(m => <ListRow key={m.id} left={<><b>{m.name}</b><small>Mindestbestand: {m.min} · Preis: {Number(m.price).toFixed(2)} €</small></>} right={<b style={{ color: m.qty <= m.min ? C.red : C.green }}>{m.qty} {m.unit}</b>} />)}</Panel>;
}

function Invoices({ projects, invoices, setInvoices, editingInvoice, setEditingInvoice }) {
  const blank = { id: null, nr: `RE-2026-${String(invoices.length + 1).padStart(3, "0")}`, projectId: projects[0]?.id || 1, client: projects[0]?.client || "", title: "Neue Rechnung", date: today(), dueDate: today(14), status: "offen", items: [{ name: "Leistung", qty: 1, unit: "Std", price: 45 }] };
  const [draft, setDraft] = useState(blank);
  const total = (inv) => inv.items.reduce((s, i) => s + Number(i.qty || 0) * Number(i.price || 0), 0);
  const open = (inv = null) => { setDraft(inv ? JSON.parse(JSON.stringify(inv)) : blank); setEditingInvoice(true); };
  const save = () => { const fixed = { ...draft, projectId: Number(draft.projectId), items: draft.items.map(i => ({ ...i, qty: Number(i.qty), price: Number(i.price) })) }; setInvoices(prev => fixed.id ? prev.map(i => i.id === fixed.id ? fixed : i) : [{ ...fixed, id: Date.now() }, ...prev]); setEditingInvoice(false); };
  return <section><div style={styles.actions}><button style={styles.primary} onClick={() => open()}>+ Neue Rechnung</button></div><div style={styles.orderGrid}>{invoices.map(inv => <div key={inv.id} style={styles.card}><div style={styles.cardHead}><div><b>{inv.nr}</b><small>{inv.client} · {projects.find(p => p.id === inv.projectId)?.name}</small></div><Status status={inv.status} /></div><h3>{inv.title}</h3><div style={styles.infoGrid}><Info k="Datum" v={inv.date} /><Info k="Fällig" v={inv.dueDate} /><Info k="Summe" v={`${total(inv).toFixed(2)} €`} /><Info k="Projekt" v={projects.find(p => p.id === inv.projectId)?.location || "–"} /></div><div style={styles.btnRow}><button style={styles.secondary} onClick={() => open(inv)}>Bearbeiten</button><button style={styles.primary} onClick={() => printInvoice(inv, projects)}>Drucken / PDF</button><button style={styles.ok} onClick={() => setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: "bezahlt" } : i))}>Bezahlt</button></div></div>)}</div>{editingInvoice && <Modal title="Rechnung bearbeiten" onClose={() => setEditingInvoice(false)}><InvoiceForm draft={draft} setDraft={setDraft} projects={projects} save={save} /></Modal>}</section>;
}

function InvoiceForm({ draft, setDraft, projects, save }) {
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const setItem = (idx, key, value) => setDraft(d => ({ ...d, items: d.items.map((it, i) => i === idx ? { ...it, [key]: value } : it) }));
  const addItem = () => setDraft(d => ({ ...d, items: [...d.items, { name: "", qty: 1, unit: "Stk", price: 0 }] }));
  return <div style={styles.formGrid}>
    <Field label="Rechnungsnummer"><input style={styles.input} value={draft.nr} onChange={e => set("nr", e.target.value)} /></Field>
    <Field label="Projekt"><select style={styles.input} value={draft.projectId} onChange={e => { const p = projects.find(x => x.id === Number(e.target.value)); setDraft(d => ({ ...d, projectId: Number(e.target.value), client: p?.client || d.client })); }}>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
    <Field label="Kunde"><input style={styles.input} value={draft.client} onChange={e => set("client", e.target.value)} /></Field>
    <Field label="Titel"><input style={styles.input} value={draft.title} onChange={e => set("title", e.target.value)} /></Field>
    <Field label="Datum"><input style={styles.input} type="date" value={draft.date} onChange={e => set("date", e.target.value)} /></Field>
    <Field label="Fällig"><input style={styles.input} type="date" value={draft.dueDate} onChange={e => set("dueDate", e.target.value)} /></Field>
    <div style={{ gridColumn: "1 / -1" }}><b>Positionen</b>{draft.items.map((it, idx) => <div key={idx} style={styles.itemRow}><input style={styles.input} placeholder="Beschreibung" value={it.name} onChange={e => setItem(idx, "name", e.target.value)} /><input style={styles.input} type="number" value={it.qty} onChange={e => setItem(idx, "qty", e.target.value)} /><input style={styles.input} value={it.unit} onChange={e => setItem(idx, "unit", e.target.value)} /><input style={styles.input} type="number" value={it.price} onChange={e => setItem(idx, "price", e.target.value)} /></div>)}<button style={styles.secondary} onClick={addItem}>+ Position</button></div>
    <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}><button style={styles.primary} onClick={save}>Rechnung speichern</button></div>
  </div>;
}

function printInvoice(inv, projects) {
  const project = projects.find(p => p.id === inv.projectId);
  const total = inv.items.reduce((s, i) => s + Number(i.qty || 0) * Number(i.price || 0), 0);
  const html = `<!doctype html><html><head><title>${inv.nr}</title><style>body{font-family:Arial;padding:40px;color:#101828}.head{display:flex;justify-content:space-between;border-bottom:4px solid #FF7A1A;padding-bottom:20px}.logo{width:50px;height:50px;border-radius:14px;background:#FF7A1A;color:white;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900}table{width:100%;border-collapse:collapse;margin-top:30px}th{background:#081A36;color:white;text-align:left}th,td{padding:10px;border-bottom:1px solid #ddd}.total{text-align:right;font-size:22px;font-weight:900;color:#081A36;margin-top:20px}@media print{button{display:none}}</style></head><body><div class="head"><div><div class="logo">O</div><h1>Rechnung</h1><h2>${inv.nr}</h2></div><div><b>Ovivo WorkHub</b><br/>hallo@ovivo.io<br/>+49 176 56565322</div></div><p><b>Kunde:</b> ${inv.client}<br/><b>Projekt:</b> ${project?.name || "-"}<br/><b>Ort:</b> ${project?.location || "-"}<br/><b>Datum:</b> ${inv.date}<br/><b>Fällig:</b> ${inv.dueDate}</p><table><thead><tr><th>Beschreibung</th><th>Menge</th><th>Einheit</th><th>Preis</th><th>Summe</th></tr></thead><tbody>${inv.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.unit}</td><td>${Number(i.price).toFixed(2)} €</td><td>${(Number(i.qty)*Number(i.price)).toFixed(2)} €</td></tr>`).join("")}</tbody></table><div class="total">Gesamt: ${total.toFixed(2)} €</div><button onclick="window.print()">Drucken / PDF speichern</button><script>setTimeout(()=>window.print(),300)</script></body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

function Projects({ projects, users }) { return <Panel title="Projekte">{projects.map(p => <ListRow key={p.id} left={<><b>{p.name}</b><small>{p.client} · {p.location}</small></>} right={<span>{users.find(u => u.id === p.managerId)?.name}</span>} />)}</Panel>; }
function Accounts({ users }) { return <Panel title="Moderne Accounts">{users.map(u => <ListRow key={u.id} left={<><b>{u.name}</b><small>{u.dept}</small></>} right={<Status status={u.role} />} />)}</Panel>; }
function Stat({ label, value, hint, icon }) { return <div style={styles.stat}><div style={styles.statIcon}>{icon}</div><div style={styles.statValue}>{value}</div><div style={styles.statLabel}>{label}</div><small>{hint}</small></div>; }
function Panel({ title, children }) { return <div style={styles.panel}><h2>{title}</h2>{children}</div>; }
function ListRow({ left, right }) { return <div style={styles.row}><div style={{ display: "grid", gap: 4 }}>{left}</div><div>{right}</div></div>; }
function Info({ k, v }) { return <div style={styles.info}><small>{k}</small><b>{v}</b></div>; }
function Field({ label, children }) { return <label style={{ display: "grid", gap: 6 }}><span style={styles.label}>{label}</span>{children}</label>; }
function Avatar({ user }) { return <div style={styles.avatar}>{user.avatar}</div>; }
function Status({ status }) { const map = { ausstehend: [C.yellow, C.yellowL, "Ausstehend"], genehmigt: [C.green, C.greenL, "Genehmigt"], geliefert: [C.navy, C.blueL, "Geliefert"], abgelehnt: [C.red, C.redL, "Abgelehnt"], offen: [C.yellow, C.yellowL, "Offen"], bezahlt: [C.green, C.greenL, "Bezahlt"], storniert: [C.red, C.redL, "Storniert"], admin: [C.orange, C.orange2, "Admin"], hotel: [C.navy, C.blueL, "Hotel"], manager: [C.green, C.greenL, "Manager"], employee: [C.sub, C.bg, "Mitarbeiter"] }; const [color, bg, label] = map[status] || [C.sub, C.bg, status]; return <span style={{ color, background: bg, borderRadius: 999, padding: "5px 10px", fontSize: 12, fontWeight: 800 }}>{label}</span>; }
function Modal({ title, children, onClose }) { return <div style={styles.overlay} onMouseDown={onClose}><div style={styles.modal} onMouseDown={e => e.stopPropagation()}><div style={styles.modalHead}><h2>{title}</h2><button style={styles.close} onClick={onClose}>×</button></div>{children}</div></div>; }

const styles = {
  app: { minHeight: "100vh", display: "flex", background: C.bg, color: C.text, fontFamily: "Inter, Arial, sans-serif", overflowX: "hidden" },
  sidebar: { width: 280, background: `linear-gradient(180deg, ${C.navy}, ${C.navy2})`, color: "white", padding: 22, position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  nav: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", marginTop: 8, border: 0, borderRadius: 14, background: "transparent", color: "white", fontWeight: 700, cursor: "pointer", textAlign: "left" },
  navActive: { background: C.orange, boxShadow: "0 10px 22px rgba(255,122,26,.25)" },
  navBadge: { marginLeft: "auto", background: "white", color: C.orange, borderRadius: 99, padding: "2px 7px", fontSize: 11 },
  userBox: { marginTop: 24, padding: 12, background: "rgba(255,255,255,.08)", borderRadius: 16 },
  labelLight: { fontSize: 11, color: "rgba(255,255,255,.65)", display: "block", marginBottom: 6 },
  selectDark: { width: "100%", border: 0, borderRadius: 10, padding: 10, fontSize: 16 },
  main: { flex: 1, padding: 28, minWidth: 0 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, marginBottom: 24 },
  title: { margin: 0, fontSize: 32, fontWeight: 900 },
  desc: { margin: "6px 0 0", color: C.sub },
  topRight: { display: "flex", alignItems: "center", gap: 12 },
  online: { background: C.greenL, color: C.green, padding: "9px 12px", borderRadius: 999, fontWeight: 800 },
  avatar: { width: 42, height: 42, borderRadius: "50%", background: C.orange, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 },
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 16, marginBottom: 18 },
  stat: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20, boxShadow: "0 10px 26px rgba(8,26,54,.06)" },
  statIcon: { fontSize: 26 }, statValue: { fontSize: 32, fontWeight: 900, marginTop: 8, color: C.navy }, statLabel: { fontWeight: 800 },
  alert: { background: C.orange2, color: C.orange, border: `1px solid #FFD6B8`, padding: 14, borderRadius: 16, marginBottom: 16, fontWeight: 800 },
  panel: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 20, boxShadow: "0 10px 26px rgba(8,26,54,.06)" },
  row: { display: "flex", justifyContent: "space-between", gap: 14, padding: "14px 0", borderBottom: `1px solid ${C.border}`, alignItems: "center" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 18, boxShadow: "0 10px 26px rgba(8,26,54,.06)" },
  cardHead: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 12 },
  orderGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))", gap: 16 },
  actions: { display: "flex", justifyContent: "flex-end", marginBottom: 16 },
  primary: { background: C.orange, color: "white", border: 0, borderRadius: 12, padding: "10px 14px", fontWeight: 900, cursor: "pointer" },
  secondary: { background: C.blueL, color: C.navy, border: `1px solid ${C.border}`, borderRadius: 12, padding: "9px 12px", fontWeight: 800, cursor: "pointer" },
  ok: { background: C.greenL, color: C.green, border: 0, borderRadius: 12, padding: "9px 12px", fontWeight: 800, cursor: "pointer" },
  danger: { background: C.redL, color: C.red, border: 0, borderRadius: 12, padding: "9px 12px", fontWeight: 800, cursor: "pointer" },
  btnRow: { display: "flex", gap: 7, flexWrap: "wrap", marginTop: 12 },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, margin: "10px 0" },
  info: { background: C.bg, borderRadius: 12, padding: 10, display: "grid", gap: 4 },
  typeBox: { background: C.blueL, color: C.navy, padding: 10, borderRadius: 12, fontWeight: 800 },
  note: { background: C.yellowL, borderRadius: 12, padding: 10, color: C.yellow },
  commentArea: { marginTop: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12 },
  comment: { background: C.bg, borderRadius: 10, padding: 9, marginBottom: 7, fontSize: 13 },
  textarea: { width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 12, fontSize: 16, lineHeight: 1.4, resize: "vertical", minHeight: 44, overscrollBehavior: "contain", scrollMarginBottom: 120, WebkitOverflowScrolling: "touch" },
  input: { width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "11px 12px", fontSize: 16, background: "white", color: C.text },
  label: { fontSize: 12, color: C.sub, fontWeight: 900, textTransform: "uppercase" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 },
  formInline: { display: "grid", gridTemplateColumns: "2fr 100px 100px auto", gap: 8, marginBottom: 12 },
  itemRow: { display: "grid", gridTemplateColumns: "2fr 80px 80px 100px", gap: 8, margin: "8px 0" },
  overlay: { position: "fixed", inset: 0, zIndex: 50, background: "rgba(8,26,54,.56)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "white", width: "100%", maxWidth: 760, maxHeight: "92vh", overflowY: "auto", borderRadius: 22, padding: 20, boxShadow: "0 30px 90px rgba(0,0,0,.25)", overscrollBehavior: "contain" },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  close: { border: 0, background: C.bg, borderRadius: 10, width: 34, height: 34, fontSize: 22, cursor: "pointer" },
};

export default App;
