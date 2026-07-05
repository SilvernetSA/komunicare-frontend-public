export default function globalThisPlugin() {
  return {
    onProcessStyle(style: Record<string, unknown>) {
      return style;
    },
  };
}
