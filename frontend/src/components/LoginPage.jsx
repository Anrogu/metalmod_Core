import { useState } from "react";
import { iniciarSesion } from "../api/authApi";
import "./LoginPage.css";

export default function LoginPage({ onSesionIniciada }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setError("");
    try {
      const sesion = await iniciarSesion(username.trim(), password);
      onSesionIniciada(sesion);
    } catch (err) {
      setError(err.message);
      setPassword("");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={manejarSubmit}>
        <div className="login__brand">METALMOD CORE</div>
        <div className="login__subtitle">Inicia sesión para continuar</div>

        <label className="login__field">
          <span>Usuario</span>
          <input
            type="text"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label className="login__field">
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="login__error" role="alert">{error}</p>}

        <button type="submit" className="login__submit" disabled={enviando || !username || !password}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
