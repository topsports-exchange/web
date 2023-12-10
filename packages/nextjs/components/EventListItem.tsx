import { DeployedEventNormalized, Team } from "~~/interfaces/interfaces";

const EventListItem = ({
  data,
  setSelectedMatch,
}: {
  data: DeployedEventNormalized;
  setSelectedMatch?: (match: string | null) => void;
}) => {
  const home = data.homeTeam as unknown as Team;
  const away = data.awayTeam as unknown as Team;
  const count = 10+(data as any).count as number;
  const isLive = (startDate: Date | string): boolean => {
    const startDateObj = startDate instanceof Date ? startDate : new Date(startDate);
  
    const now = new Date();
    const twoHoursAfterStartDate = new Date(startDateObj.getTime());
    twoHoursAfterStartDate.setHours(startDateObj.getHours() + 2); // test with 72 or more
 
    return now > startDateObj && now <= twoHoursAfterStartDate;
  };

  return (
    <div className="bg-neutral-900 text-white p-4 rounded-lg w-auto h-40 relative">
      <div className="left-[16px] top-[116px] absolute text-slate-400 text-base font-medium font-['Exo 2'] leading-normal">
        {data.startdate
          ? new Date(data.startdate).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })
          : ""}
      </div>
      {isLive(data.startdate) && (
        <div className="w-20 h-8 left-[272px] top-[16px] absolute">
          <div className="w-20 h-8 left-0 top-0 absolute bg-gradient-to-r from-red-600 to-rose-600 rounded" />
          <div className="left-[37px] top-[4px] absolute text-white text-base font-medium font-['Exo 2'] leading-normal">
            {/* <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="fluent:live-20-filled">
                  <path
                    id="Vector"
                    d="M5.45301 4.16705C5.38625 4.09893 5.30672 4.04464 5.21896 4.00726C5.13121 3.96989 5.03695 3.95018 4.94158 3.94925C4.8462 3.94832 4.75158 3.9662 4.66312 4.00185C4.57465 4.03751 4.49408 4.09024 4.42601 4.15705C3.65596 4.92263 3.04512 5.83311 2.62874 6.83596C2.21235 7.83881 1.99867 8.91419 2.00001 10C1.99876 11.1276 2.22926 12.2433 2.67721 13.278C3.12516 14.3128 3.78099 15.2444 4.60401 16.015C4.74253 16.1431 4.9255 16.2121 5.11408 16.2074C5.30266 16.2028 5.48199 16.1248 5.61401 15.99C5.93001 15.674 5.89101 15.171 5.58701 14.88C4.9265 14.2506 4.4009 13.4934 4.04212 12.6545C3.68335 11.8156 3.49891 10.9125 3.50001 10C3.50001 8.15405 4.24101 6.48005 5.44301 5.26205C5.73301 4.96705 5.76301 4.47705 5.45301 4.16705ZM7.21401 5.93005C7.08231 5.79454 6.90226 5.71676 6.71331 5.71376C6.52437 5.71076 6.34194 5.78278 6.20601 5.91405C5.66496 6.448 5.2355 7.08423 4.94261 7.7857C4.64973 8.48717 4.49928 9.23989 4.50001 10C4.50001 11.692 5.23001 13.213 6.39301 14.265C6.53038 14.3862 6.7091 14.4498 6.89211 14.4427C7.07512 14.4357 7.24839 14.3584 7.37601 14.227C7.70401 13.899 7.64301 13.383 7.33501 13.093C6.91281 12.6962 6.57651 12.2169 6.34689 11.6849C6.11727 11.1529 5.99921 10.5795 6.00001 10C6.00001 8.85005 6.45701 7.80605 7.20001 7.04005C7.48601 6.74605 7.53301 6.24805 7.21401 5.93005ZM12.786 5.93005C12.9177 5.79454 13.0978 5.71676 13.2867 5.71376C13.4756 5.71076 13.6581 5.78278 13.794 5.91405C14.3351 6.448 14.7645 7.08423 15.0574 7.7857C15.3503 8.48717 15.5007 9.23989 15.5 10C15.5 11.692 14.77 13.213 13.607 14.265C13.4696 14.3862 13.2909 14.4498 13.1079 14.4427C12.9249 14.4357 12.7516 14.3584 12.624 14.227C12.296 13.899 12.357 13.383 12.665 13.093C13.0872 12.6962 13.4235 12.2169 13.6531 11.6849C13.8827 11.1529 14.0008 10.5795 14 10C14 8.85005 13.543 7.80605 12.8 7.04005C12.514 6.74605 12.467 6.24805 12.786 5.93005ZM14.547 4.16805C14.6138 4.09993 14.6933 4.04564 14.7811 4.00826C14.8688 3.97089 14.9631 3.95118 15.0584 3.95025C15.1538 3.94932 15.2484 3.9672 15.3369 4.00285C15.4254 4.03851 15.5059 4.09124 15.574 4.15805C16.3439 4.92351 16.9547 5.83383 17.3711 6.8365C17.7875 7.83917 18.0012 8.91436 18 10C18.0013 11.1276 17.7708 12.2433 17.3228 13.278C16.8749 14.3128 16.219 15.2444 15.396 16.015C15.2575 16.1431 15.0745 16.2121 14.8859 16.2074C14.6974 16.2028 14.518 16.1248 14.386 15.99C14.07 15.674 14.109 15.171 14.414 14.88C15.0743 14.2505 15.5997 13.4933 15.9583 12.6544C16.3169 11.8154 16.5012 10.9124 16.5 10C16.5 8.15405 15.759 6.48005 14.557 5.26205C14.267 4.96705 14.237 4.47705 14.547 4.16705V4.16805ZM10 8.50005C9.60218 8.50005 9.22065 8.65808 8.93935 8.93939C8.65804 9.22069 8.50001 9.60222 8.50001 10C8.50001 10.3979 8.65804 10.7794 8.93935 11.0607C9.22065 11.342 9.60218 11.5 10 11.5C10.3978 11.5 10.7794 11.342 11.0607 11.0607C11.342 10.7794 11.5 10.3979 11.5 10C11.5 9.60222 11.342 9.22069 11.0607 8.93939C10.7794 8.65808 10.3978 8.50005 10 8.50005Z"
                    fill="white"
                  />
                </g>
              </svg> */}
            Live
          </div>
        </div>
      )}
      <div className="left-[56px] top-[20px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
        {home.name}
      </div>
      <div className="left-[56px] top-[68px] absolute text-white text-lg font-medium font-['Exo 2'] leading-normal">
        {away.name}
      </div>
      <div className="w-32 h-10 left-[224px] top-[100px] absolute">
        <div className="w-32 h-10 left-0 top-0 absolute opacity-10 bg-gradient-to-r from-emerald-400 via-cyan-400 to-green-500 rounded-full" />
        <button
          onClick={() => setSelectedMatch?.(data.eventId)}
          className="left-[14px] top-[8px] absolute text-white text-base font-semibold font-['Exo 2'] leading-normal"
        >
          {count} markets
        </button>
        <div className="w-5 h-5 left-[94px] top-[12px] absolute">
          <img className="w-3.5 h-3 left-[3.75px] top-[3.75px] absolute" src="https://via.placeholder.com/14x12" />
        </div>
      </div>
      <img className="w-8 h-8 left-[16px] top-[16px] absolute rounded-full" src={home.logo ?? "/assets/LA.png"} />
      <img
        className="w-8 h-8 left-[16px] top-[64px] absolute rounded-full"
        src={away.logo ?? "/assets/kansas.png"}
      />
    </div>
  );
};

export { EventListItem };
