const date = {
  getMonday: (date) => {
    const first =
      date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
    const monday = new Date(date.setDate(first));
    monday.setUTCHours(0, 0, 0, 0);
    monday.setHours(0);
    return monday;
  },
  getSunday: (date) => {
    const first =
      date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
    const sunday = new Date(date.setDate(first + 6));
    sunday.setHours(23);
    sunday.setMinutes(59);
    return sunday;
  },
  formatDate: (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB"); // Returns DD/MM/YYYY
  },
  formatDateTime: (date) => {
    if (!date) return "";
    const d = new Date(date);
    return (
      d.toLocaleDateString("en-GB") +
      " " +
      d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    ); // Returns DD/MM/YYYY HH:mm
  },
  toDateInputValue: (date) => {
    // Convert a date to YYYY-MM-DD for input type="date"
    const d = date ? new Date(date) : new Date();
    return d.toISOString().split("T")[0];
  },
};

export default date;
