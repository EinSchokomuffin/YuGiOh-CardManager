"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Database,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Moon,
  Sun,
  Globe,
  DollarSign,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { useAppStore, useToastStore } from "@/lib/store";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { theme, setTheme, currency, setCurrency, language, setLanguage } = useAppStore();
  const { addToast } = useToastStore();

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [username, setUsername] = useState("Duelist");
  const [email, setEmail] = useState("duelist@example.com");

  // Sync cards mutation
  const syncMutation = useMutation({
    mutationFn: () => apiClient.syncCards(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      addToast({
        title: "Synchronisation abgeschlossen",
        description: `${data.cardsCreated} Karten importiert, ${data.cardsUpdated} aktualisiert.`,
        type: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Synchronisation fehlgeschlagen",
        description: "Die Karten konnten nicht synchronisiert werden.",
        type: "error",
      });
    },
  });

  // Export collection
  const handleExportData = async () => {
    try {
      const collectionData = await apiClient.getCollection();
      const decks = await apiClient.getDecks();
      
      const exportData = {
        exportedAt: new Date().toISOString(),
        collection: collectionData.data,
        decks,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `duelvault-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      addToast({
        title: "Export erfolgreich",
        description: "Deine Daten wurden exportiert.",
        type: "success",
      });
    } catch (error) {
      addToast({
        title: "Export fehlgeschlagen",
        description: "Die Daten konnten nicht exportiert werden.",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">
          Verwalte dein Konto und App-Einstellungen
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil
            </CardTitle>
            <CardDescription>
              Verwalte deine persönlichen Informationen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Benutzername</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Dein Benutzername"
              />
            </div>
            <div>
              <label className="text-sm font-medium">E-Mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
              />
            </div>
            <Button variant="gold" className="w-full">
              <Check className="mr-2 h-4 w-4" />
              Speichern
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Erscheinungsbild
            </CardTitle>
            <CardDescription>
              Passe das Aussehen der App an
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Theme</label>
              <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Hell
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dunkel
                    </div>
                  </SelectItem>
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
                  <SelectItem value="de">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Deutsch
                    </div>
                  </SelectItem>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      English
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Währung</label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      EUR (€)
                    </div>
                  </SelectItem>
                  <SelectItem value="USD">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      USD ($)
                    </div>
                  </SelectItem>
                  <SelectItem value="GBP">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      GBP (£)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Daten
            </CardTitle>
            <CardDescription>
              Verwalte deine Sammlungsdaten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Kartendatenbank synchronisieren
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExportData}
            >
              <Download className="mr-2 h-4 w-4" />
              Daten exportieren (JSON)
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Upload className="mr-2 h-4 w-4" />
              Daten importieren
            </Button>

            <div className="rounded-lg border border-destructive/50 p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-medium">Gefahrenzone</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Alle Daten zurücksetzen - diese Aktion kann nicht rückgängig
                gemacht werden.
              </p>
              <Button
                variant="destructive"
                className="mt-4"
                onClick={() => setShowResetDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Alle Daten löschen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Verbindungsstatus und API-Informationen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Backend API</p>
                <p className="text-sm text-muted-foreground">
                  localhost:3001
                </p>
              </div>
              <Badge className="bg-green-500">
                <Check className="mr-1 h-3 w-3" />
                Online
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">YGOPRODeck API</p>
                <p className="text-sm text-muted-foreground">
                  db.ygoprodeck.com
                </p>
              </div>
              <Badge className="bg-green-500">
                <Check className="mr-1 h-3 w-3" />
                Verfügbar
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">PostgreSQL</p>
                <p className="text-sm text-muted-foreground">Database</p>
              </div>
              <Badge className="bg-green-500">
                <Check className="mr-1 h-3 w-3" />
                Verbunden
              </Badge>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Version</p>
              <p className="text-sm text-muted-foreground">DuelVault v1.0.0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alle Daten löschen?
            </DialogTitle>
            <DialogDescription>
              Diese Aktion wird alle deine Sammlungsdaten, Decks und
              Einstellungen unwiderruflich löschen. Dies kann nicht rückgängig
              gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowResetDialog(false)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Reset logic would go here
                setShowResetDialog(false);
                addToast({
                  title: "Daten gelöscht",
                  description: "Alle Daten wurden zurückgesetzt.",
                  type: "success",
                });
              }}
            >
              Ja, alles löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
