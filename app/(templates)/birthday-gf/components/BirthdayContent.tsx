"use client";

interface Props {
  data: {
    recipientName?: string;
    senderName?: string;
    personalMessage?: string;
    wishes?: string[];
    photos?: string[];
    theme?: string;
  };
  tab: string;
  onTabChange: (t: string) => void;
}

export default function BirthdayContent({ data, tab }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5EDE0",
        padding: "24px 16px",
        fontFamily: "'Dancing Script', cursive",
      }}
    >
      {tab === "cover" && (
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: 32, color: "#5D3F31", marginBottom: 8 }}>
            Happy Birthday
          </h1>
          <h2 style={{ fontSize: 24, color: "#AD684A", marginBottom: 24 }}>
            {data.recipientName || "Dear Friend"}
          </h2>
          {data.photos?.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt=""
              style={{ width: "100%", borderRadius: 12, marginBottom: 12 }}
            />
          ))}
          <p style={{ fontSize: 16, color: "#5D3F31", lineHeight: 1.7 }}>
            {data.personalMessage}
          </p>
        </div>
      )}
      {tab === "final" && (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: 24,
              color: "#5D3F31",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Birthday Wishes 🎉
          </h2>
          {(data.wishes || []).map((w, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.7)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                color: "#5D3F31",
              }}
            >
              {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
