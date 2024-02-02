import GameContext from '@/context/game-context';
import '@/styles/globals.css';
import '@radix-ui/themes/styles.css';
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <GameContext>
    <Component {...pageProps} />
  </GameContext>
}
