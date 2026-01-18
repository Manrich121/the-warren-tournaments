"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";
import { ScoringSystemDialog } from "./scoring-system-dialog";
import { useScoringSystems } from "@/hooks/scoring-systems";
import { format } from "date-fns";

export function ScoringSystemTable() {
  const { data: systems, isLoading } = useScoringSystems();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Scoring Systems</h2>
          <p className="text-muted-foreground">
            Configure how players earn points in leagues
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Scoring System
        </Button>
      </div>

      {/* Table */}
      {!systems || systems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium mb-2">No scoring systems yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first scoring system to get started
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Scoring System
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Formulas</TableHead>
                <TableHead className="text-center">Tie-Breakers</TableHead>
                <TableHead className="text-center">Leagues</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systems.map((system) => (
                <TableRow key={system.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {system.name}
                      {system.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {system.formulaCount}
                  </TableCell>
                  <TableCell className="text-center">
                    {system.tieBreakerCount}
                  </TableCell>
                  <TableCell className="text-center">
                    {system.leagueCount}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(system.createdAt), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog */}
      <ScoringSystemDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
