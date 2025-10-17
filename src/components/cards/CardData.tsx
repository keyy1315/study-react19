import type { CardData } from "@/types/card";
import { Card, CardContent } from "../ui/card";
import React from "react";
import { FileText } from "lucide-react";

interface CardDataProps {
  cardData: CardData;
}

export default function CardData({ cardData }: CardDataProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 group h-full">
      <CardContent className="p-4 pt-0 flex flex-col h-full">
        <div className="flex flex-col items-center text-center space-y-2 mb-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: `${cardData.color}20` }}
          >
            {cardData.iconUrl ? (
              <img
                src={cardData.iconUrl}
                alt={cardData.title}
                className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <FileText className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            )}
          </div>
          <h3 className="font-semibold text-sm">{cardData.title}</h3>
        </div>
        <p className="text-xs text-gray-500 flex-grow overflow-hidden">
          {cardData.description.length > 150
            ? `${cardData.description.substring(0, 150)}...`
            : cardData.description}
        </p>
      </CardContent>
    </Card>
  );
}
