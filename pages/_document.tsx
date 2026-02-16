import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#064E3B" />
      </Head>
      <body className="bg-cream antialiased text-gray-800">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
