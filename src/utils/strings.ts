export function formatName(name: string) {
  return name.replace(/[ :]/g, "").toLowerCase();
}

export function capitalize(string: string) {
  return string[0].toUpperCase() + string.substring(1, string.length);
}
