"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Card, Printing, CardCondition, CardEdition, PortfolioType } from "@/lib/types";
import { cn, formatPrice, getRarityColor, getConditionLabel, getEditionLabel, getCardName } from "@/lib/utils";
import apiClient from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Check } from "lucide-react";
import { useToastStore, useAuthStore } from "@/lib/store";

interface CardDetailModalProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONDITIONS: CardCondition[] = [
  "MINT",
  "NEAR_MINT",
  "EXCELLENT",
  "GOOD",
  "LIGHT_PLAYED",
  "PLAYED",
  "POOR",
];

const EDITIONS: CardEdition[] = ["FIRST_EDITION", "UNLIMITED", "LIMITED"];

const LANGUAGES = [
  { code: "EN", name: "English" },
  { code: "DE", name: "Deutsch" },
  { code: "FR", name: "Français" },
  { code: "IT", name: "Italiano" },
  { code: "ES", name: "Español" },
  { code: "PT", name: "Português" },
  { code: "JP", name: "日本語" },
  { code: "KR", name: "한국어" },
];

export function CardDetailModal({ card, open, onOpenChange }: CardDetailModalProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const displayName = card ? getCardName(card, user?.searchLanguage || 'DE') : '';
  
  const [selectedPrinting, setSelectedPrinting] = useState<Printing | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<CardCondition>("GOOD");
  const [edition, setEdition] = useState<CardEdition>("FIRST_EDITION");
  const [language, setLanguage] = useState("DE");
  const [purchasePrice, setPurchasePrice] = useState<string>("");

  const { data: printings, isLoading: printingsLoading } = useQuery({
    queryKey: ["card-printings", card?.id],
    queryFn: () => apiClient.getCardPrintings(card!.id),
    enabled: !!card?.id,
  });

  const addToCollectionMutation = useMutation({
    mutationFn: (printingId: string) =>
      apiClient.addToCollection({
        printingId,
        condition,
        edition,
        language,
        quantity,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
      queryClient.invalidateQueries({ queryKey: ["collection-stats"] });
      addToast({
        title: "Karte hinzugefügt",
        description: `${card?.name} wurde zur Sammlung hinzugefügt.`,
        type: "success",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      addToast({
        title: "Fehler",
        description: error.response?.data?.message || "Konnte Karte nicht hinzufügen",
        type: "error",
      });
    },
  });

  const handleAddToCollection = () => {
    if (selectedPrinting) {
      addToCollectionMutation.mutate(selectedPrinting.id);
    }
  };

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{displayName}</DialogTitle>
          <DialogDescription>{card.type}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card Image */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
            <Image
              src={card.imageUrl}
              alt={displayName}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Card Details */}
          <div className="space-y-4">
            <Tabs defaultValue="info">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
                <TabsTrigger value="printings" className="flex-1">Drucke</TabsTrigger>
                <TabsTrigger value="add" className="flex-1">Hinzufügen</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                {/* Stats */}
                {card.atk !== undefined && (
                  <div className="flex gap-4">
                    <div className="rounded-lg bg-red-500/10 px-4 py-2">
                      <p className="text-xs text-muted-foreground">ATK</p>
                      <p className="text-xl font-bold text-red-500">{card.atk}</p>
                    </div>
                    {card.def !== undefined && (
                      <div className="rounded-lg bg-blue-500/10 px-4 py-2">
                        <p className="text-xs text-muted-foreground">DEF</p>
                        <p className="text-xl font-bold text-blue-500">{card.def}</p>
                      </div>
                    )}
                    {card.level && (
                      <div className="rounded-lg bg-yellow-500/10 px-4 py-2">
                        <p className="text-xs text-muted-foreground">Level</p>
                        <p className="text-xl font-bold text-yellow-500">{card.level}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Attributes */}
                <div className="flex flex-wrap gap-2">
                  {card.attribute && (
                    <Badge variant="secondary">{card.attribute}</Badge>
                  )}
                  {card.race && <Badge variant="outline">{card.race}</Badge>}
                  {card.archetype && (
                    <Badge variant="default">{card.archetype}</Badge>
                  )}
                </div>

                {/* Description */}
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm">{card.description}</p>
                </div>
              </TabsContent>

              <TabsContent value="printings" className="space-y-2">
                {printingsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : printings && printings.length > 0 ? (
                  <div className="max-h-[400px] space-y-2 overflow-y-auto">
                    {printings.map((printing) => (
                      <div
                        key={printing.id}
                        className={cn(
                          "flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors",
                          selectedPrinting?.id === printing.id
                            ? "border-primary bg-primary/10"
                            : "hover:bg-accent"
                        )}
                        onClick={() => setSelectedPrinting(printing)}
                      >
                        <div>
                          <p className="font-medium">{printing.setCode}</p>
                          <p className="text-sm text-muted-foreground">
                            {printing.setName}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn("mt-1", getRarityColor(printing.rarity))}
                          >
                            {printing.rarity}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-500">
                            {formatPrice(printing.price)}
                          </p>
                          {selectedPrinting?.id === printing.id && (
                            <Check className="ml-auto mt-1 h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    Keine Drucke gefunden
                  </p>
                )}
              </TabsContent>

              <TabsContent value="add" className="space-y-4">
                {selectedPrinting ? (
                  <>
                    <div className="rounded-lg border p-3">
                      <p className="font-medium">{selectedPrinting.setCode}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPrinting.setName}
                      </p>
                    </div>

                    <div className="grid gap-4">
                      <div>
                        <label className="text-sm font-medium">Anzahl</label>
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Zustand</label>
                        <Select
                          value={condition}
                          onValueChange={(v) => setCondition(v as CardCondition)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITIONS.map((c) => (
                              <SelectItem key={c} value={c}>
                                {getConditionLabel(c)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Edition</label>
                        <Select
                          value={edition}
                          onValueChange={(v) => setEdition(v as CardEdition)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EDITIONS.map((e) => (
                              <SelectItem key={e} value={e}>
                                {getEditionLabel(e)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Sprache</label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Einkaufspreis (optional)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="0.00"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                      onClick={handleAddToCollection}
                      disabled={addToCollectionMutation.isPending}
                    >
                      {addToCollectionMutation.isPending ? (
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-6 w-6" />
                      )}
                      ✨ Zur Sammlung hinzufügen
                    </Button>
                  </>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    Bitte wähle zuerst einen Druck im &quot;Drucke&quot; Tab aus.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
