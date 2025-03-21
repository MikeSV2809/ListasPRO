import Head from "next/head";
import styles from './styles.module.css'
import { GetServerSideProps } from "next";
import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";

import { db } from "@/src/services/firebaseconnection";
import { addDoc, doc, collection, query, where, getDoc, getDocs, deleteDoc } from "firebase/firestore";
import { FaTrash } from "react-icons/fa";

import { Textarea } from "@/src/components/header/textarea";

interface ListProps {
    item: {
        lista: string;
        created: string;
        public: boolean;
        user: string;
        listId: string;
    },
    allComments: CommentProps[]
}

interface CommentProps {
    id: string;
    comment: string;
    listId: string;
    user: string;
    name: string;
}

export default function Task({ item, allComments }: ListProps) {

    const { data: session } = useSession();

    const [input, setInput] = useState("");
    const [comments, setComments] = useState<CommentProps[]>(allComments || [])

    async function handleComment(event: FormEvent) {
        event.preventDefault();

        if(input === "") return;

        if(!session?.user?.email || !session?.user?.name) return;

        try {
            const docRef = await addDoc(collection(db, "comments"), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                listId: item?.listId,
            });

            const data = {
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                listId: item?.listId,
            };

            setComments((oldItems) => [...oldItems, data]);
            setInput("");
        } catch (err) {
            console.log(err);
        }
    }

    async function handleDeleteComment(id: string){
        try{
            const docRef = doc(db, "comments", id)
            await deleteDoc(docRef)

            const deleteComment = comments.filter( ( item ) => item.id !== id )

            setComments(deleteComment);
            alert("Comentário excluído com sucesso!")
        } catch(err){
            console.log(err)
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Detalhes da lista</title>
            </Head>

            <main className={styles.main}>
                <h1>Lista</h1>
                <article className={styles.task}>
                    <p>{item.lista}</p>
                </article>
            </main>

            <section className={styles.comentsContainer}>
                <h2>Deixar comentários</h2>

                <form onSubmit={handleComment}>
                    <Textarea
                        value={input}
                        onChange={ (event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                        placeholder="Digite seu comentário..." />
                    <button
                        className={styles.button}
                        disabled={!session?.user}
                    >
                        Enviar comentário
                    </button>
                </form>
            </section>

            <section className={styles.commentsContainer}>
                <h2>Todos os comentários</h2>
                {comments.length === 0 && (
                    <span>Nenhum comentário foi encontrado...</span>
                )}

                {comments.map((item) => (
                    <article key={item.id} className={styles.comments}>
                        <div className={styles.headComment}>
                            <label className={styles.commentsLabel}>{item.name}</label>
                            {item.user === session?.user?.email && (
                                <button 
                                  className={styles.buttonTrash}
                                  onClick={() => handleDeleteComment(item.id)}
                                >
                                <FaTrash size={18} color="#ea3140" />
                            </button>
                            )}
                        </div>
                        <p>{item.comment}</p>
                    </article>
                ))}
            </section>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const id = params?.id as string;

    const docRef = doc(db, "listas", id)

    const q = query(collection(db, "comments"), where("listId", "==", id))
    const snapshotComments = await getDocs(q)

    let allComments: CommentProps[] = [];
    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            listId: doc.data().listId
        })
    })

    const snapshot = await getDoc(docRef)

    if (snapshot.data() === undefined) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    if (!snapshot.data()?.public) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    const miliseconds = snapshot.data()?.created?.seconds * 1000;

    const list = {
        lista: snapshot.data()?.lista,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        listId: id,
    }

    return {
        props: {
            item: list,
            allComments: allComments,
        },
    };
};