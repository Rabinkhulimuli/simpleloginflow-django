import { useState } from "react";
import API from "../api";

export default function Register() {
  const [form, setForm] = useState({email:"", username: "", password: "" });

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await API.post("/api/register/", form);
    window.location.href = "/login";
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl mb-4 font-bold">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Username"
          className="w-full border p-2 rounded"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
      </form>
    </div>
  );
}
