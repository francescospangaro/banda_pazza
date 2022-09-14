import requireAuth from "../../lib/auth";
import {NextPage} from "next";
import Layout from "../../components/Layout"
import {Container} from "react-bootstrap"
import styles from "../../styles/Home.module.css";

export const getServerSideProps = requireAuth(async (ctx) => {
    return { props: {} }
}, true)

const Home: NextPage = (props) => {
    return <>
        <Layout requiresAuth>
            <Container fluid className={styles.container}>
                <main className={styles.main}>
                    <div>TODO</div>
                </main>
            </Container>
        </Layout>
    </>;
}

export default Home
