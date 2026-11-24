import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { Mail } from "lucide-react";
import Link from "next/link";
import React from "react";

const AuthSignUpPage = () => {
  return (
    <div className="flex items-center justify-center min-h-full pt-20">
      <div className="">
        <h1 className="text-center font-semibold text-3xl pb-12">
          welcome backkk!
        </h1>
        <button className="flex w-full items-center gap-3 text-lg transition-all font-medium justify-center py-3 rounded-full border border-neutral-300 hover:border-neutral-400 dark:border-neutral-900  dark:hover:border-neutral-800 cursor-pointer">
          <SiGoogle size={18} />
          <p className="">continue with google</p>
        </button>
        <div className="flex items-center gap-3 py-8">
          <div className="w-full flex-1 h-0.5 bg-neutral-300 dark:bg-neutral-800 rounded-full" />
          <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500">or sign in with email</p>
          <div className="w-full flex-1 h-0.5 bg-neutral-300 dark:bg-neutral-800 rounded-full" />
        </div>
        <form className="flex flex-col gap-5 w-lg">
          <FloatingLabelInput
            label="your email"
            defaultValue=""
            type="email"
            clearable={false}
            className=""
            helperText=""
          />
          <FloatingLabelInput
            label="password"
            defaultValue=""
            type="password"
            clearable={false}
            className=""
            helperText=""
          />
          <button
            className="text-lg font-medium py-3 rounded-full bg-blue-500 hover:bg-blue-600 cursor-pointer shadow-xl transition-all text-white w-full"
            type="submit"
          >
            <p className="">sign in</p>
          </button>
        </form>
        <p className="py-3 text-neutral-500 dark:text-neutral-400 font-medium text-center">dont have an account? <Link className="underline" href={"/sign-up"}>create one</Link></p>
      </div>
    </div>
  );
};

export default AuthSignUpPage;
