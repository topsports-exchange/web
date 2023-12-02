import localFont from "@next/font/local";
import { NextPage } from "next";

const sportypo = localFont({
  src: [
    {
      path: "../public/fonts/Sportypo/Sportypo-Reguler-Demo.ttf",
      weight: "400",
    },
    {
      path: "../public/fonts/Sportypo/Sportypo-Reguler-Demo.ttf",
      weight: "700",
    },
  ],
  variable: "--font-sportypo",
});
const TestPage: NextPage = () => (
  <div className={` w-96 h-96 relative bg-zinc-950`}>
    <div className="w-96 h-96 left-0 top-0 absolute bg-emerald-400 bg-opacity-40 rounded-full" />
    <div className="w-96 h-96 left-[880px] top-[277px] absolute bg-emerald-400 bg-opacity-40 rounded-full" />
    <div className="w-48 h-96 left-[32px] top-[197px] absolute bg-neutral-950 rounded-2xl" />
    <div className="w-96 h-44 left-[1043px] top-[197px] absolute bg-neutral-950 rounded-2xl" />
    <div className="w-20 h-11 left-[255px] top-[401px] absolute">
      <div className="w-20 h-11 left-0 top-0 absolute bg-neutral-950 rounded-full" />
      <div className="left-[30px] top-[10px] absolute text-white text-base font-medium font-['Exo 2'] leading-normal">
        All
      </div>
    </div>
    <div className="left-[1067px] top-[258px] absolute text-slate-400 text-base font-medium font-['Exo 2'] leading-normal">
      Connect your wallet to access your bets
    </div>
    <div className="left-[48px] top-[221px] absolute text-slate-400 text-base font-bold font-['Exo 2'] leading-normal">
      Sports
    </div>
    <div className="w-24 h-11 left-[575px] top-[401px] absolute">
      <div className="w-24 h-11 left-0 top-0 absolute bg-neutral-950 rounded-full" />
      <div className="left-[21px] top-[10px] absolute text-center text-white text-base font-medium font-['Exo 2'] leading-normal">
        Week 9
      </div>
    </div>
    <div className="w-24 h-11 left-[351px] top-[401px] absolute">
      <div className="w-24 h-11 left-0 top-0 absolute bg-gradient-to-r from-emerald-400 to-green-500 rounded-full" />
      <div className="left-[21px] top-[10px] absolute text-center text-neutral-900 text-base font-medium font-['Exo 2'] leading-normal">
        Week 7
      </div>
    </div>
    <div className="w-24 h-11 left-[463px] top-[401px] absolute">
      <div className="w-24 h-11 left-0 top-0 absolute bg-neutral-950 rounded-full" />
      <div className="left-[21px] top-[10px] absolute text-center text-white text-base font-medium font-['Exo 2'] leading-normal">
        Week 8
      </div>
    </div>
    <div className="w-24 h-11 left-[687px] top-[401px] absolute">
      <div className="w-24 h-11 left-0 top-0 absolute bg-neutral-950 rounded-full" />
      <div className="left-[18px] top-[10px] absolute text-center text-white text-base font-medium font-['Exo 2'] leading-normal">
        Week 10
      </div>
    </div>
    <div className="w-24 h-11 left-[799px] top-[401px] absolute">
      <div className="w-24 h-11 left-0 top-0 absolute bg-neutral-950 rounded-full" />
      <div className="left-[20px] top-[10px] absolute text-center text-white text-base font-medium font-['Exo 2'] leading-normal">
        Week 11
      </div>
    </div>
    <div className="w-24 h-11 left-[911px] top-[401px] absolute">
      <div className="w-24 h-11 left-0 top-0 absolute bg-neutral-950 rounded-full" />
      <div className="left-[18px] top-[10px] absolute text-center text-white text-base font-medium font-['Exo 2'] leading-normal">
        Week 12
      </div>
    </div>
    <div className="left-[48px] top-[269px] absolute">
      <div className="w-5 h-5 left-0 top-[2px] absolute flex-col justify-start items-start inline-flex" />
      <div className="left-[28px] top-0 absolute text-emerald-400 text-lg font-semibold font-['Exo 2'] leading-normal">
        NFL
      </div>
    </div>
    <div className="left-[48px] top-[549px] absolute">
      <div className="w-5 h-5 left-0 top-[2px] absolute flex-col justify-start items-start inline-flex" />
      <div className="left-[28px] top-0 absolute text-slate-400 text-lg font-medium font-['Exo 2'] leading-normal">
        Golf
      </div>
    </div>
    <div className="left-[48px] top-[493px] absolute">
      <div className="w-5 h-5 left-0 top-[2px] absolute flex-col justify-start items-start inline-flex">
        <div className="w-3 h-4 relative"></div>
      </div>
      <div className="left-[28px] top-0 absolute text-slate-400 text-lg font-medium font-['Exo 2'] leading-normal">
        Boxing
      </div>
    </div>
    <div className="left-[48px] top-[381px] absolute">
      <div className="w-5 h-5 left-0 top-[2px] absolute flex-col justify-start items-start inline-flex" />
      <div className="left-[28px] top-0 absolute text-slate-400 text-lg font-medium font-['Exo 2'] leading-normal">
        Basketball
      </div>
    </div>
    <div className="left-[48px] top-[437px] absolute">
      <div className="w-5 h-5 left-0 top-[2px] absolute flex-col justify-start items-start inline-flex">
        <div className="w-4 h-4 relative"></div>
      </div>
      <div className="left-[28px] top-0 absolute text-slate-400 text-lg font-medium font-['Exo 2'] leading-normal">
        Baseball
      </div>
    </div>
    <div className="left-[48px] top-[325px] absolute">
      <div className="w-5 h-5 left-0 top-[2px] absolute flex-col justify-start items-start inline-flex" />
      <div className="left-[28px] top-0 absolute text-slate-400 text-lg font-medium font-['Exo 2'] leading-normal">
        Soccer
      </div>
    </div>
    <div className="w-2 h-8 left-[219px] top-[265px] absolute bg-gradient-to-b from-emerald-400 to-green-500 rounded-tl-lg rounded-bl-lg" />
    <img className="w-96 h-44 left-[255px] top-[197px] absolute rounded-lg" src="https://via.placeholder.com/760x180" />
    <div className="w-96 h-40 left-[255px] top-[641px] absolute">
      <div className="w-96 h-40 left-0 top-0 absolute bg-neutral-950 rounded-lg" />
      <div className="left-[16px] top-[116px] absolute text-slate-400 text-base font-medium font-['Exo 2'] leading-normal">
        Sept 13, 8:30 PM
      </div>
      <div className="left-[56px] top-[20px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
        Los Angeles Rams
      </div>
      <div className="left-[56px] top-[68px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
        Chicago Bears
      </div>
      <img className="w-8 h-8 left-[16px] top-[64px] absolute rounded-full" src="https://via.placeholder.com/32x32" />
      <img className="w-8 h-8 left-[16px] top-[16px] absolute rounded-full" src="https://via.placeholder.com/32x32" />
      <div className="w-32 h-10 left-[224px] top-[100px] absolute">
        <div className="w-32 h-10 left-0 top-0 absolute opacity-10 bg-gradient-to-r from-emerald-400 via-cyan-400 to-green-500 rounded-full" />
        <div className="left-[14px] top-[8px] absolute text-white text-base font-semibold font-['Exo 2'] leading-normal">
          4 markets
        </div>
        <div className="w-5 h-5 left-[94px] top-[12px] absolute">
          <img className="w-3.5 h-3 left-[3.75px] top-[3.75px] absolute" src="https://via.placeholder.com/14x12" />
        </div>
      </div>
    </div>
    <div className="w-96 h-40 left-[255px] top-[461px] absolute">
      <div className="w-96 h-40 left-0 top-0 absolute bg-neutral-950 rounded-lg" />
      <div className="left-[16px] top-[116px] absolute text-slate-400 text-base font-medium font-['Exo 2'] leading-normal">
        Sept 12, 7:30 PM
      </div>
      <div className="w-20 h-8 left-[272px] top-[16px] absolute">
        <div className="w-20 h-8 left-0 top-0 absolute bg-gradient-to-r from-red-600 to-rose-600 rounded" />
        <div className="left-[37px] top-[4px] absolute text-white text-base font-medium font-['Exo 2'] leading-normal">
          Live
        </div>
        <div className="w-5 h-5 left-[13px] top-[6px] absolute" />
      </div>
      <div className="left-[56px] top-[20px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
        Detroit Lions
      </div>
      <div className="left-[56px] top-[68px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
        San Francisco 49ers
      </div>
      <div className="w-32 h-10 left-[224px] top-[100px] absolute">
        <div className="w-32 h-10 left-0 top-0 absolute opacity-10 bg-gradient-to-r from-emerald-400 via-cyan-400 to-green-500 rounded-full" />
        <div className="left-[14px] top-[8px] absolute text-white text-base font-semibold font-['Exo 2'] leading-normal">
          4 markets
        </div>
        <div className="w-5 h-5 left-[94px] top-[12px] absolute">
          <img className="w-3.5 h-3 left-[3.75px] top-[3.75px] absolute" src="https://via.placeholder.com/14x12" />
        </div>
      </div>
      <img className="w-8 h-8 left-[16px] top-[16px] absolute rounded-full" src="https://via.placeholder.com/32x32" />
      <img className="w-8 h-8 left-[16px] top-[64px] absolute rounded-full" src="https://via.placeholder.com/32x32" />
    </div>
    <div className="left-[287px] top-[221px] absolute text-neutral-900 text-3xl font-semibold font-['Exo 2']">
      $100 welcome bonus
    </div>
    <div className="left-[287px] top-[267px] absolute text-neutral-900 text-lg font-normal font-['Exo 2']">
      Risk free betting once you sign-up!
    </div>
    <div className="w-10 h-2 left-[619px] top-[353px] absolute">
      <div className="w-2 h-2 left-0 top-0 absolute bg-emerald-800 rounded-full" />
      <div className="w-2 h-2 left-[16px] top-0 absolute bg-emerald-500 rounded-full" />
      <div className="w-2 h-2 left-[32px] top-0 absolute bg-emerald-500 rounded-full" />
    </div>
    <div className="w-36 h-44 left-[881.11px] top-[108px] absolute origin-top-left rotate-[16.70deg] opacity-20" />
    <div className="left-[814px] top-[289px] absolute opacity-40 text-neutral-900 text-xl font-medium font-['Sportypo'] leading-loose">
      TOP OFFER
    </div>
    <div className="left-[814px] top-[337px] absolute opacity-40 text-xl font-medium font-['Sportypo'] leading-loose">
      TOP OFFER
    </div>
    <div className="left-[814px] top-[313px] absolute opacity-40 text-xl font-medium font-['Sportypo'] leading-loose">
      TOP OFFER
    </div>
    <div className="w-40 h-10 left-[287px] top-[313px] absolute">
      <div className="w-40 h-10 left-0 top-0 absolute bg-neutral-900 rounded-full shadow" />
      <div className="left-[16px] top-[8px] absolute text-white text-base font-semibold font-['Exo 2'] leading-normal">
        Start Betting
      </div>
      <div className="w-5 h-5 left-[120px] top-[10px] absolute" />
    </div>
    <div className="w-48 h-14 left-[1126px] top-[298px] absolute">
      <div className="w-48 h-14 left-0 top-0 absolute bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow" />
      <div className="w-40 h-6 left-[21px] top-[16px] absolute">
        <div className="left-[32px] top-0 absolute text-neutral-900 text-lg font-semibold font-['Exo 2'] leading-normal">
          Connect Wallet
        </div>
        <div className="w-6 h-6 left-0 top-0 absolute opacity-80 flex-col justify-start items-start inline-flex">
          <div className="w-5 h-4 relative"></div>
        </div>
      </div>
    </div>
    <div className="left-[1067px] top-[221px] absolute text-neutral-50 text-2xl font-bold font-['Exo 2']">Your</div>
    <div className="left-[1123px] top-[221px] absolute text-emerald-400 text-2xl font-bold font-['Exo 2']">Bets</div>
    <div className="w-96 h-40 left-[255px] top-[821px] absolute">
      <div className="w-96 h-40 left-0 top-0 absolute bg-neutral-950 rounded-lg" />
      <div className="left-[16px] top-[116px] absolute text-slate-400 text-base font-medium font-['Exo 2'] leading-normal">
        Sept 14, 7:30 PM
      </div>
      <div className="left-[56px] top-[20px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
        Kansas City Chiefs
      </div>
      <div className="left-[56px] top-[68px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
        Los Angeles Chargers
      </div>
      <img className="w-8 h-8 left-[16px] top-[16px] absolute rounded-full" src="https://via.placeholder.com/32x32" />
      <img className="w-8 h-8 left-[16px] top-[64px] absolute rounded-full" src="https://via.placeholder.com/32x32" />
      <div className="w-32 h-10 left-[224px] top-[100px] absolute">
        <div className="w-32 h-10 left-0 top-0 absolute opacity-10 bg-gradient-to-r from-emerald-400 via-cyan-400 to-green-500 rounded-full" />
        <div className="left-[15px] top-[8px] absolute text-white text-base font-semibold font-['Exo 2'] leading-normal">
          5 markets
        </div>
        <div className="w-5 h-5 left-[93px] top-[12px] absolute">
          <img className="w-3.5 h-3 left-[3.75px] top-[3.75px] absolute" src="https://via.placeholder.com/14x12" />
        </div>
      </div>
    </div>
    <div className="w-96 h-40 left-[647px] top-[641px] absolute">
      <div className="w-96 h-40 left-0 top-0 absolute bg-neutral-950 rounded-lg" />
      <div className="left-[16px] top-[116px] absolute text-slate-400 text-base font-medium font-['Exo 2'] leading-normal">
        Sept 14, 10:30 PM
      </div>
      <div className="left-[56px] top-[20px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
        Houston Texans
      </div>
      <div className="left-[56px] top-[68px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
        Arizona Cardinals
      </div>
      <img className="w-8 h-8 left-[16px] top-[16px] absolute rounded-full" src="https://via.placeholder.com/32x32" />
      <img className="w-8 h-8 left-[16px] top-[64px] absolute rounded-full" src="https://via.placeholder.com/32x32" />
      <div className="w-32 h-10 left-[224px] top-[100px] absolute">
        <div className="w-32 h-10 left-0 top-0 absolute opacity-10 bg-gradient-to-r from-emerald-400 via-cyan-400 to-green-500 rounded-full" />
        <div className="left-[12px] top-[8px] absolute text-white text-base font-semibold font-['Exo 2'] leading-normal">
          11 markets
        </div>
        <div className="w-5 h-5 left-[95px] top-[12px] absolute">
          <img className="w-3.5 h-3 left-[3.75px] top-[3.75px] absolute" src="https://via.placeholder.com/14x12" />
        </div>
      </div>
    </div>
    <div className="w-96 h-40 left-[647px] top-[461px] absolute">
      <div className="w-96 h-40 left-0 top-0 absolute bg-neutral-950 rounded-lg" />
      <div className="left-[16px] top-[116px] absolute text-slate-400 text-base font-medium font-['Exo 2'] leading-normal">
        Sept 12, 10:30 PM
      </div>
      <div className="w-40 h-8 left-[16px] top-[16px] absolute">
        <div className="left-[40px] top-[4px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
          New York Jets
        </div>
        <img className="w-8 h-8 left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/32x32" />
      </div>
      <div className="w-44 h-8 left-[16px] top-[64px] absolute">
        <div className="left-[40px] top-[4px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
          Dallas Cowboys
        </div>
        <img className="w-8 h-8 left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/32x32" />
      </div>
      <div className="w-20 h-5 left-[268px] top-[22px] absolute">
        <div className="w-4 h-4 left-0 top-[2px] absolute flex-col justify-start items-start inline-flex" />
        <div className="left-[20px] top-0 absolute text-white text-base font-medium font-['Exo 2']">Trending</div>
      </div>
      <div className="w-32 h-10 left-[224px] top-[100px] absolute">
        <div className="w-32 h-10 left-0 top-0 absolute opacity-10 bg-gradient-to-r from-emerald-400 via-cyan-400 to-green-500 rounded-full" />
        <div className="left-[14px] top-[8px] absolute text-white text-base font-semibold font-['Exo 2'] leading-normal">
          8 markets
        </div>
        <div className="w-5 h-5 left-[93px] top-[12px] absolute">
          <img className="w-3.5 h-3 left-[3.75px] top-[3.75px] absolute" src="https://via.placeholder.com/14x12" />
        </div>
      </div>
    </div>
    <div className="w-96 h-40 left-[647px] top-[821px] absolute">
      <div className="w-96 h-40 left-0 top-0 absolute bg-neutral-950 rounded-lg" />
      <div className="left-[16px] top-[116px] absolute text-slate-400 text-base font-medium font-['Exo 2'] leading-normal">
        Sept 15, 10:30 PM
      </div>
      <div className="left-[56px] top-[20px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
        Las Vegas Raiders
      </div>
      <div className="left-[56px] top-[68px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
        New York Giants
      </div>
      <img className="w-8 h-8 left-[16px] top-[16px] absolute rounded-full" src="https://via.placeholder.com/32x32" />
      <img className="w-8 h-8 left-[16px] top-[64px] absolute rounded-full" src="https://via.placeholder.com/32x32" />
      <div className="w-32 h-10 left-[224px] top-[100px] absolute">
        <div className="w-32 h-10 left-0 top-0 absolute opacity-10 bg-gradient-to-r from-emerald-400 via-cyan-400 to-green-500 rounded-full" />
        <div className="left-[12px] top-[8px] absolute text-white text-base font-semibold font-['Exo 2'] leading-normal">
          12 markets
        </div>
        <div className="w-5 h-5 left-[97px] top-[12px] absolute">
          <img className="w-3.5 h-3 left-[3.75px] top-[3.75px] absolute" src="https://via.placeholder.com/14x12" />
        </div>
      </div>
    </div>
    <div className="w-72 left-[32px] top-[93px] absolute">
      <div className="w-20 h-20 left-0 top-0 absolute"></div>
      <div className={`${sportypo.variable} w-48 left-[80px] top-[14px] absolute`}>
        <span className="text-emerald-400 text-xl font-medium leading-relaxed">TOPSPORTS</span>
        <span className="text-white text-xl font-medium --font-sportypo leading-relaxed">EXCHANGE</span>
      </div>
    </div>
  </div>
);
export default TestPage;
