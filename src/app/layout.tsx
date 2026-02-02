export const metadata = {
  title: "Kommunal Grafisk Platform (MVP)",
  description: "MVP for kommunal grafisk opgaveplatform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif", margin: 0 }}>
        <div style={{ padding: 16, borderBottom: "1px solid #eee" }}>
          <strong>Kommune Grafisk Platform</strong> <span style={{ color: "#666" }}>MVP</span>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </body>
    </html>
  );
}
