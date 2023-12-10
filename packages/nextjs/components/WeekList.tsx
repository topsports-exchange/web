export const WeekList = () => (
  <div className="flex justify-center items-center my-4 space-x-2">
    {/* Iterate over an array of weeks. This is just an example, you can replace it with your actual weeks data. */}
    {["All", "Week 12", "Week 13", "Week 14", "Week 15", "Week 16", "Week 17"].map((week, index) => (
      <button
        key={index}
        className={`px-4 py-2 rounded-full ${
          week === "Week 14"
            ? "text-gray-900 bg-gradient-to-r from-emerald-400 to-green-500"
            : "bg-gray-900 text-gray-100"
        } hover:bg-gradient-to-r from-emerald-400 to-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
      >
        {week}
      </button>
    ))}
  </div>
);
