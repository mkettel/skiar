import Image from "next/image";
import Map from "./components/GeneralMap";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-start p-6  ">
      <h1 className="text-3xl font-bold text-center mb-6">SkiAR</h1>
      <div className="flex flex-col w-full items-center justify-between">
        <Map />
      </div>
    </main>
  );
}
