"use client";

import React, { useContext } from "react";
import styles from "./navbar.module.css";
import Image from "next/image";
import Link from "next/link";
import { ThemeContext } from "@/context/ThemeContext";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import AuthLinks from "../authLinks/AuthLinks";

const Navbar = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <div className={styles.container}>
      <Image src="/logo.png" alt="logo" width={190} height={190} />

      <div className={styles.links}>
        <ThemeToggle />
        <Link href="/" className={styles.link}>
          Homepage
        </Link>
        <Link
          href="https://himanshu-goyal-delta.vercel.app/#contact"
          className={styles.link}
        >
          Contact
        </Link>

        <AuthLinks />
      </div>
    </div>
  );
};

export default Navbar;
