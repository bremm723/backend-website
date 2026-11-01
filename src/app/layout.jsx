import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "nduttt.be - Belajar Backend ❤️",
  description: "Platform belajar backend interaktif khusus untuk Tuan Putri Ratih ✨",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-pink-300 selection:text-pink-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
