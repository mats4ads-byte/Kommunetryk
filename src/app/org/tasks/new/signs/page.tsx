import SignsTaskWizard from "./ui/SignsTaskWizard";

export default function NewSignsTaskPage() {
  return (
    <main style={{ maxWidth: 760 }}>
      <h1>Opret skilte-opgave</h1>
      <p style={{ color: "#666" }}>
        MVP-wizard: titel → skiltlinje → levering → send.
      </p>
      <SignsTaskWizard />
    </main>
  );
}
