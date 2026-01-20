/**
 * Reusable TableRowActions component for consistent admin edit/delete buttons
 * Provides tooltips, confirmation dialogs, and admin-only visibility
 */

'use client';

import React, { useState } from 'react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Props for TableRowActions component
 */
export interface TableRowActionsProps {
  /** Callback when edit button is clicked */
  onEdit?: () => void;

  /** Callback when delete is confirmed */
  onDelete?: () => void;

  /** Entity name for confirmation message (e.g., "league", "event") */
  entityName: string;

  /** Warning message for delete confirmation (e.g., cascade info) */
  deleteWarning?: string;

  /** Show edit button (default: true) */
  showEdit?: boolean;

  /** Show delete button (default: true) */
  showDelete?: boolean;

  /** Disable all buttons */
  disabled?: boolean;

  /** Is delete mutation pending */
  isDeleting?: boolean;
}

/**
 * TableRowActions component with edit/delete buttons
 * Includes tooltips and delete confirmation dialog
 */
export function TableRowActions({
  onEdit,
  onDelete,
  entityName,
  deleteWarning,
  showEdit = true,
  showDelete = true,
  disabled = false,
  isDeleting = false
}: TableRowActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    onDelete?.();
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Edit Button */}
        {showEdit && onEdit && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2"
                  onClick={e => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  disabled={disabled}
                >
                  <PencilIcon className="h-4 w-4" />
                  <span className="sr-only">Edit {entityName}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit {entityName}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Delete Button */}
        {showDelete && onDelete && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2"
                  onClick={e => {
                    e.stopPropagation();
                    setDeleteDialogOpen(true);
                  }}
                  disabled={disabled || isDeleting}
                >
                  <TrashIcon className="h-4 w-4" />
                  <span className="sr-only">Delete {entityName}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete {entityName}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this {entityName}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
              {deleteWarning && ` ${deleteWarning}`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
