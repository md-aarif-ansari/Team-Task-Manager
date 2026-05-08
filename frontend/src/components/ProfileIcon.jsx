/* Profile icon SVG for navbar */
export default function ProfileIcon({ size = 28, color = '#fff' }) {
  return (
    <svg height={size} width={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M4 20c0-3.3137 3.134-6 7-6s7 2.6863 7 6" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  );
}
