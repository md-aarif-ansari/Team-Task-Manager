// HamburgerIcon.jsx
export default function HamburgerIcon({ size = 28, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect y="4" width="24" height="2.5" rx="1.25" fill={color} />
      <rect y="10.75" width="24" height="2.5" rx="1.25" fill={color} />
      <rect y="17.5" width="24" height="2.5" rx="1.25" fill={color} />
    </svg>
  );
}
