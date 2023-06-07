import './globals.css'

export const metadata = {
  title: 'Zay Card Shop',
  description: 'Cards, Cards, Cards',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
