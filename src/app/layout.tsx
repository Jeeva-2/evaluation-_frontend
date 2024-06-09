// src/app/layout.tsx
import './globals.css';

function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

export default RootLayout;
