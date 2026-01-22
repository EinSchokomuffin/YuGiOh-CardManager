"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Download,
  Trash2,
  Loader2,
  ArrowUpDown,
  Package,
  TrendingUp,
  Wallet,
  Sparkles,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import apiClient from "@/lib/api";
import type { CollectionItem, PortfolioType, CardCondition } from "@/lib/types";
import { useCollectionStore, useToastStore, useAuthStore } from "@/lib/store";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const PORTFOLIOS: { value: PortfolioType | "ALL"; label: string; icon: string }[] = [
  { value: "ALL", label: "Alle Karten", icon: "📚" },
  { value: "COLLECTION", label: "Sammlung", icon: "⭐" },
  { value: "TRADES", label: "Tauschordner", icon: "🔄" },
  { value: "BULK", label: "Bulk", icon: "📦" },
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const { isAuthenticated, user } = useAuthStore();
  const { filterPortfolio, setFilterPortfolio } = useCollectionStore();

  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState<CardCondition | "ALL">("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CollectionItem | null>(null);
  const limit = 24;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

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
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery({
    queryKey: ["collection-stats"],
    queryFn: () => apiClient.getCollectionStats(),
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.removeFromCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection"] });
      queryClient.invalidateQueries({ queryKey: ["collection-stats"] });
      addToast({
        title: "Karte entfernt",
        description: "Die Karte wurde aus deiner Sammlung entfernt.",
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
      a.download = `duelvault-${user?.username || "collection"}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast({
        title: "Export erfolgreich",
        description: "Deine Sammlung wurde als JSON exportiert.",
        type: "success",
      });
    } catch {
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

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-purple-600/10 to-amber-500/20 border border-amber-500/20 p-8">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-amber-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
              {user?.username ? `${user.username}s Sammlung` : "Meine Sammlung"}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Verwalte und organisiere deine Yu-Gi-Oh! Kartensammlung
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Package className="h-4 w-4" />
                <span className="text-sm">Karten gesamt</span>
              </div>
              <p className="text-3xl font-bold">{stats?.totalCards || 0}</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Grid3X3 className="h-4 w-4" />
                <span className="text-sm">Einzigartig</span>
              </div>
              <p className="text-3xl font-bold">{stats?.totalUniqueCards || 0}</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">Gesamtwert</span>
              </div>
              <p className="text-3xl font-bold text-green-400">
                {formatPrice(stats?.totalValue || 0)}
              </p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Gewinn/Verlust</span>
              </div>
              <p className={cn(
                "text-3xl font-bold",
                (stats?.profitLoss || 0) >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {(stats?.profitLoss || 0) >= 0 ? "+" : ""}{formatPrice(stats?.profitLoss || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Tabs */}
      <div className="flex flex-wrap gap-2">
        {PORTFOLIOS.map((p) => (
          <button
            key={p.value}
            onClick={() => {
              setFilterPortfolio(p.value);
              setPage(0);
            }}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
              filterPortfolio === p.value
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/25"
                : "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Karten suchen..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-12 h-12 bg-secondary/50 border-0 text-lg"
          />
        </div>

        <Select
          value={conditionFilter}
          onValueChange={(v) => {
            setConditionFilter(v as CardCondition | "ALL");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[160px] h-12 bg-secondary/50 border-0">
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
          <SelectTrigger className="w-[160px] h-12 bg-secondary/50 border-0">
            <SelectValue placeholder="Sortieren" />
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
          className="h-12 w-12"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          <ArrowUpDown className={cn("h-5 w-5", sortOrder === "asc" && "rotate-180")} />
        </Button>

        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="h-10 w-10"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            className="h-10 w-10"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={handleExport} className="h-12 bg-secondary/50 hover:bg-secondary text-foreground border-0">
          <Download className="mr-2 h-5 w-5" />
          Export
        </Button>
      </div>

      {/* Collection Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-amber-400 mb-4" />
          <p className="text-muted-foreground">Sammlung wird geladen...</p>
        </div>
      ) : collection && collection.data.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {collection.data.map((item) => (
                <Card
                  key={item.id}
                  className="group relative overflow-hidden bg-secondary/30 border-0 hover:bg-secondary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/10"
                >
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={item.printing.card.imageUrl}
                      alt={item.printing.card.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Quantity Badge */}
                    {item.quantity > 1 && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-black font-bold px-2 py-1 rounded-full text-sm">
                        {item.quantity}x
                      </div>
                    )}
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(item);
                      }}
                      className="absolute top-2 left-2 p-2 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    {/* Price */}
                    <div className="absolute bottom-2 right-2 bg-green-500/90 text-white font-bold px-2 py-1 rounded text-sm">
                      {formatPrice((item.printing.price || 0) * item.quantity)}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">{item.printing.card.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-mono text-muted-foreground">{item.printing.setCode}</span>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getRarityColor(item.printing.rarity))}
                      >
                        {item.printing.rarityCode}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getConditionLabel(item.condition)} • {item.language}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-border/50">
              <div className="grid grid-cols-12 gap-4 bg-secondary/50 p-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-5">Karte</div>
                <div className="col-span-2">Set / Seltenheit</div>
                <div className="col-span-2">Zustand</div>
                <div className="col-span-1 text-center">Anzahl</div>
                <div className="col-span-1 text-right">Wert</div>
                <div className="col-span-1"></div>
              </div>

              {collection.data.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-4 p-4 border-t border-border/30 hover:bg-secondary/30 transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-4">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg shadow-md">
                      <Image
                        src={item.printing.card.imageUrlSmall || item.printing.card.imageUrl}
                        alt={item.printing.card.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.printing.card.name}</p>
                      <p className="text-sm text-muted-foreground">{item.printing.card.type}</p>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <p className="font-mono text-sm">{item.printing.setCode}</p>
                    <Badge
                      variant="outline"
                      className={cn("text-xs mt-1", getRarityColor(item.printing.rarity))}
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
                    <span className="inline-flex items-center justify-center bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-full">
                      {item.quantity}x
                    </span>
                  </div>

                  <div className="col-span-1 text-right">
                    <p className="font-bold text-green-400">
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
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => confirmDelete(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              {collection.total} Karten in deiner Sammlung
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-10 w-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = page < 2 ? i : page > totalPages - 3 ? totalPages - 5 + i : page - 2 + i;
                  if (pageNum < 0 || pageNum >= totalPages) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "ghost"}
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
                className="h-10 w-10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 mb-6">
            <Package className="h-10 w-10 text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Noch keine Karten</h3>
          <p className="text-muted-foreground mb-6">
            Deine Sammlung ist noch leer. Füge Karten über die Kartensuche hinzu!
          </p>
          <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold hover:from-amber-400 hover:to-yellow-400">
            <Link href="/cards">
              <Sparkles className="mr-2 h-5 w-5" />
              Karten durchsuchen
            </Link>
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl">Karte entfernen?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Möchtest du <span className="font-semibold text-foreground">&quot;{itemToDelete?.printing.card.name}&quot;</span> wirklich aus deiner Sammlung entfernen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entfernen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
