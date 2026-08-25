import { createFileRoute } from "@tanstack/react-router";
import { EpisodesTab } from "@/components/admin/EpisodesTab";

export const Route = createFileRoute("/admin/episodios")({
  head: () => ({
    meta: [
      { title: "Temporadas e episódios | Maná Kids+ Admin" },
      {
        name: "description",
        content:
          "Gerencie temporadas e episódios das séries do Maná Kids+, com capa, resumo, duração e vídeo de cada episódio.",
      },
      { property: "og:title", content: "Temporadas e episódios | Maná Kids+ Admin" },
      {
        property: "og:description",
        content: "Cadastre temporadas, episódios e vídeos das séries do Maná Kids+.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EpisodesTab,
});
