import { ImageResponse } from "next/og";

export const alt =
  "King of Shades — window tinting for cars, homes, and commercial properties in Brigantine and South Jersey";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#f7f4ea",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 128,
            height: 6,
            background: "#d4af37",
            marginBottom: 36,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          King of Shades
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 36,
            color: "#d4af37",
          }}
        >
          Cars, homes, and commercial properties
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 24,
            color: "#bdb7a4",
          }}
        >
          Window tinting in Brigantine and South Jersey
        </div>
      </div>
    ),
    { ...size },
  );
}
