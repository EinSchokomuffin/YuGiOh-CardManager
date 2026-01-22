"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Save,
  Trash2,
  FileDown,
  Loader2,
  Layers,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import apiClient from "@/lib/api";
import type { Card, Printing, Deck } from "@/lib/types";
import { useDeckBuilderStore, useToastStore } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card as CardUI,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DecksPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const {
    mainDeck,
    extraDeck,
    sideDeck,
    addToMainDeck,
    addToExtraDeck,
    addToSideDeck,
    removeFromMainDeck,
    removeFromExtraDeck,
    removeFromSideDeck,
    clearDeck,
    mainDeckCount,
    extraDeckCount,
    sideDeckCount,
    currentDeck,
    setCurrentDeck,
  } = useDeckBuilderStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [deckName, setDeckName] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "extra" | "side">("main");

  // Fetch user's decks
  const { data: decks, isLoading: decksLoading } = useQuery({
    queryKey: ["decks"],
    queryFn: () => apiClient.getDecks(),
  });

  // Search cards from collection
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["card-search", searchQuery],
    queryFn: () => apiClient.searchCards({ name: searchQuery, limit: 20 }),
    enabled: searchQuery.length >= 2,
  });

  // Validate deck ownership
  const validateMutation = useMutation({
    mutationFn: (deckId: string) => apiClient.validateDeckOwnership(deckId),
    onSuccess: () => {
      setShowValidationDialog(true);
    },
  });

  // Create deck mutation
  const createDeckMutation = useMutation({
    mutationFn: () =>
      apiClient.createDeck({
        name: deckName,
        description: deckDescription,
        cards: [
          ...mainDeck.map((c) => ({ printingId: c.id, quantity: c.quantity, zone: "MAIN" as const })),
          ...extraDeck.map((c) => ({ printingId: c.id, quantity: c.quantity, zone: "EXTRA" as const })),
          ...sideDeck.map((c) => ({ printingId: c.id, quantity: c.quantity, zone: "SIDE" as const })),
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      addToast({
        title: "Deck gespeichert",
        description: `"${deckName}" wurde erfolgreich erstellt.`,
        type: "success",
      });
      setShowSaveDialog(false);
      setDeckName("");
      setDeckDescription("");
    },
    onError: () => {
      addToast({
        title: "Fehler",
        description: "Das Deck konnte nicht gespeichert werden.",
        type: "error",
      });
    },
  });

  const handleAddCard = (card: Card & { printings?: Printing[] }) => {
    const printing = card.printings?.[0];
    if (!printing) return;

    const cardWithPrinting = { ...printing, card };
    const frameType = card.frameType.toLowerCase();

    // Determine which deck zone
    if (
      frameType.includes("fusion") ||
      frameType.includes("synchro") ||
      frameType.includes("xyz") ||
      frameType.includes("link")
    ) {
      if (extraDeckCount() < 15) {
        addToExtraDeck(cardWithPrinting);
      }
    } else {
      if (mainDeckCount() < 60) {
        addToMainDeck(cardWithPrinting);
      }
    }
  };

  const handleRemoveCard = (printingId: string, zone: "main" | "extra" | "side") => {
    switch (zone) {
      case "main":
        removeFromMainDeck(printingId);
        break;
      case "extra":
        removeFromExtraDeck(printingId);
        break;
      case "side":
        removeFromSideDeck(printingId);
        break;
    }
  };

  const totalCards = mainDeckCount() + extraDeckCount() + sideDeckCount();
  const isValidDeck = mainDeckCount() >= 40 && mainDeckCount() <= 60;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deck Builder</h1>
          <p className="text-muted-foreground">
            Baue dein perfektes Yu-Gi-Oh! Deck
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearDeck} disabled={totalCards === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Leeren
          </Button>
          <Button
            variant="gold"
            onClick={() => setShowSaveDialog(true)}
            disabled={!isValidDeck}
          >
            <Save className="mr-2 h-4 w-4" />
            Speichern
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card Search Panel */}
        <div className="space-y-4">
          <CardUI>
            <CardHeader>
              <CardTitle className="text-lg">Karten hinzufügen</CardTitle>
              <CardDescription>Suche nach Karten für dein Deck</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Kartenname..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-[400px] space-y-2 overflow-y-auto">
                {searchLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : searchResults && searchResults.data.length > 0 ? (
                  searchResults.data.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center gap-3 rounded-lg border p-2 hover:bg-accent cursor-pointer"
                      onClick={() => handleAddCard(card)}
                    >
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded">
                        <Image
                          src={card.imageUrlSmall || card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{card.name}</p>
                        <p className="text-xs text-muted-foreground">{card.type}</p>
                      </div>
                      <Button size="icon" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Keine Karten gefunden
                  </p>
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Mindestens 2 Zeichen eingeben
                  </p>
                )}
              </div>
            </CardContent>
          </CardUI>

          {/* Saved Decks */}
          <CardUI>
            <CardHeader>
              <CardTitle className="text-lg">Meine Decks</CardTitle>
            </CardHeader>
            <CardContent>
              {decksLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : decks && decks.length > 0 ? (
                <div className="space-y-2">
                  {decks.map((deck) => (
                    <div
                      key={deck.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                    >
                      <div>
                        <p className="font-medium">{deck.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {deck.cards?.length || 0} Karten
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Laden
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Noch keine Decks gespeichert</p>
              )}
            </CardContent>
          </CardUI>
        </div>

        {/* Deck Builder Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Deck Stats */}
          <div className="grid grid-cols-3 gap-4">
            <CardUI
              className={cn(
                "cursor-pointer transition-colors",
                activeTab === "main" && "ring-2 ring-primary"
              )}
              onClick={() => setActiveTab("main")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Main Deck</p>
                  <Badge
                    variant={
                      mainDeckCount() >= 40 && mainDeckCount() <= 60
                        ? "default"
                        : "destructive"
                    }
                  >
                    {mainDeckCount()}/40-60
                  </Badge>
                </div>
              </CardContent>
            </CardUI>
            <CardUI
              className={cn(
                "cursor-pointer transition-colors",
                activeTab === "extra" && "ring-2 ring-primary"
              )}
              onClick={() => setActiveTab("extra")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Extra Deck</p>
                  <Badge variant={extraDeckCount() <= 15 ? "default" : "destructive"}>
                    {extraDeckCount()}/15
                  </Badge>
                </div>
              </CardContent>
            </CardUI>
            <CardUI
              className={cn(
                "cursor-pointer transition-colors",
                activeTab === "side" && "ring-2 ring-primary"
              )}
              onClick={() => setActiveTab("side")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Side Deck</p>
                  <Badge variant={sideDeckCount() <= 15 ? "default" : "destructive"}>
                    {sideDeckCount()}/15
                  </Badge>
                </div>
              </CardContent>
            </CardUI>
          </div>

          {/* Deck Cards Grid */}
          <CardUI>
            <CardContent className="p-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="main">Main ({mainDeckCount()})</TabsTrigger>
                  <TabsTrigger value="extra">Extra ({extraDeckCount()})</TabsTrigger>
                  <TabsTrigger value="side">Side ({sideDeckCount()})</TabsTrigger>
                </TabsList>

                <TabsContent value="main">
                  {mainDeck.length > 0 ? (
                    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                      {mainDeck.map((card) => (
                        <div
                          key={card.id}
                          className="group relative"
                          onClick={() => handleRemoveCard(card.id, "main")}
                        >
                          <div className="relative aspect-[3/4] cursor-pointer overflow-hidden rounded">
                            <Image
                              src={card.card.imageUrlSmall || card.card.imageUrl}
                              alt={card.card.name}
                              fill
                              className="object-cover transition-opacity group-hover:opacity-70"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <X className="h-6 w-6 text-destructive" />
                            </div>
                            {card.quantity > 1 && (
                              <Badge className="absolute bottom-1 right-1 text-xs">
                                x{card.quantity}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">
                      Füge Karten zum Main Deck hinzu
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="extra">
                  {extraDeck.length > 0 ? (
                    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                      {extraDeck.map((card) => (
                        <div
                          key={card.id}
                          className="group relative"
                          onClick={() => handleRemoveCard(card.id, "extra")}
                        >
                          <div className="relative aspect-[3/4] cursor-pointer overflow-hidden rounded">
                            <Image
                              src={card.card.imageUrlSmall || card.card.imageUrl}
                              alt={card.card.name}
                              fill
                              className="object-cover transition-opacity group-hover:opacity-70"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <X className="h-6 w-6 text-destructive" />
                            </div>
                            {card.quantity > 1 && (
                              <Badge className="absolute bottom-1 right-1 text-xs">
                                x{card.quantity}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">
                      Füge Karten zum Extra Deck hinzu
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="side">
                  {sideDeck.length > 0 ? (
                    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                      {sideDeck.map((card) => (
                        <div
                          key={card.id}
                          className="group relative"
                          onClick={() => handleRemoveCard(card.id, "side")}
                        >
                          <div className="relative aspect-[3/4] cursor-pointer overflow-hidden rounded">
                            <Image
                              src={card.card.imageUrlSmall || card.card.imageUrl}
                              alt={card.card.name}
                              fill
                              className="object-cover transition-opacity group-hover:opacity-70"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <X className="h-6 w-6 text-destructive" />
                            </div>
                            {card.quantity > 1 && (
                              <Badge className="absolute bottom-1 right-1 text-xs">
                                x{card.quantity}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">
                      Füge Karten zum Side Deck hinzu
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </CardUI>

          {/* Deck Validation Status */}
          {!isValidDeck && totalCards > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">
                Das Main Deck muss zwischen 40 und 60 Karten enthalten (aktuell:{" "}
                {mainDeckCount()})
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deck speichern</DialogTitle>
            <DialogDescription>
              Gib deinem Deck einen Namen und eine Beschreibung.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="z.B. Blue-Eyes Chaos MAX"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Beschreibung (optional)</label>
              <Input
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                placeholder="Beschreibe dein Deck..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
              Abbrechen
            </Button>
            <Button
              variant="gold"
              onClick={() => createDeckMutation.mutate()}
              disabled={!deckName || createDeckMutation.isPending}
            >
              {createDeckMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
