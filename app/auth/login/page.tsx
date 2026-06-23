"use client";

// ============================================================================
// Página de autenticação — login e registro no mesmo formulário (toggle).
// Usa email/senha do Supabase Auth, o mais simples para uso entre 2 pessoas.
// ============================================================================
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("E-mail ou senha inválidos.");
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) {
        setError(error.message.includes("already registered") ? "Este e-mail já está cadastrado." : "Não foi possível criar a conta.");
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <h1 className="manifesto text-2xl sm:text-3xl text-center mb-1">
          Evolve Battle
        </h1>
        <p className="text-center text-ink-muted text-xs mb-8">
          I have no prime. I will evolve until i die.
        </p>

        <div className="glass-card p-6">
          <div className="flex mb-6 bg-base-800 rounded-soft p-1">
            <ToggleTab active={mode === "login"} onClick={() => setMode("login")}>
              Entrar
            </ToggleTab>
            <ToggleTab active={mode === "signup"} onClick={() => setMode("signup")}>
              Criar conta
            </ToggleTab>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="text"
                    placeholder="Seu nome de batalha"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-base-800 border border-white/10 rounded-soft px-4 py-3 placeholder:text-ink-muted focus:border-player1 outline-none transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-base-800 border border-white/10 rounded-soft px-4 py-3 placeholder:text-ink-muted focus:border-player1 outline-none transition-colors"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-base-800 border border-white/10 rounded-soft px-4 py-3 placeholder:text-ink-muted focus:border-player1 outline-none transition-colors"
            />

            {error && <p className="text-alert text-xs">{error}</p>}

            <Button type="submit" fullWidth disabled={loading} className="mt-2">
              {loading ? "Carregando..." : mode === "login" ? "Entrar na batalha" : "Começar a evoluir"}
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}

function ToggleTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 rounded-soft text-sm font-medium transition-colors ${
        active ? "bg-player1 text-white" : "text-ink-secondary"
      }`}
    >
      {children}
    </button>
  );
}
