import Image from "next/image";
// import Map from "./components/GeneralMap";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./components/GeneralMap"), {
  loading: () => <p>Loading...</p>,
  ssr: false
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start p-6  ">
      <h1 className="text-3xl font-bold text-center mb-6">SkiAR</h1>
      <div className="flex relative flex-col w-full items-center justify-between">
        <Map />
      </div>
    </main>
  );
}
