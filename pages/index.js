import App from '../src'
import {phenomena} from '../src/phenomena'

function HomePage(props) {
  return <App {...props} />
}

export function getServerSideProps({query}) {
  const defaultPhenomena = phenomena[Math.floor(Math.random() * phenomena.length)]
  return {props: {query, defaultPhenomena}}
}

export default HomePage
