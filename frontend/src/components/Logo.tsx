// Placeholder mark — swap the contents of the inner <div> for an <img> once

import Image from "next/image";

// a real logo is ready. Keep the outer Link/sizing as-is.
export default function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center gap-2 font-bold shrink-0"
    >
      <Image 
       src="/logo.png"
       alt="ClearPath Logo"
       width={size}
       height={size}
      />
    </div>
  );
}
