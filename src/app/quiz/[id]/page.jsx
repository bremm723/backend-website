import { LEVELS } from "@/data/quizData";
import QuizClient from "./QuizClient";

// next.config.mjs memakai `output: "export"`, jadi setiap dynamic route
// WAJIB dipre-render lewat generateStaticParams saat build.
export async function generateStaticParams() {
  return LEVELS.map((level) => ({ id: String(level.id) }));
}

// Jangan tambahkan `export const dynamicParams = false;` di sini: dengan
// `output: "export"` flag itu membuat `next dev` mengira generateStaticParams hilang.

export async function generateMetadata({ params }) {
  const level = LEVELS.find((l) => String(l.id) === String(params.id));
  return {
    title: level ? `${level.title} - nduttt.be` : "Kuis Backend - nduttt.be",
    description: level?.tagline,
  };
}

export default function QuizPage({ params }) {
  return <QuizClient levelId={params.id} />;
}
