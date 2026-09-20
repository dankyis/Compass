import { ExamToggle } from "@/components/ExamToggle";

export default function Home() {
  return (
    <main className="home">
      <header className="hero">
        <h1>Compass</h1>
        <p className="subtitle">
          Practise WAEC past questions — BECE and WASSCE, with instant feedback.
        </p>
      </header>
      <ExamToggle />
    </main>
  );
}
