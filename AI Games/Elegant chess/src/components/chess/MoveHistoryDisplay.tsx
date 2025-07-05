
"use client";

import React, { useEffect, useRef } from 'react';
import type { MoveHistoryEntry } from '@/lib/chess-types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MoveHistoryDisplayProps {
  history: MoveHistoryEntry[];
}

const MoveHistoryDisplay: React.FC<MoveHistoryDisplayProps> = ({ history }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [history]);

  return (
    <Card className="flex flex-col flex-grow min-h-0 shadow-sm w-full">
      <CardHeader className="p-2 sm:p-3">
        <CardTitle className="text-sm sm:text-base text-center">Move History</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow min-h-0 p-0">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs sm:text-sm text-muted-foreground">No moves yet.</p>
          </div>
        ) : (
        <ScrollArea className="h-full w-full p-2 sm:p-3" ref={scrollAreaRef}>
          <table className="w-full text-xs sm:text-sm">
            <tbody>
              {history.map((entry, index) => (
                <tr key={index} className="border-b border-border last:border-b-0">
                  <td className="py-1 pr-1 sm:pr-2 text-right text-muted-foreground w-[1.5em] sm:w-[2em]">{entry.moveNumber}.</td>
                  <td className="py-1 px-1 sm:px-2 font-medium">{entry.white}</td>
                  <td className="py-1 px-1 sm:px-2 font-medium">{entry.black || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default MoveHistoryDisplay;
