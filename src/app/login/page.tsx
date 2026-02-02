import LoginForm from "./ui/LoginForm";

export default function LoginPage({ searchParams }: { searchParams?: { next?: string } }) {
  return (
    <main style={{ maxWidth: 420 }}>
      <h1>Login</h1>
      <p style={{ color: "#666" }}>Log ind som kommune eller leverandør (MVP).</p>
      <LoginForm nextPath={searchParams?.next ?? "/dashboard"} />
    </main>
  );
}
