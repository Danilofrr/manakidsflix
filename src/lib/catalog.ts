import coverArca from "@/assets/cover-arca.jpg";
import coverDavi from "@/assets/cover-davi.jpg";
import coverDaniel from "@/assets/cover-daniel.jpg";
import coverJonas from "@/assets/cover-jonas.jpg";
import coverMoises from "@/assets/cover-moises.jpg";
import coverNatal from "@/assets/cover-natal.jpg";
import coverEden from "@/assets/cover-eden.jpg";

export type Story = {
  slug: string;
  title: string;
  cover: string;
  duration: string;
  ageRange: string;
  verse: string;
  summary: string;
  tags: string[];
  progress?: number;
};

export const stories: Story[] = [
  {
    slug: "a-arca-de-noe",
    title: "A Arca de Noé",
    cover: coverArca,
    duration: "12 min",
    ageRange: "3-6 anos",
    verse: "Gênesis 6-9",
    summary:
      "Noé constrói um barco gigante e enche de bichinhos aos pares. Depois da chuva, um arco-íris colorido aparece no céu como promessa de cuidado.",
    tags: ["Animais", "Promessa", "Aventura"],
    progress: 62,
  },
  {
    slug: "davi-e-o-gigante",
    title: "Davi e o Gigante",
    cover: coverDavi,
    duration: "10 min",
    ageRange: "4-8 anos",
    verse: "1 Samuel 17",
    summary:
      "O menino pastor descobre que coragem não tem tamanho. Com cinco pedrinhas e muita fé, Davi enfrenta o gigante Golias.",
    tags: ["Coragem", "Herói", "Fé"],
    progress: 25,
  },
  {
    slug: "daniel-e-os-leoes",
    title: "Daniel e os Leões",
    cover: coverDaniel,
    duration: "11 min",
    ageRange: "4-8 anos",
    verse: "Daniel 6",
    summary:
      "Daniel passa a noite na cova dos leões e descobre que nunca esteve sozinho. Uma história sobre oração e amizade.",
    tags: ["Oração", "Confiança", "Animais"],
  },
  {
    slug: "jonas-e-o-grande-peixe",
    title: "Jonas e o Grande Peixe",
    cover: coverJonas,
    duration: "13 min",
    ageRange: "3-7 anos",
    verse: "Jonas 1-3",
    summary:
      "Jonas tenta fugir, mas acaba numa viagem submarina inesquecível dentro de um peixe enorme. No fim, ele aprende a dizer sim.",
    tags: ["Perdão", "Mar", "Humor"],
    progress: 88,
  },
  {
    slug: "moises-e-o-mar-vermelho",
    title: "Moisés e o Mar Vermelho",
    cover: coverMoises,
    duration: "14 min",
    ageRange: "5-9 anos",
    verse: "Êxodo 14",
    summary:
      "As águas se abrem em duas paredes gigantes e um caminho seco aparece. A maior travessia da história vira uma aventura para as crianças.",
    tags: ["Aventura", "Milagre", "Liberdade"],
  },
  {
    slug: "o-primeiro-natal",
    title: "O Primeiro Natal",
    cover: coverNatal,
    duration: "9 min",
    ageRange: "2-6 anos",
    verse: "Lucas 2",
    summary:
      "Uma estrela brilhante guia pastores e visitantes até um bebê numa manjedoura, cercado por bichinhos curiosos.",
    tags: ["Natal", "Ninar", "Estrela"],
  },
  {
    slug: "o-jardim-do-eden",
    title: "O Jardim do Éden",
    cover: coverEden,
    duration: "8 min",
    ageRange: "2-5 anos",
    verse: "Gênesis 1-2",
    summary:
      "Flores, borboletas e bichinhos aparecem um por um no jardim mais colorido de todos os tempos. Perfeito para os menorzinhos.",
    tags: ["Criação", "Natureza", "Calma"],
  },
];

export const storyBySlug = (slug: string) => stories.find((s) => s.slug === slug);

export const rows = [
  {
    id: "continuar",
    title: "Continuar assistindo",
    subtitle: "De onde a Nina parou",
    items: stories.filter((s) => s.progress),
  },
  {
    id: "favoritas",
    title: "Histórias mais amadas",
    subtitle: "Campeãs de repeteco",
    items: [stories[0], stories[1], stories[5], stories[4], stories[3]],
  },
  {
    id: "aventura",
    title: "Aventuras corajosas",
    subtitle: "Para quem gosta de emoção",
    items: [stories[1], stories[4], stories[2], stories[3]],
  },
  {
    id: "soninho",
    title: "Hora do soninho",
    subtitle: "Bem calminhas, para dormir",
    items: [stories[6], stories[5], stories[0]],
  },
];

export const categories = [
  { label: "Aventura", tone: "primary" as const },
  { label: "Animais", tone: "secondary" as const },
  { label: "Músicas", tone: "accent" as const },
  { label: "Soninho", tone: "sunny" as const },
  { label: "Coragem", tone: "mint" as const },
];
