"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Grid, List, Filter, Loader2, Globe } from "lucide-react";
import apiClient from "@/lib/api";
import type { Card } from "@/lib/types";
import { useCardSearchStore, useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardGridItem, CardListItem } from "@/components/cards/card-item";
import { CardDetailModal } from "@/components/cards/card-detail-modal";

const CARD_TYPES = [
  "Effect Monster",
  "Normal Monster",
  "Fusion Monster",
  "Synchro Monster",
  "XYZ Monster",
  "Link Monster",
  "Ritual Monster",
  "Spell Card",
  "Trap Card",
];

const ATTRIBUTES = ["DARK", "LIGHT", "EARTH", "WATER", "FIRE", "WIND", "DIVINE"];

const LANGUAGES = [
  { value: "DE", label: "🇩🇪 Deutsch" },
  { value: "EN", label: "🇬🇧 English" },
  { value: "FR", label: "🇫🇷 Français" },
  { value: "IT", label: "🇮🇹 Italiano" },
  { value: "PT", label: "🇵🇹 Português" },
] as const;

export default function CardsPage() {
  const { searchQuery, setSearchQuery, filters, setFilters, clearFilters } =
    useCardSearchStore();
  const { user, isAuthenticated, setSearchLanguage } = useAuthStore();
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Get current search language (default to DE if not logged in)
  const searchLanguage = user?.searchLanguage || "DE";

  // Mutation to update language preference
  const languageMutation = useMutation({
    mutationFn: (language: 'DE' | 'EN' | 'FR' | 'IT' | 'PT') => 
      apiClient.updatePreferences({ searchLanguage: language }),
    onSuccess: (data) => {
      setSearchLanguage(data.searchLanguage);
    },
  });

  const handleLanguageChange = (language: string) => {
    if (isAuthenticated) {
      languageMutation.mutate(language as 'DE' | 'EN' | 'FR' | 'IT' | 'PT');
    }
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["cards", searchQuery, filters, page, searchLanguage],
    queryFn: () =>
      apiClient.searchCards({
        name: searchQuery || undefined,
        type: filters.type,
        attribute: filters.attribute,
        archetype: filters.archetype,
        limit,
        offset: page * limit,
      }),
    placeholderData: (prev) => prev,
  });

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(0);
  }, []);

  const handleSelectCard = (card: Card) => {
    setSelectedCard(card);
    setDetailModalOpen(true);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Karten suchen</h1>
        <p className="text-muted-foreground">
          Durchsuche über 12.000 Yu-Gi-Oh! Karten
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Kartenname suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Suchen</Button>
        </form>

        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={filters.type || "all"}
            onValueChange={(v) => setFilters({ type: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kartentyp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              {CARD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.attribute || "all"}
            onValueChange={(v) => setFilters({ attribute: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Attribut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Attribute</SelectItem>
              {ATTRIBUTES.map((attr) => (
                <SelectItem key={attr} value={attr}>
                  {attr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Archetyp..."
            value={filters.archetype || ""}
            onChange={(e) => setFilters({ archetype: e.target.value || undefined })}
            className="w-[180px]"
          />

          {/* Language Switcher */}
          <Select
            value={searchLanguage}
            onValueChange={handleLanguageChange}
            disabled={!isAuthenticated || languageMutation.isPending}
          >
            <SelectTrigger className="w-[160px]">
              <Globe className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sprache" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" onClick={clearFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Filter zurücksetzen
          </Button>

          <div className="ml-auto flex gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {data && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {data.total} Karten gefunden
            {isFetching && <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />}
          </p>
          <p>
            Seite {page + 1} von {totalPages || 1}
          </p>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {data.data.map((card) => (
                <CardGridItem
                  key={card.id}
                  card={card}
                  onSelect={handleSelectCard}
                  onAddToCollection={handleSelectCard}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data.data.map((card) => (
                <CardListItem
                  key={card.id}
                  card={card}
                  onSelect={handleSelectCard}
                  onAddToCollection={handleSelectCard}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Zurück
            </Button>
            <span className="px-4 text-sm">
              Seite {page + 1} von {totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Weiter
            </Button>
          </div>
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Keine Karten gefunden. Versuche eine andere Suche.
          </p>
        </div>
      )}

      {/* Card Detail Modal */}
      <CardDetailModal
        card={selectedCard}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
