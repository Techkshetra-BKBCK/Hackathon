"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { Triangle } from "react-loader-spinner";
import TraingleLoader from "@/components/loader/TraingleLoader";
import { Button } from "@/components/ui/button";

const LoginPage = () => {
  const { status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/home");
    } else {
      router.push("/");
    }
  }, [status]);

  if (status === "loading") {
    return <TraingleLoader />;
  }

  return (
    <div
      className="h-full w-full flex flex-col md:flex-row
    md:items-center md:justify-center gap-4 md:gap-8 mt-20 md:mt-0
    "
    >
      <div
        className="
       h-[30%] md:h-full w-full md:w-1/2 relative
      "
      >
        <Image src="/hero.png" alt="logo" layout="fill" objectFit="contain" />
      </div>
      <div
        className="w-full md:w-1/3 md:h-full flex flex-col items-center justify-center mb-12 
      "
      >
        <div className="h-full w-full flex flex-col md:items-start justify-center">
          <h2 className="text-xl md:text-3xl font-bold text-center">
            Welcome to
          </h2>

          <h1 className="text-3xl md:text-5xl font-bold text-center mt-2 text-[#4B35EA]">
            Whitecarrot.io
          </h1>
          <div className="w-[90%] text-center text-xs md:text-start mt-3 md:mt-5 px-4 md:px-0">
            From fast growing startups to multinational corporations, our
            solution is loved by all. Schedule a demo and get your team up and
            running in under a week. ❤
          </div>
          <Button
            className="bg-[#4B35EA] mt-3 md:mt-5 w-[80%] text-white font-bold py-6"
            onClick={() => signIn()}
          >
            <span>
              <Image
                src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-icon-png-transparent-background-osteopathy-16.png"
                width={20}
                height={20}
                alt="google"
                className="mr-2"
              />
            </span>{" "}
            Sign In to Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
