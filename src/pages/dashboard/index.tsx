import { GetServerSideProps } from 'next'
import { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './styles.module.css'
import Head from 'next/head'

import { getSession } from 'next-auth/react'
import { Textarea } from '@/src/components/header/textarea'
import { FiShare2 } from 'react-icons/fi'
import { FaTrash } from 'react-icons/fa'

import { db } from '@/src/services/firebaseconnection'

import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore'


interface HomeProps {
    user: {
        email: string;
    }
}

interface ListProps {
    id: string;
    created: Date;
    public: boolean;
    lista: string;
    user: string;
}

export default function Dashboard({ user }: HomeProps) {
    const [input, setInput] = useState("");
    const [publicList, setPublicList] = useState(false);
    const [lists, setLists] = useState<ListProps[]>([])

    useEffect(() => {
        async function loadListas() {
            const listasRef = collection(db, "listas");
            const q = query(
                listasRef,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            );

            onSnapshot(q, (snapshot) => {
                let lista = [] as ListProps[];

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        lista: doc.data().lista,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public,
                    });
                });

                setLists(lista);
            });
        }

        loadListas();
    }, [user?.email]);

    function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
        console.log(event.target.checked)
        setPublicList(event.target.checked)
    }

    async function handleRegisterTask(event: FormEvent) {
        event.preventDefault();

        if (input === "") return;

        try {
            await addDoc(collection(db, "listas"), {
                lista: input,
                created: new Date(),
                user: user?.email,
                public: publicList,
            });

            setInput("");
            setPublicList(false);
        } catch (err) {
            console.log(err);
        }
    }

    async function handleShare(id: string){
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        );
        alert("URL copiada com sucesso!")
    }

    async function handleDeleteTask(id: string){
        const docRef = doc(db, "listas", id)
        await deleteDoc(docRef)
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Meu painel de listas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua lista?</h1>

                        <form onSubmit={handleRegisterTask}>
                            <Textarea
                                placeholder="Digite sua lista..."
                                value={input}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                            />
                            <div className={styles.checkboxArea}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={publicList}
                                    onChange={handleChangePublic}
                                />
                                <label className={styles.label}>Deixar lista púplica?</label>
                            </div>

                            <button className={styles.button} type="submit">Registrar</button>
                        </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1 className={styles.myTasks}>Minhas listas</h1>

                    {lists.map((item) => (
                        <article key={item.id} className={styles.task}>
                            {item.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>PÚBLICO</label>
                                    <button className={styles.shareButton} onClick={ () => handleShare(item.id)}>
                                        <FiShare2
                                            size={22}
                                            color="#3183ff"
                                        />
                                    </button>
                                </div>
                            )}

                            <div className={styles.taskContent}>
                                {item.public ? (
                                    <Link href={`/task/${item.id}`}>
                                        <p>{item.lista}</p>
                                    </Link>
                                ) : (
                                    <p>{item.lista}</p>
                                )}
                                <button className={styles.trashButton} onClick={ () => handleDeleteTask(item.id)}>
                                    <FaTrash size={24} color="#ea3140" />
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });

    if (!session?.user) {
        // Se não tem usuário vamos redirecionar para /
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    return {
        props: {
            user: {
                email: session?.user?.email,
            },
        },
    };
};