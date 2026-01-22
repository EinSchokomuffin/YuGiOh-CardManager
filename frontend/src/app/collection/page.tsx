"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  MoreVertical,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import apiClient from "@/lib/api";
import type { CollectionItem, PortfolioType, CardCondition } from "@/lib/types";
import { useCollectionStore, useToastStore } from "@/lib/store";
import {
  formatPrice,
  getConditionLabel,
  getEditionLabel,
  getRarityColor,
  cn,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const PORTFOLIOS: { value: PortfolioType | "ALL"; label: string }[] = [
  { value: "ALL", label: "Alle" },
  { value: "COLLECTION", label: "Sammlung" },
  { value: "TRADES", label: "Tauschordner" },
  { value: "BULK", label: "Bulk" },
];

const CONDITIONS: { value: CardCondition | "ALL"; label: string }[] = [
  { value: "ALL", label: "Alle Zustände" },
  { value: "MINT", label: "Mint" },
  { value: "NEAR_MINT", label: "Near Mint" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "LIGHT_PLAYED", label: "Light Played" },
  { value: "PLAYED", label: "Played" },
  { value: "POOR", label: "Poor" },
];

export default function CollectionPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const { filterPortfolio, setFilterPortfolio, selectedItems, toggleSelectItem, clearSelection } =
    useCollectionStore();

  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState<CardCondition | "ALL">("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CollectionItem | null>(null);
  const limit = 25;

  const { data: collection, isLoading } = useQuery({
    queryKey: ["collection", filterPortfolio, conditionFilter, search, sortBy, sortOrder, page],
    queryFn: () =>
      apiClient.getCollection({
        portfolio: filterPortfolio !== "ALL" ? filterPortfolio : undefined,
        condition: conditionFilter !== "ALL" ? conditionFilter : undefined,
        search: search || undefined,
        sortBy,
        sortOrder,
        limit,
        offset: page * limit,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ["collection-stats"],
    queryFn: () => apiClient.getCollectionStats(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.removeFromCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
      queryClient.invalidateQueries({ queryKey: ["collection-stats"] });
      addToast({
        title: "Karte entfernt",
        description: "Die Karte wurde aus der Sammlung entfernt.",
        type: "success",
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
  });

  const handleExport = async () => {
    try {
      const data = await apiClient.exportCollection();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `duelvault-collection-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast({
        title: "Export erfolgreich",
        description: "Deine Sammlung wurde exportiert.",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Export fehlgeschlagen",
        description: "Beim Exportieren ist ein Fehler aufgetreten.",
        type: "error",
      });
    }
  };

  const confirmDelete = (item: CollectionItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const totalPages = collection ? Math.ceil(collection.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meine Sammlung</h1>
          <p className="text-muted-foreground">Verwalte deine Yu-Gi-Oh! Kartensammlung</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportieren
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Karten gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalCards || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Einzigartige Karten</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalUniqueCards || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sammlungswert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">
              {formatPrice(stats?.totalValue || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gewinn/Verlust</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-bold",
                (stats?.profitLoss || 0) >= 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {formatPrice(stats?.profitLoss || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Tabs */}
      <Tabs
        value={filterPortfolio}
        onValueChange={(v) => {
          setFilterPortfolio(v as PortfolioType | "ALL");
          setPage(0);
        }}
      >
        <TabsList>
          {PORTFOLIOS.map((p) => (
            <TabsTrigger key={p.value} value={p.value}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Karten suchen..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-10"
          />
        </div>

        <Select
          value={conditionFilter}
          onValueChange={(v) => {
            setConditionFilter(v as CardCondition | "ALL");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zustand" />
          </SelectTrigger>
          <SelectContent>
            {CONDITIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sortieren nach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Hinzugefügt</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Preis</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Collection List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : collection && collection.data.length > 0 ? (
        <>
          <div className="rounded-lg border">
            <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 p-4 text-sm font-medium">
              <div className="col-span-4">Karte</div>
              <div className="col-span-2">Set</div>
              <div className="col-span-2">Zustand</div>
              <div className="col-span-1 text-center">Anzahl</div>
              <div className="col-span-2 text-right">Wert</div>
              <div className="col-span-1"></div>
            </div>

            {collection.data.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center gap-4 border-b p-4 last:border-b-0 hover:bg-muted/30"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded">
                    <Image
                      src={
                        item.printing.card.imageUrlSmall || item.printing.card.imageUrl
                      }
                      alt={item.printing.card.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.printing.card.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.printing.card.type}
                    </p>
                  </div>
                </div>

                <div className="col-span-2">
                  <p className="font-mono text-sm">{item.printing.setCode}</p>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", getRarityColor(item.printing.rarity))}
                  >
                    {item.printing.rarity}
                  </Badge>
                </div>

                <div className="col-span-2">
                  <p className="text-sm">{getConditionLabel(item.condition)}</p>
                  <p className="text-xs text-muted-foreground">
                    {getEditionLabel(item.edition)} • {item.language}
                  </p>
                </div>

                <div className="col-span-1 text-center">
                  <Badge variant="secondary">{item.quantity}x</Badge>
                </div>

                <div className="col-span-2 text-right">
                  <p className="font-medium text-green-500">
                    {formatPrice((item.printing.price || 0) * item.quantity)}
                  </p>
                  {item.purchasePrice && (
                    <p className="text-xs text-muted-foreground">
                      EK: {formatPrice(item.purchasePrice * item.quantity)}
                    </p>
                  )}
                </div>

                <div className="col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => confirmDelete(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {collection.total} Karten insgesamt
            </p>
            <div className="flex items-center gap-2">
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
          </div>
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Keine Karten in der Sammlung. Füge Karten über die Kartensuche hinzu.
          </p>
          <Button asChild className="mt-4" variant="gold">
            <a href="/cards">Karten suchen</a>
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Karte entfernen?</DialogTitle>
            <DialogDescription>
              Möchtest du &quot;{itemToDelete?.printing.card.name}&quot; wirklich aus deiner
              Sammlung entfernen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Entfernen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
