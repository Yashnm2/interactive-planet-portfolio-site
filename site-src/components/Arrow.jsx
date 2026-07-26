export default function Arrow({ className = "" }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}
