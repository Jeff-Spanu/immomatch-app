import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(email, password)
    setLoading(false)
    if (err) {
      setError("Email ou mot de passe incorrect.")
    } else {
      navigate("/")
    }
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-icon">🔑</span>
        </div>
        <h1 className="login-title">ImmoMatch</h1>
        <p className="login-subtitle">ALCHEMISTRIA · IAD Réunion</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Email</label>
            <input className="login-input" type="email" placeholder="votre@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="login-field">
            <label className="login-label">Mot de passe</label>
            <input className="login-input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="login-footer">Accès réservé aux membres Alchemistria</p>
      </div>

      <style>{`
        .login-root { min-height:100dvh; display:flex; align-items:center; justify-content:center; padding:24px 16px; background-color:var(--bg); font-family:'DM Sans',sans-serif; }
        .login-card { width:100%; max-width:400px; background:var(--card-bg); border:1px solid var(--border); border-radius:28px; padding:40px 28px; display:flex; flex-direction:column; align-items:center; box-shadow:0 8px 40px rgba(0,0,0,0.08); }
        .login-logo { width:64px; height:64px; border-radius:18px; background:rgba(200,117,51,0.15); display:flex; align-items:center; justify-content:center; margin-bottom:20px; }
        .login-logo-icon { font-size:28px; }
        .login-title { font-size:28px; font-weight:700; color:var(--text); margin:0 0 4px; letter-spacing:-0.5px; }
        .login-subtitle { font-size:11px; font-weight:600; letter-spacing:0.15em; color:var(--text-muted); text-transform:uppercase; margin:0 0 32px; }
        .login-form { width:100%; display:flex; flex-direction:column; gap:16px; }
        .login-field { display:flex; flex-direction:column; gap:6px; }
        .login-label { font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--text-muted); }
        .login-input { width:100%; padding:14px 16px; border-radius:14px; border:1.5px solid var(--border); background:var(--input-bg); color:var(--text); font-size:15px; outline:none; transition:border-color .2s; box-sizing:border-box; }
        .login-input:focus { border-color:var(--accent); }
        .login-error { font-size:13px; color:#ef4444; text-align:center; margin:0; }
        .login-btn { width:100%; padding:15px; border-radius:14px; background:var(--accent); color:white; font-size:15px; font-weight:700; border:none; cursor:pointer; margin-top:4px; }
        .login-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .login-footer { font-size:11px; color:var(--text-muted); text-align:center; margin-top:24px; }
        :root { --bg:#f5f5f0; --card-bg:#ffffff; --border:#e5e5e0; --input-bg:#fafaf8; --text:#1a1a18; --text-muted:#888880; --accent:#C87533; }
        @media (prefers-color-scheme:dark) { :root { --bg:#1C1917; --card-bg:rgba(255,255,255,0.06); --border:rgba(255,255,255,0.10); --input-bg:rgba(255,255,255,0.04); --text:#f5f5f0; --text-muted:rgba(255,255,255,0.45); --accent:#C87533; } }
      `}</style>
    </div>
  )
}
