import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../features/auth/authSlice";
import loginBg from "../assets/login-bg.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: image panel, desktop only */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="absolute inset-0 bg-bg/40" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="font-serif text-2xl text-white leading-snug">
            Split costs.
            <br />
            Settle up.
            <br />
            Stay friends.
          </p>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="w-full md:w-1/2 bg-bg flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-2xl text-[#F4F2EE] mb-1">Tally</h1>
          <p className="text-white/40 text-sm mb-8">Welcome back.</p>

          <form onSubmit={handleSubmit}>
            {error && <p className="text-alert text-sm mb-4">{error}</p>}

            <div className="mb-4">
              <label className="text-white/50 text-xs mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-[#F4F2EE] placeholder-white/25 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-white/50 text-xs">Password</label>
                <a
                  href="#"
                  className="text-white/30 text-xs hover:text-white/60 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2.5 text-[#F4F2EE] placeholder-white/25 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-accent text-[#0F1512] font-medium py-2.5 rounded-lg hover:bg-[#7FAE8F] transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-white/40 text-sm mt-6 text-center">
              New here?{" "}
              <Link to="/register" className="text-accent hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
