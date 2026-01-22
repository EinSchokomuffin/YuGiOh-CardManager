"use client";

import Image from "next/image";
import type { Card as CardType, Printing } from "@/lib/types";
import { cn, formatPrice, getRarityColor, getFrameColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";

interface CardGridItemProps {
  card: CardType;
  onSelect?: (card: CardType) => void;
  onAddToCollection?: (card: CardType) => void;
}

export function CardGridItem({ card, onSelect, onAddToCollection }: CardGridItemProps) {
  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-all card-hover",
        getFrameColor(card.frameType)
      )}
      onClick={() => onSelect?.(card)}
    >
      {/* Card Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={card.imageUrlSmall || card.imageUrl}
          alt={card.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="sm" variant="secondary" onClick={(e) => {
            e.stopPropagation();
            onSelect?.(card);
          }}>
            <Eye className="mr-1 h-4 w-4" />
            Details
          </Button>
          <Button size="sm" variant="gold" onClick={(e) => {
            e.stopPropagation();
            onAddToCollection?.(card);
          }}>
            <Plus className="mr-1 h-4 w-4" />
            Hinzufügen
          </Button>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3">
        <h3 className="truncate font-medium text-sm">{card.name}</h3>
        <p className="text-xs text-muted-foreground">{card.type}</p>
        
        {/* Stats for monsters */}
        {card.atk !== undefined && (
          <div className="mt-1 flex gap-2 text-xs">
            <span>ATK: {card.atk}</span>
            {card.def !== undefined && <span>DEF: {card.def}</span>}
          </div>
        )}
        
        {/* Archetype badge */}
        {card.archetype && (
          <Badge variant="outline" className="mt-2 text-xs">
            {card.archetype}
          </Badge>
        )}
      </div>
    </div>
  );
}

interface CardListItemProps {
  card: CardType;
  printing?: Printing;
  onSelect?: (card: CardType) => void;
  onAddToCollection?: (card: CardType, printing?: Printing) => void;
}

export function CardListItem({ card, printing, onSelect, onAddToCollection }: CardListItemProps) {
  return (
    <div
      className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent cursor-pointer"
      onClick={() => onSelect?.(card)}
    >
      {/* Card Image */}
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded">
        <Image
          src={card.imageUrlSmall || card.imageUrl}
          alt={card.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Card Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium">{card.name}</h3>
        <p className="text-sm text-muted-foreground">{card.type}</p>
        {printing && (
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {printing.setCode}
            </Badge>
            <span className={cn("text-xs font-medium", getRarityColor(printing.rarity))}>
              {printing.rarity}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      {card.atk !== undefined && (
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">ATK: {card.atk}</p>
          {card.def !== undefined && (
            <p className="text-sm text-muted-foreground">DEF: {card.def}</p>
          )}
        </div>
      )}

      {/* Price */}
      {printing?.price && (
        <div className="text-right">
          <p className="font-medium text-green-500">{formatPrice(printing.price)}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="gold"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCollection?.(card, printing);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
