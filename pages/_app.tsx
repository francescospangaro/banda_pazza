import "react-datepicker/dist/react-datepicker.min.css"
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import "bootstrap/dist/css/bootstrap.min.css"
import '../styles/globals.css'
import type { AppProps } from 'next/app'

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
