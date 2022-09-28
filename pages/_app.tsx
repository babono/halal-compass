import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Script from 'next/script'
//import posthog from 'posthog-js';
import { useEffect } from 'react'
import { useRouter } from 'next/router'

import * as ga from '../lib/ga'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

    useEffect(() => {
      // Init PostHog
      //posthog.init('phc_tZu7vUycI2ZEXO2eYHw83M0fsqIrhCbj7f1OZEbx2e5', { api_host: 'https://app.posthog.com' });

      const handleRouteChange = (url:string) => {
        ga.pageview(url)
        //posthog.capture('$pageview');
      }
      //When the component is mounted, subscribe to router changes
      //and log those page views
      router.events.on('routeChangeComplete', handleRouteChange)

      // If the component is unmounted, unsubscribe
      // from the event with the `off` method
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange)
      }
    }, [router.events])

    return (<><Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2466930201417951" /><Component {...pageProps} /></>)
}
export default MyApp
