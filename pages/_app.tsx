import type { AppProps } from 'next/app'
import "@fontsource-variable/anybody/wdth.css"
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

