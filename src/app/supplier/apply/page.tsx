import SupplierApplyForm from "./ui/SupplierApplyForm";

export default function SupplierApplyPage() {
  return (
    <main style={{ maxWidth: 560 }}>
      <h1>Leverandør – ansøg om adgang</h1>
      <p style={{ color: "#666" }}>
        Leverandører godkendes manuelt. Når I er godkendt, får I adgang til at byde på opgaver.
      </p>
      <SupplierApplyForm />
    </main>
  );
}
