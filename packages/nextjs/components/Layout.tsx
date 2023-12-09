import { ReactNode } from "react";
import { Header } from "./Header";
import Menu from "./Menu";
import { MyBets } from "./MyBets";

interface LayoutProps {
  children: ReactNode;
}
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <div className="mx-auto flex w-full ">
        <aside className="sticky top-8 hidden flex-1 shrink-0 lg:block">
          <Menu />
        </aside>

        <main className="flex-1 max-w-7xl items-start gap-x-8 px-4 py-10 sm:px-6 lg:px-8">{children}</main>

        <aside className="sticky top-8 hidden w-96 shrink-0 xl:block   lg:right-0">
          {" "}
          <MyBets />
        </aside>
      </div>
    </div>
  );
}
