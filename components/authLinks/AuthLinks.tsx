"use client";
import Link from "next/link";
import styles from "./authLinks.module.css";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AuthLinks = () => {
  const [open, setOpen] = useState(false);

  const { status, data } = useSession();
  const router = useRouter();

  console.log(status);

  return (
    <>
      {status === "unauthenticated" ? (
        <Link href="/login" className={styles.link}>
          Login
        </Link>
      ) : (
        <>
          {status == "authenticated" &&
            data?.user?.email === process.env.NEXT_PUBLIC_EMAIL && (
              <Link href="/write" className={styles.link}>
                Write
              </Link>
            )}
          <span className={styles.link} onClick={() => signOut()}>
            Logout
          </span>
        </>
      )}
      <div className={styles.burger} onClick={() => setOpen(!open)}>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
      </div>
      {open && (
        <div className={styles.responsiveMenu}>
          <Link href="/">Homepage</Link>
          <Link href="https://himanshu-goyal-delta.vercel.app/#contact">
            Contact
          </Link>
          {status === "unauthenticated" ? (
            <Link href="/login">Login</Link>
          ) : (
            <>
              {status == "authenticated" &&
                data?.user?.email === process.env.NEXT_PUBLIC_EMAIL && (
                  <Link href="/write">Write</Link>
                )}
              <span
                className={styles.link}
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
              >
                Logout
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AuthLinks;
