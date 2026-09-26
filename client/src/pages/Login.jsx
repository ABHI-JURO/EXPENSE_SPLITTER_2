import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../features/auth/authSlice";
import loginBg from "../assets/login-bg2.jpg";

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
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${loginBg})`,
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-white text-center mb-6 lowercase tracking-wide">
          login
        </h1>

        {error && (
          <p className="text-red-300 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white/10 border border-white/30 rounded-full px-5 py-3 mb-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-white/10 border border-white/30 rounded-full px-5 py-3 mb-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
        />

        <div className="flex items-center justify-between text-sm text-white/80 mb-6 px-1">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            remember me
          </label>
          <a href="#" className="hover:underline">
            forget password
          </a>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-white text-gray-800 font-medium py-3 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
        >
          {status === "loading" ? "logging in..." : "login"}
        </button>

        <p className="text-sm text-white/80 mt-5 text-center">
          Dont have an account?{" "}
          <Link
            to="/register"
            className="text-white font-semibold hover:underline"
          >
            register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
