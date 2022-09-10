import "react-datepicker/dist/react-datepicker.min.css"
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import "bootstrap/dist/css/bootstrap.min.css"
import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
