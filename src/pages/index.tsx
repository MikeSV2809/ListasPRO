import Head from "next/head";
import styles from "./home.module.css";
import Image from "next/image";

import heroImg from "../../public/assets/hero.png";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseconnection";
import { GetStaticProps } from "next";

interface HomeProps {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Listas PRO | Organize suas listas de forma fácil</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo Listas PRO"
            src={heroImg}
            priority
          />
          <h1 className={styles.title}>
            Sistema feito para você <br />
            organizar suas listas
          </h1>

          <div className={styles.infoContent}>
            <section className={styles.box}>
              <span className={styles.span}>+{posts} posts</span>
            </section>
            <section className={styles.box}>
              <span className={styles.span}>+{comments} comentários</span>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, "comments");
  const postRef = collection(db, "listas");

  const commentSnapshot = await getDocs(commentRef);
  const postSnapshot = await getDocs(postRef);

  return {
    props: {
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 120,
  };
};