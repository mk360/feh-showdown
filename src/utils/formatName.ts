export default function formatName(name: string) {
  return name.replace(/[ :]/g, "").toLowerCase();
}
