"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Loader2,
  ArrowUpDown,
  ExternalLink,
  DollarSign,
  BarChart3,
} from "lucide-react";
import apiClient from "@/lib/api";
import { cn, formatPrice, getRarityColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MarketPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "name" | "change">("price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch collection for price tracking
  const { data: collectionData, isLoading: collectionLoading } = useQuery({
    queryKey: ["collection"],
    queryFn: () => apiClient.getCollection(),
  });
  
  const collection = collectionData?.data;

  // Fetch price data for search
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["card-search-market", searchQuery],
    queryFn: () => apiClient.searchCards({ name: searchQuery, limit: 10 }),
    enabled: searchQuery.length >= 3,
  });

  // Calculate market stats from collection
  const marketStats = {
    totalValue: collection?.reduce((sum, item) => {
      const price = item.printing?.price || 0;
      return sum + price * item.quantity;
    }, 0) || 0,
    avgCardValue: collection?.length
      ? (collection.reduce((sum, item) => sum + (item.printing?.price || 0) * item.quantity, 0) /
          collection.reduce((sum, item) => sum + item.quantity, 0)) || 0
      : 0,
    mostValuable: collection
      ?.sort((a, b) => (b.printing?.price || 0) - (a.printing?.price || 0))
      .slice(0, 5) || [],
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Markt & Preise</h1>
        <p className="text-muted-foreground">
          Verfolge Preise und analysiere deinen Sammlungswert
        </p>
      </div>

      {/* Market Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <DollarSign className="h-8 w-8 text-green-500" />
              <Badge variant="outline" className="text-green-500">
                <TrendingUp className="mr-1 h-3 w-3" />
                +2.3%
              </Badge>
            </div>
            <p className="mt-4 text-2xl font-bold">
              {formatPrice(marketStats.totalValue)}
            </p>
            <p className="text-sm text-muted-foreground">Gesamtwert</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <Badge variant="outline">Durchschnitt</Badge>
            </div>
            <p className="mt-4 text-2xl font-bold">
              {formatPrice(marketStats.avgCardValue)}
            </p>
            <p className="text-sm text-muted-foreground">Pro Karte</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
              <Badge variant="outline" className="text-emerald-500">Top Gewinner</Badge>
            </div>
            <p className="mt-4 text-2xl font-bold">+15.8%</p>
            <p className="text-sm text-muted-foreground">Diese Woche</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <TrendingDown className="h-8 w-8 text-red-500" />
              <Badge variant="outline" className="text-red-500">Top Verlierer</Badge>
            </div>
            <p className="mt-4 text-2xl font-bold">-8.2%</p>
            <p className="text-sm text-muted-foreground">Diese Woche</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Price Search */}
        <Card>
          <CardHeader>
            <CardTitle>Preissuche</CardTitle>
            <CardDescription>
              Suche nach aktuellen Marktpreisen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Kartenname eingeben..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {searchLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : searchResults && searchResults.data.length > 0 ? (
                searchResults.data.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center gap-4 rounded-lg border p-3"
                  >
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded">
                      <Image
                        src={card.imageUrlSmall || card.imageUrl}
                        alt={card.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{card.name}</p>
                      <p className="text-sm text-muted-foreground">{card.type}</p>
                    </div>
                    <div className="text-right">
                      {card.printings && card.printings.length > 0 && (
                        <>
                          <p className="font-bold text-green-500">
                            {formatPrice(card.printings[0].price || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {card.printings[0].setCode}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : searchQuery.length >= 3 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Keine Ergebnisse gefunden
                </p>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Mindestens 3 Zeichen eingeben
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Value Cards */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Wertvollste Karten</CardTitle>
                <CardDescription>Die Top-Karten deiner Sammlung</CardDescription>
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Nach Preis</SelectItem>
                  <SelectItem value="name">Nach Name</SelectItem>
                  <SelectItem value="change">Nach Änderung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {collectionLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : marketStats.mostValuable.length > 0 ? (
              <div className="space-y-3">
                {marketStats.mostValuable.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border p-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                      #{index + 1}
                    </span>
                    <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded">
                      {item.printing?.card?.imageUrlSmall && (
                        <Image
                          src={item.printing.card.imageUrlSmall}
                          alt={item.printing.card.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">
                        {item.printing?.card?.name || "Unknown"}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {item.printing?.setCode}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getRarityColor(item.printing?.rarity || "")
                          )}
                        >
                          {item.printing?.rarity}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">
                        {formatPrice((item.printing?.price || 0) * item.quantity)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        x{item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                Keine Karten in der Sammlung
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Price History Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Preisentwicklung</CardTitle>
          <CardDescription>
            Historische Wertentwicklung deiner Sammlung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">Preis-Chart kommt bald</p>
              <p className="text-sm">
                Verfolge die Wertentwicklung deiner Sammlung über Zeit
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Market Links */}
      <Card>
        <CardHeader>
          <CardTitle>Externe Marktplätze</CardTitle>
          <CardDescription>
            Kaufe und verkaufe Karten auf beliebten Plattformen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="https://www.cardmarket.com/de/YuGiOh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <ExternalLink className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Cardmarket</p>
                <p className="text-sm text-muted-foreground">EU Marktplatz</p>
              </div>
            </a>

            <a
              href="https://www.tcgplayer.com/search/yugioh/product"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <ExternalLink className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="font-medium">TCGPlayer</p>
                <p className="text-sm text-muted-foreground">US Marktplatz</p>
              </div>
            </a>

            <a
              href="https://www.ebay.de/sch/i.html?_nkw=yugioh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <ExternalLink className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-medium">eBay</p>
                <p className="text-sm text-muted-foreground">Auktionen</p>
              </div>
            </a>

            <a
              href="https://www.db.yugioh-card.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <ExternalLink className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">Official DB</p>
                <p className="text-sm text-muted-foreground">Offizielle Datenbank</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
