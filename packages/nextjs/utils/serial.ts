export function customSerializer(key: string, value: any): any {
  if (typeof value === "bigint") {
    return `BigInt:${value.toString()}`;
  } else if (key == "eventDate" || key == "startdate") {
    return `Date:${value}`;
  }
  return value;
}

// Deserialize function to convert string representations back to BigInt and Date
export function customDeserializer(key: string, value: any): any {
  if (typeof value === "string") {
    if (value.startsWith("BigInt:")) {
      return BigInt(value.substring(7));
    } else if (value.startsWith("Date:")) {
      return new Date(value.substring(5));
    }
  }
  return value;
}
