"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Library,
  TrendingUp,
  Layers,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["collection-stats"],
    queryFn: () => apiClient.getCollectionStats(),
  });

  const { data: topCards, isLoading: topCardsLoading } = useQuery({
    queryKey: ["top-value-cards"],
    queryFn: () => apiClient.getTopValueCards(5),
  });

  const { data: cardStats } = useQuery({
    queryKey: ["card-stats"],
    queryFn: () => apiClient.getCardStats(),
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Übersicht deiner Yu-Gi-Oh! Kartensammlung
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamte Karten</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.totalCards || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalUniqueCards || 0} einzigartige Karten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sammlungswert</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : formatPrice(stats?.totalValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Einkaufswert: {formatPrice(stats?.totalPurchaseValue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gewinn/Verlust</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (stats?.profitLoss || 0) >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {statsLoading ? "..." : formatPrice(stats?.profitLoss || 0)}
            </div>
            <div className="flex items-center text-xs">
              {(stats?.profitLoss || 0) >= 0 ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className="text-muted-foreground">
                {stats?.totalPurchaseValue
                  ? (
                      ((stats.profitLoss || 0) / stats.totalPurchaseValue) *
                      100
                    ).toFixed(1)
                  : 0}
                % Rendite
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datenbank</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardStats?.totalCards || 0}</div>
            <p className="text-xs text-muted-foreground">
              {cardStats?.totalPrintings || 0} Drucke verfügbar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Verteilung</CardTitle>
            <CardDescription>Aufteilung deiner Sammlung nach Kategorie</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.portfolioBreakdown &&
              Object.entries(stats.portfolioBreakdown).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{key.toLowerCase()}</span>
                    <span className="font-medium">
                      {value.count} Karten ({formatPrice(value.value)})
                    </span>
                  </div>
                  <Progress
                    value={(value.count / (stats.totalCards || 1)) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            {!stats?.portfolioBreakdown ||
              (Object.keys(stats.portfolioBreakdown).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Noch keine Karten in der Sammlung
                </p>
              ))}
          </CardContent>
        </Card>

        {/* Top Value Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Wertvollste Karten</CardTitle>
            <CardDescription>Top 5 Karten nach aktuellem Marktwert</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCardsLoading ? (
                <p className="text-sm text-muted-foreground">Lädt...</p>
              ) : topCards && topCards.length > 0 ? (
                topCards.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div className="relative h-12 w-9 overflow-hidden rounded">
                      <Image
                        src={item.printing.card.imageUrlSmall || item.printing.card.imageUrl}
                        alt={item.printing.card.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{item.printing.card.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.printing.setCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-500">
                        {formatPrice(item.totalValue)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        x{item.quantity}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Noch keine Karten in der Sammlung
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/cards"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="rounded-full bg-primary/10 p-2">
                <Library className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Karten suchen</p>
                <p className="text-xs text-muted-foreground">
                  Durchsuche die Datenbank
                </p>
              </div>
            </a>

            <a
              href="/collection"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="rounded-full bg-green-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Sammlung verwalten</p>
                <p className="text-xs text-muted-foreground">
                  Bearbeite deine Karten
                </p>
              </div>
            </a>

            <a
              href="/decks"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="rounded-full bg-blue-500/10 p-2">
                <Layers className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Deck Builder</p>
                <p className="text-xs text-muted-foreground">
                  Erstelle neue Decks
                </p>
              </div>
            </a>

            <a
              href="/collection?export=true"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <div className="rounded-full bg-purple-500/10 p-2">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">Export</p>
                <p className="text-xs text-muted-foreground">
                  Backup erstellen
                </p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
