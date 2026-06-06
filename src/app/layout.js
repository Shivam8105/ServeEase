import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata = {
  title: "ServEase Pro | Local Services On Demand",
  description: "Discover, book, and review top-rated local services: electricians, plumbers, cleaners, tutors, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {children}
          </main>
          <footer className="footer">
            <div className="container">
              <div className="footer-logo">⚡ ServEase Pro</div>
              <div className="footer-links">
                <a href="#" className="footer-link">About Us</a>
                <a href="/services" className="footer-link">Find Services</a>
                <a href="#" className="footer-link">Terms of Service</a>
                <a href="#" className="footer-link">Privacy Policy</a>
              </div>
              <div>© {new Date().getFullYear()} ServEase Pro. All rights reserved. Built with premium design standards.</div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
