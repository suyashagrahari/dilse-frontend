"use client";

import { memo, useMemo } from "react";

const StarField = memo(function StarField({ count = 30 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 2,
        dur: `${Math.random() * 3 + 2}s`,
        del: `${Math.random() * 3}s`,
      })),
    [count],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="eid-star"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            "--dur": s.dur,
            "--del": s.del,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
});

export default StarField;
