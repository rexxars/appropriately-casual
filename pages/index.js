import App from '../src'
import Head from 'next/head'
import {phenomena} from '../src/phenomena'

function HomePage(props) {
  return (
    <>
      <Head>
        <title>Appropriately Casual™</title>
      </Head>
      <App {...props} />
    </>
  )
}

export function getServerSideProps({query}) {
  const defaultPhenomena = phenomena[Math.floor(Math.random() * phenomena.length)]
  return {props: {query, defaultPhenomena}}
}

export default HomePage
