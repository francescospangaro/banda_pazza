/*import type { NextPage } from 'next'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {Admin} from "../api/admin";
import Layout from "../../components/Layout"
import React, {useMemo, useState} from "react";
import { useTable, useSortBy } from "react-table";

import requireAuth from "../../lib/auth"
import useSWR from "swr";
import {OreLavorative} from "../api/pagamenti";

type Props = {
    admin: Admin;

}

export const getServerSideProps = requireAuth(async (ctx) => {
    return {
        props: {
            admin: ctx.req.session.user
        }
    }
})

const Home: NextPage<Props> = (props) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const { data: lezioni } = useSWR<OreLavorative[]>('/api/pagamenti', (url: string) => {
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify({ data: currentDate })
        }).then(r => r.json())
    });

    const columns = useMemo(
        () => [
            {
                Header: "Nome",
                accessor: "nome",
            },
            {
                Header: "Cognome",
                accessor: "cognome",
            },
            {
                Header: "Ore non pagate",
                accessor: "Ore non pagate",
            },
            {
                Header: "Stipendio",
                accessor: "Stipendio",
            },
        ],
        []
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable(
            {
                // @ts-ignore
                columns,
                data: lezioni?.map(lezione => {
                    return {
                        nome: lezione.alunno.nome,
                        cognome: lezione.alunno.cognome,
                        orario: lezione.orario,
                    }
                }) ?? [],
                autoResetHiddenColumns: false,
                autoResetSortBy: false,
                autoResetPage: false,
            },
            useSortBy
        );

    return (
        <Layout>
            <div className={styles.container}>

                <main className={styles.main}>
                    <div className={styles.table_container_outer}>
                        <div className={styles.table_container}>
                            <table {...getTableProps()} className={styles.table}>
                                <thead>
                                {headerGroups.map((headerGroup) => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map((column) => (
                                            <th
                                                {...column.getHeaderProps(column.getSortByToggleProps())}
                                                className={styles.table_header}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        justifyContent: "space-between",
                                                    }}
                                                >
                                                    {column.render("Header")}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                                </thead>
                                <tbody {...getTableBodyProps()} className={styles.table_body}>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                <footer className={styles.footer}>
                    <a
                        href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Corpo Musicale M. G. Nava – musica per passione dal 1920
                        <span className={styles.logo}>
            <Image src="/logo.svg" alt="Logo" width={16} height={16} />
          </span>
                    </a>
                </footer>
            </div>
        </Layout>
    )
}
*/
