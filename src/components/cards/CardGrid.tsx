import type { CardData as CardDataType } from "@/types/card";
import CardData from "./CardData";

interface CardGridProps {
  cards: CardDataType[];
}

export default function CardGrid({ cards }: CardGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <CardData key={card.id} cardData={card} />
      ))}
    </div>
  );
}
