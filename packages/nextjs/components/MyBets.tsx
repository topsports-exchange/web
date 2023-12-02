export const MyBets = () => {
  return (
    <div className="w-96 h-44 bg-neutral-950 rounded-2xl">
      <div className="w-48 h-14 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow" />
      <div className="text-neutral-900 text-lg font-semibold font-['Exo 2'] leading-normal">Connect Wallet</div>
      <div className="w-6 h-6 relative opacity-80 flex-col justify-start items-start inline-flex">
        <div className="w-5 h-4 relative"></div>
      </div>
      <div className="text-neutral-50 text-2xl font-bold font-['Exo 2']">Your</div>
      <div className="text-slate-400 text-base font-medium font-['Exo 2'] leading-normal">
        Connect your wallet to access your bets
      </div>
      <div className="text-emerald-400 text-2xl font-bold font-['Exo 2']">Bets</div>
    </div>
  );
};
