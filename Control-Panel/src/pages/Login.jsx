//Control-Panel\src\pages\Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const q = query(collection(db, "users"), where("email", "==", user.email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        localStorage.setItem("userRole", data.role);
        navigate("/dashboard");
      } else {
        alert("⚠️ No user record found in Firestore.");
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email || !password) {
      alert("Please fill in email and password.");
      return;
    }

    setLoading(true);
    try {
      // Create Firebase Auth Account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "client",  // default role
        createdAt: new Date().toISOString()
      });

      localStorage.setItem("userRole", "client");
      navigate("/dashboard");
    } catch (error) {
      alert("Signup failed: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <img
          src="https://raw.githubusercontent.com/Olegario-III/image/main/aicon%20Logo.jpg"
          alt="Aicon Logo"
          className="logo"
        />
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to access the Control Panel</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Login"}
          </button>
        </form>

        {/* Sign Up Button */}
        <button
          style={{ marginTop: "15px", background: "#10b981" }}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Processing..." : "Sign Up as Client"}
        </button>
      </div>

      <style jsx>{`
        .login-page {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top, #111827 0%, #000000 80%);
          color: #e5e7eb;
          font-family: "Inter", sans-serif;
        }

        .login-box {
          background: rgba(31, 41, 55, 0.8);
          backdrop-filter: blur(12px);
          padding: 50px 60px;
          border-radius: 16px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.5);
          text-align: center;
          max-width: 380px;
          width: 90%;
        }

        .logo {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 20px;
          background: #fff;
          padding: 4px;
        }

        h2 {
          margin-bottom: 5px;
          font-size: 1.6rem;
          color: #fff;
        }

        .subtitle {
          font-size: 0.9rem;
          color: #9ca3af;
          margin-bottom: 25px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        input {
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #374151;
          background: #1f2937;
          color: #f9fafb;
          font-size: 1rem;
          outline: none;
          transition: border 0.2s;
        }

        input:focus {
          border-color: #3b82f6;
        }

        button {
          padding: 12px;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: background 0.3s;
        }

        button:hover {
          background: #1d4ed8;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
