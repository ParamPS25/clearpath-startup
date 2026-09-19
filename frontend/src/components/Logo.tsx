// Placeholder mark — swap the contents of the inner <div> for an <img> once
// a real logo is ready. Keep the outer Link/sizing as-is.
export default function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0"
    >
      <span style={{ fontSize: size * 0.5 }}>C</span>
    </div>
  );
}
