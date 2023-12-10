import { EventListItem } from "./EventListItem";

const EventList = ({
  setSelectedMatch,
  events,
}: {
  setSelectedMatch?: (match: string | null) => void;
  events: any[];
}) => (
  <div className="justify-center items-center my-4 grid grid-cols-2 gap-4">
    {events.map((data, index) => (
      <EventListItem key={index} setSelectedMatch={setSelectedMatch} data={data} />
    ))}
  </div>
);
export { EventList };
